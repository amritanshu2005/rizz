import React from "react";

export default function ReplyCard({ text, onCopy, tone }) {
  const toneMap = {
    Funny: "😄 Funny",
    Flirty: "😏 Flirty",
    Confident: "💯 Confident",
    Direct: "🎯 Direct",
  };
  return (
    <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 hover:shadow-2xl transition bg-white/80 dark:bg-white/5 glass fade-in">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-sm mb-3 text-slate-800 dark:text-slate-100">
            {text}
          </p>
          <div className="text-xs text-slate-500 dark:text-gray-300">
            {tone ? toneMap[tone] : ""}
          </div>
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={onCopy}
            className="px-3 py-1 bg-slate-100 text-slate-800 dark:bg-white/10 dark:text-white rounded-md hover:bg-slate-200 dark:hover:bg-white/20 transition"
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  );
}
