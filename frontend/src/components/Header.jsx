import React from "react";

export default function Header({ onToggleDark, dark }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          RIZZ AI <span className="ml-2">💬</span>
        </h1>
        <p className="text-sm text-slate-600 dark:text-gray-300 mt-1">
          Turn boring chats into irresistible replies
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleDark}
          className="px-3 py-2 rounded-md bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 transition"
        >
          {dark ? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>
    </div>
  );
}
