#include <WiFi.h>
#include <HTTPClient.h>
#include "DHT.h"

// MQ-137 Settings
#define MQ137_PIN 34
const float VCC = 5.0;
const float RL = 2.2;
const int numSamples = 10;
const float cleanAirFactor = 10.0;
float RO = 0;

// DHT11 Settings
#define DHTPIN 27
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

// WiFi Credentials
const char* ssid = "wifi or hotspot name";
const char* password = "password";

// Database API Endpoint
const char* dbApiUrl = "URL or path where data to be sent";

float calibrateRO() {
  float rsSum = 0;
  for (int i = 0; i < 50; i++) {
    int raw = analogRead(MQ137_PIN);
    float voltage = (raw * 3.3 / 4095.0) * ((2.2 + 3.3) / 2.2);
    float rs = RL * ((VCC / voltage) - 1);
    rsSum += rs;
    delay(100);
  }
  return (rsSum / 50.0) / cleanAirFactor;
}

float readAmmoniaPPM(float temperature, float humidity) {
  float rsSum = 0;
  for (int i = 0; i < numSamples; i++) {
    int raw = analogRead(MQ137_PIN);
    float voltage = (raw * 3.3 / 4095.0) * ((2.2 + 3.3) / 2.2);
    float rs = RL * ((VCC / voltage) - 1);
    rsSum += rs;
    delay(50);
  }
  float rsAvg = rsSum / numSamples;
  float ratio = rsAvg / RO;
  float ppm = pow(10, (log10(ratio) - 1.25) / -0.45);
  float tempComp = 1.0 + 0.02 * (temperature - 20.0);
  float humComp = 1.0 + 0.01 * (humidity - 65.0);
  ppm *= tempComp * humComp;
  return ppm;
}

void sendData(float ammoniaPPM, float tempC, float humidity) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(dbApiUrl);
    http.addHeader("Content-Type", "application/json");
    String payload = "{";
    payload += "\"ammonia_ppm\": " + String(ammoniaPPM, 2) + ",";
    payload += "\"temperature\": " + String(tempC, 1) + ",";
    payload += "\"humidity\": " + String(humidity, 1);
    payload += "}";
    int httpResponseCode = http.POST(payload);
    http.end();
  }
}

void setup() {
  Serial.begin(115200);
  dht.begin();
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) { delay(250); }
  RO = calibrateRO();
}

void loop() {
  float tempC = dht.readTemperature();
  float humidity = dht.readHumidity();
  if (isnan(tempC) || isnan(humidity)) {
    delay(2000);
    return;
  }
  float ammoniaPPM = readAmmoniaPPM(tempC, humidity);
  sendData(ammoniaPPM, tempC, humidity);
  delay(10000); // send every 10 seconds
}
