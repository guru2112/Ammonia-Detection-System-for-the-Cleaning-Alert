from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_mail import Mail, Message
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timezone, timedelta
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from bson import ObjectId
import requests
import jwt
from functools import wraps
 

# ----------------------------
# Load environment variables
# ----------------------------
load_dotenv()
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
CORS(app, resources={r"/*": {"origins": "*"}})

# ----------------------------
# MongoDB Setup
# ----------------------------
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["IoE"]
users_collection = db["users"]
# Respect exact collection names as specified: Admin, Workers, users
workers_collection = db["Workers"]
admins_collection = db["Admin"]
activity_logs_collection = db["activity_logs"]
sensor_collection = db["sensor_readings"]
reports_collection = db["reports"]
deactivated_reports_collection = db["deactivated_reports"]

with app.app_context():
    sensor_collection.create_index("timestamp", expireAfterSeconds=120)

# ----------------------------
# Flask-Mail Config
# ----------------------------
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USERNAME'] = os.getenv("MAIL_USERNAME")
app.config['MAIL_PASSWORD'] = os.getenv("MAIL_PASSWORD")
app.config['MAIL_USE_TLS'] = False
app.config['MAIL_USE_SSL'] = True
app.config['MAIL_DEFAULT_SENDER'] = os.getenv("MAIL_USERNAME")
mail = Mail(app)

# ----------------------------
# Sensor Alert Config
# ----------------------------
AMMONIA_THRESHOLD = 6.0  # ppm
ALERT_COUNT_THRESHOLD = 4
high_ammonia_readings = 0

# ----------------------------
# Auth Helper Functions
# ----------------------------
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        
        if auth_header:
            try:
                token = auth_header.split(" ")[1]  # Bearer <token>
            except IndexError:
                return jsonify({'error': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            email = data.get('email')
            role = data.get('role')

            # Validate user exists and enrich with role
            current_user = None
            if role == 'admin':
                current_user = admins_collection.find_one({"email": email})
            elif role == 'worker':
                current_user = workers_collection.find_one({"email": email})
            else:
                current_user = users_collection.find_one({"email": email})

            # Fallback search if not found in expected collection
            if not current_user:
                current_user = (
                    admins_collection.find_one({"email": email})
                    or workers_collection.find_one({"email": email})
                    or users_collection.find_one({"email": email})
                )
                # Infer role from collection if found
                if current_user:
                    if admins_collection.find_one({"email": email}):
                        role = 'admin'
                    elif workers_collection.find_one({"email": email}):
                        role = 'worker'
                    else:
                        role = 'user'

            if not current_user:
                return jsonify({'error': 'Invalid token'}), 401
            current_user['role'] = role or 'user'
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        
        return f(current_user, *args, **kwargs)
    return decorated

def generate_token(email, role: str):
    payload = {
        'email': email,
        'role': role,
        'exp': datetime.utcnow() + timedelta(hours=24)  # Token expires in 24 hours
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')

def roles_required(allowed_roles):
    def decorator(f):
        @wraps(f)
        def wrapper(current_user, *args, **kwargs):
            role = (current_user or {}).get('role', 'user')
            if role not in allowed_roles:
                return jsonify({'error': 'Forbidden: insufficient permissions'}), 403
            return f(current_user, *args, **kwargs)
        return wrapper
    return decorator

def log_activity(event_type, actor_email, details=None):
    try:
        activity_logs_collection.insert_one({
            "event_type": event_type,
            "actor": actor_email,
            "details": details or {},
            "timestamp": datetime.now(timezone.utc)
        })
    except Exception as e:
        # Avoid breaking flows due to logging issues
        print("Activity log error:", e)

# ----------------------------
# Auth APIs
# ----------------------------
@app.route("/api/signup", methods=["POST"])
def signup():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    name = data.get("name")

    if not email or not password or not name:
        return jsonify({"error": "Missing fields"}), 400
    if users_collection.find_one({"email": email}):
        return jsonify({"error": "Email already exists"}), 409

    hashed_pw = generate_password_hash(password)
    users_collection.insert_one({
        "name": name,
        "email": email,
        "password": hashed_pw
    })
    log_activity("user_signup", email, {"name": name})
    return jsonify({"message": "Signup successful"}), 201

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Missing fields"}), 400

    role = None
    account = admins_collection.find_one({"email": email})
    if account and check_password_hash(account["password"], password):
        role = 'admin'
    else:
        account = workers_collection.find_one({"email": email})
        if account and check_password_hash(account["password"], password):
            role = 'worker'
        else:
            account = users_collection.find_one({"email": email})
            if account and check_password_hash(account["password"], password):
                role = 'user'

    if not role:
        return jsonify({"error": "Invalid credentials"}), 401

    # Generate JWT token with role
    token = generate_token(email, role)

    log_activity("login", email, {"role": role})

    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": {
            "name": account.get("name", ""),
            "email": account.get("email", ""),
            "role": role
        }
    }), 200

@app.route("/api/verify-token", methods=["GET"])
@token_required
def verify_token(current_user):
    return jsonify({
        "valid": True,
        "user": {
            "name": current_user["name"],
            "email": current_user["email"],
            "role": current_user.get("role", "user")
        }
    }), 200

# ----------------------------
# New Sensor Data Ingestion API (for ESP32 to send data)
# ----------------------------
@app.route("/api/sensor-data", methods=["POST"])
def receive_sensor_data():
    global high_ammonia_readings
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data received"}), 400

    record = {
        "ammonia_ppm": data.get("ammonia_ppm"),
        "temperature": data.get("temperature"),
        "humidity": data.get("humidity"),
        "timestamp": datetime.now(timezone.utc)
    }

    sensor_collection.insert_one(record)

    # ---------- Check ammonia threshold ----------
    if record["ammonia_ppm"] is not None:
        if record["ammonia_ppm"] > AMMONIA_THRESHOLD:
            high_ammonia_readings += 1
            print(f"High reading count: {high_ammonia_readings}")
        else:
            high_ammonia_readings = 0  # reset counter

    # ---------- Send Alert Email ----------
    if high_ammonia_readings >= ALERT_COUNT_THRESHOLD:
        try:
            ts_str = record["timestamp"].astimezone(timezone.utc).isoformat()
            msg = Message(
                subject="⚠️ Ammonia Alert!",
                recipients=["kamleshsolaskar8@gmail.com"],  # Replace with your email
                body=f"Ammonia level is {record['ammonia_ppm']} ppm at {ts_str}.\n"
                     f"Temperature: {record['temperature']} °C\n"
                     f"Humidity: {record['humidity']} %"
            )
            mail.send(msg)
            print("Alert email sent!")
            high_ammonia_readings = 0  # reset counter
        except Exception as e:
            print("Error sending email:", e)

    log_activity("sensor_data_ingested", None, {"ammonia_ppm": record.get("ammonia_ppm")})
    return jsonify({"status": "success"}), 200

# ----------------------------
# Sensor Data Retrieval API (Dashboard etc.)
# ----------------------------
@app.route("/api/ammonia", methods=["GET"])
@token_required
def get_sensor_data(current_user):
    readings = list(sensor_collection.find({}, {"_id": 0}).sort("timestamp", -1).limit(50))
    for r in readings:
        if isinstance(r.get("timestamp"), datetime):
            r["timestamp"] = r["timestamp"].astimezone(timezone.utc).isoformat()
    return jsonify(readings[::-1]), 200  # return oldest first

# ----------------------------
# Manual Alerts APIs
# ----------------------------
@app.route("/api/manual-report", methods=["POST"])
def submit_manual_report():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data received"}), 400
    required_fields = ["name", "email", "latitude", "longitude", "comments"]

    if not all(field in data and data[field] for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    latitude = data["latitude"]
    longitude = data["longitude"]

    location_details = {}
    if data.get("location") and isinstance(data.get("location"), dict):
        location_details = data.get("location")
    else:
        try:
            geocode_url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={latitude}&lon={longitude}&addressdetails=1"
            res = requests.get(geocode_url, headers={"User-Agent": "IoE-App"}, timeout=5)
            res_json = res.json()
            address = res_json.get("address", {})

            location_details = {
                "country": address.get("country", ""),
                "state": address.get("state", ""),
                "city": address.get("city", address.get("town", address.get("village", ""))),
                "postcode": address.get("postcode", ""),
                "road": address.get("road", ""),
                "suburb": address.get("suburb", ""),
                "neighbourhood": address.get("neighbourhood", "")
            }
        except Exception as e:
            print("Error fetching location details:", e)
            location_details = {"error": "Could not fetch location details"}

    report = {
        "name": data["name"],
        "email": data["email"],
        "location": location_details,
        "comments": data["comments"],
        "latitude": latitude,
        "longitude": longitude,
        "timestamp": datetime.now(timezone.utc),
    }

    try:
        reports_collection.insert_one(report)
        log_activity("manual_report_submitted", report.get("email"), {"location": location_details})
        return jsonify({"message": "Manual report submitted successfully"}), 201
    except Exception as e:
        print("Error inserting manual report:", e)
        return jsonify({"error": "Failed to save report"}), 500

@app.route("/api/manual-reports", methods=["GET"])
@token_required
@roles_required(["admin", "worker"])  # Only staff/admin can view reports
def get_manual_reports(current_user):
    filters = {}
    city = request.args.get("city")
    postcode = request.args.get("postcode")
    date_from = request.args.get("date_from")
    date_to = request.args.get("date_to")

    if city:
        filters["location.city"] = city
    if postcode:
        filters["location.postcode"] = postcode

    if date_from or date_to:
        filters["timestamp"] = {}
        if date_from:
            start = datetime.strptime(date_from, "%Y-%m-%d").replace(tzinfo=timezone.utc)
            filters["timestamp"]["$gte"] = start
        if date_to:
            end_day = datetime.strptime(date_to, "%Y-%m-%d").replace(tzinfo=timezone.utc) + timedelta(days=1) - timedelta(microseconds=1)
            filters["timestamp"]["$lte"] = end_day

    docs = list(reports_collection.find(filters).sort("timestamp", -1))
    reports = []
    for doc in docs:
        r = dict(doc)
        # expose stable string id and remove Mongo _id object
        if r.get("_id") is not None:
            r["id"] = str(r.pop("_id"))
        if isinstance(r.get("timestamp"), datetime):
            r["timestamp"] = r["timestamp"].astimezone(timezone.utc).isoformat()
        reports.append(r)
    return jsonify(reports), 200

@app.route("/api/deactivated-reports", methods=["GET"])
@token_required
@roles_required(["admin", "worker"])  # Only staff/admin can view deactivated reports
def get_deactivated_reports(current_user):
    """List deactivated reports with same filters as active reports."""
    filters = {}
    city = request.args.get("city")
    postcode = request.args.get("postcode")
    date_from = request.args.get("date_from")
    date_to = request.args.get("date_to")

    if city:
        filters["location.city"] = city
    if postcode:
        filters["location.postcode"] = postcode

    if date_from or date_to:
        filters["timestamp"] = {}
        if date_from:
            start = datetime.strptime(date_from, "%Y-%m-%d").replace(tzinfo=timezone.utc)
            filters["timestamp"]["$gte"] = start
        if date_to:
            end_day = datetime.strptime(date_to, "%Y-%m-%d").replace(tzinfo=timezone.utc) + timedelta(days=1) - timedelta(microseconds=1)
            filters["timestamp"]["$lte"] = end_day

    docs = list(deactivated_reports_collection.find(filters).sort("timestamp", -1))
    reports = []
    for doc in docs:
        r = dict(doc)
        if r.get("_id") is not None:
            r["id"] = str(r.pop("_id"))
        if isinstance(r.get("timestamp"), datetime):
            r["timestamp"] = r["timestamp"].astimezone(timezone.utc).isoformat()
        reports.append(r)
    return jsonify(reports), 200

# ----------------------------
# Report Deletion API (simple)
# ----------------------------
@app.route("/api/reports/<report_id>", methods=["DELETE"])
@token_required
@roles_required(["admin", "worker"])  # Only staff/admin can delete
def delete_report(current_user, report_id):
    """Delete a report by stable id (Mongo ObjectId string) or fallback to timestamp."""
    try:
        rid = request.view_args.get('report_id')
        # Prefer ObjectId
        query = None
        try:
            oid = ObjectId(rid)
            query = {"_id": oid}
        except Exception:
            # Fallback to ISO timestamp
            try:
                ts = datetime.fromisoformat(rid.replace('Z', '+00:00'))
                query = {"timestamp": ts}
            except Exception:
                return jsonify({"error": "Invalid report id"}), 400

        result = reports_collection.delete_one(query)
        if result.deleted_count == 0:
            return jsonify({"error": "Report not found"}), 404
        log_activity("report_deleted", current_user.get("email"), {"report_id": rid})
        return jsonify({"message": "Report deleted successfully"}), 200
    except Exception as e:
        print("Error deleting report:", e)
        return jsonify({"error": "Failed to delete report"}), 500

@app.route("/api/reports/<report_id>/deactivate", methods=["PUT"])
@token_required
@roles_required(["admin", "worker"])  # Only staff/admin can deactivate
def deactivate_report(current_user, report_id):
    """Deactivate a report by moving it to the deactivated_reports collection."""
    try:
        rid = request.view_args.get('report_id')

        # Build a query: prefer ObjectId, fallback to timestamp
        query = None
        try:
            oid = ObjectId(rid)
            query = {"_id": oid}
        except Exception:
            try:
                ts = datetime.fromisoformat(rid.replace('Z', '+00:00'))
                query = {"timestamp": ts}
            except Exception:
                return jsonify({"error": "Invalid report id"}), 400

        # Fetch the document first
        doc = reports_collection.find_one(query)
        if not doc:
            return jsonify({"error": "Report not found"}), 404

        # Add deactivation metadata
        doc["status"] = "deactivated"
        doc["deactivated_at"] = datetime.now(timezone.utc)
        if current_user and current_user.get("email"):
            doc["deactivated_by"] = current_user["email"]

        # Insert into deactivated collection (keep same _id)
        deactivated_reports_collection.replace_one({"_id": doc["_id"]}, doc, upsert=True)

        # Remove from active reports
        reports_collection.delete_one({"_id": doc["_id"]})

        log_activity("report_deactivated", current_user.get("email"), {"report_id": rid})

        return jsonify({"message": "Report deactivated successfully"}), 200
    except Exception as e:
        print("Error deactivating report:", e)
        return jsonify({"error": "Failed to deactivate report"}), 500

@app.route("/api/logout", methods=["POST"])
def logout():
    session.pop("user_id", None)
    return jsonify({"message": "Logged out successfully"}), 200

# ----------------------------
# Admin and Worker Management APIs
# ----------------------------

@app.route("/api/workers", methods=["GET"])
@token_required
@roles_required(["admin"])  # Only admins can view workers
def list_workers(current_user):
    workers = []
    for w in workers_collection.find({}, {"password": 0}):
        w["id"] = str(w.pop("_id"))
        workers.append(w)
    return jsonify(workers), 200

@app.route("/api/workers", methods=["POST"])
@token_required
@roles_required(["admin"])  # Only admins can create workers
def create_worker(current_user):
    data = request.get_json() or {}
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    if not all([name, email, password]):
        return jsonify({"error": "Missing fields"}), 400
    if workers_collection.find_one({"email": email}) or admins_collection.find_one({"email": email}) or users_collection.find_one({"email": email}):
        return jsonify({"error": "Email already exists"}), 409
    workers_collection.insert_one({
        "name": name,
        "email": email,
        "password": generate_password_hash(password),
        "created_by": current_user.get("email"),
        "created_at": datetime.now(timezone.utc)
    })
    log_activity("worker_created", current_user.get("email"), {"email": email})
    return jsonify({"message": "Worker created"}), 201

@app.route("/api/workers/<worker_id>", methods=["PUT"])
@token_required
@roles_required(["admin"])  # Only admins can update workers
def update_worker(current_user, worker_id):
    data = request.get_json() or {}
    updates = {}
    if "name" in data:
        updates["name"] = data["name"]
    if "email" in data:
        # prevent duplicate emails across collections
        if (users_collection.find_one({"email": data["email"]}) or
            workers_collection.find_one({"email": data["email"], "_id": {"$ne": ObjectId(worker_id)}}) or
            admins_collection.find_one({"email": data["email"]})):
            return jsonify({"error": "Email already in use"}), 409
        updates["email"] = data["email"]
    if "password" in data and data["password"]:
        updates["password"] = generate_password_hash(data["password"])
    if not updates:
        return jsonify({"error": "No updates provided"}), 400
    try:
        res = workers_collection.update_one({"_id": ObjectId(worker_id)}, {"$set": updates})
        if res.matched_count == 0:
            return jsonify({"error": "Worker not found"}), 404
        log_activity("worker_updated", current_user.get("email"), {"worker_id": worker_id, "updates": list(updates.keys())})
        return jsonify({"message": "Worker updated"}), 200
    except Exception:
        return jsonify({"error": "Invalid worker id"}), 400

@app.route("/api/workers/<worker_id>", methods=["DELETE"])
@token_required
@roles_required(["admin"])  # Only admins can delete workers
def delete_worker(current_user, worker_id):
    try:
        res = workers_collection.delete_one({"_id": ObjectId(worker_id)})
        if res.deleted_count == 0:
            return jsonify({"error": "Worker not found"}), 404
        log_activity("worker_deleted", current_user.get("email"), {"worker_id": worker_id})
        return jsonify({"message": "Worker deleted"}), 200
    except Exception:
        return jsonify({"error": "Invalid worker id"}), 400

@app.route("/api/users", methods=["GET"])
@token_required
@roles_required(["admin"])  # Only admins can view users
def list_users(current_user):
    users = []
    for u in users_collection.find({}, {"password": 0}):
        u["id"] = str(u.pop("_id"))
        users.append(u)
    return jsonify(users), 200

@app.route("/api/activity-logs", methods=["GET"])
@token_required
@roles_required(["admin"])  # Only admins can view system activity
def get_activity_logs(current_user):
    limit = int(request.args.get("limit", 100))
    logs = []
    for log in activity_logs_collection.find({}).sort("timestamp", -1).limit(limit):
        l = dict(log)
        l["id"] = str(l.pop("_id"))
        if isinstance(l.get("timestamp"), datetime):
            l["timestamp"] = l["timestamp"].astimezone(timezone.utc).isoformat()
        logs.append(l)
    return jsonify(logs), 200

# ----------------------------
# Run the Flask App
# ----------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
