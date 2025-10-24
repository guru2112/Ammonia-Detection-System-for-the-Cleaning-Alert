import React from 'react';

const needs = [
  {
    icon: (
      <span className="bg-orange-100 rounded-full p-4 text-3xl text-orange-500">&#128737;</span>
    ),
    title: "Health & Safety",
    description:
      "High ammonia levels can cause respiratory issues and pose serious health risks to personnel.",
  },
  {
    icon: (
      <span className="bg-red-100 rounded-full p-4 text-3xl text-red-500">&#9889;</span>
    ),
    title: "Equipment Protection",
    description:
      "Excessive ammonia can corrode equipment and machinery, leading to costly repairs and downtime.",
  },
  {
    icon: (
      <span className="bg-green-100 rounded-full p-4 text-3xl text-green-500">&#128202;</span>
    ),
    title: "Compliance",
    description:
      "Maintain regulatory compliance with environmental and occupational safety standards.",
  },
];

const CleaningNeedSection = () => {
  return (
    <section id="cleaning-need" className="max-w-6xl mx-auto my-12 px-4">
      <div className="rounded-3xl bg-gradient-to-r from-red-50 via-orange-50 to-green-50 p-8 md:p-10">
        <div className="flex flex-col items-center mb-8">
          <span className="text-4xl text-yellow-500 mb-2">&#9888;</span>
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 text-gray-900">Why Regular Cleaning is Critical</h2>
          <p className="text-gray-600 text-center max-w-2xl mt-2">Keeping equipment and facilities clean reduces risk, extends equipment life, and ensures compliance with safety regulations.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-6">
          {needs.map((need, idx) => (
            <div key={idx} className="flex flex-col items-center text-center p-4 bg-white/60 rounded-2xl border border-white/40 shadow-sm">
              {need.icon}
              <h3 className="mt-4 text-lg md:text-xl font-semibold text-gray-900">{need.title}</h3>
              <p className="mt-2 text-gray-600 max-w-xs text-sm">{need.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CleaningNeedSection;
