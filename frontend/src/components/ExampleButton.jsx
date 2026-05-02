import React from "react";

export default function ExampleButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-sm px-3 py-1 bg-slate-100 text-slate-800 dark:bg-white/10 dark:text-white rounded-md hover:bg-slate-200 dark:hover:bg-white/20 transition"
    >
      Try Example
    </button>
  );
}
