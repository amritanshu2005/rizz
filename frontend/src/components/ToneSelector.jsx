import React from "react";

export default function ToneSelector({ value, onChange }) {
  const tones = [
    { key: "Funny", label: "😂 Funny" },
    { key: "Flirty", label: "😏 Flirty" },
    { key: "Confident", label: "💪 Confident" },
    { key: "Direct", label: "🎯 Direct" },
  ];

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
        Tone
      </label>
      <div className="flex gap-2">
        {tones.map((t) => (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-shadow shadow-sm focus:outline-none ${value === t.key ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white ring-2 ring-indigo-300" : "bg-slate-100 text-slate-700 hover:scale-105 dark:bg-white/10 dark:text-gray-100"}`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
