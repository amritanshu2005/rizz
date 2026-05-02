import React, { useEffect, useState } from "react";
import ToneSelector from "./components/ToneSelector";
import ReplyCard from "./components/ReplyCard";
import Spinner from "./components/Spinner";
import Toast from "./components/Toast";
import Header from "./components/Header";
import ExampleButton from "./components/ExampleButton";

export default function App() {
  const [conversation, setConversation] = useState("");
  const [tone, setTone] = useState("Flirty");
  const [loading, setLoading] = useState(false);
  const [replies, setReplies] = useState([]);
  const [toast, setToast] = useState("");
  const [bio, setBio] = useState("");
  const [openers, setOpeners] = useState([]);
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : true;
  });

  useEffect(() => {
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  async function handleGenerate(type = "replies") {
    setLoading(true);
    setReplies([]);
    setOpeners([]);
    try {
      const payload =
        type === "replies" ? { conversation, tone, type } : { bio, tone, type };
      const res = await fetch(
        "http://localhost:4000/" +
          (type === "replies" ? "generate" : "generate-opener"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();
      if (type === "replies") setReplies(data.replies || []);
      else setOpeners(data.openers || []);
    } catch (err) {
      console.error(err);
      setToast("Failed to generate. Is backend running?");
      setTimeout(() => setToast(""), 3000);
    } finally {
      setLoading(false);
    }
  }

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setToast("Copied 😎");
      setTimeout(() => setToast(""), 2000);
    } catch (e) {
      setToast("Copy failed");
      setTimeout(() => setToast(""), 2000);
    }
  };

  const exampleConvo = `Them: Hey! How's your week going?\nYou: Pretty good, staying busy. You?\nThem: Same, work's been wild but had time to catch a show.`;

  const disabled = !conversation.trim() && !loading;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-3xl rounded-2xl p-6 app-card">
        <Header onToggleDark={() => setDark(!dark)} dark={dark} />

        <div className="mt-4">
          <label className="text-sm text-slate-700 dark:text-gray-300 block mb-2">
            Conversation
          </label>
          <textarea
            value={conversation}
            onChange={(e) => setConversation(e.target.value)}
            placeholder={"Paste the conversation here... (Try the example)"}
            className="w-full rounded-xl p-4 h-40 resize-vertical bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-400 outline-none dark:bg-transparent dark:border-white/10 dark:text-white dark:placeholder:text-slate-400"
          />
          <div className="flex items-center justify-between mt-3 gap-2">
            <div className="flex items-center gap-2">
              <ToneSelector value={tone} onChange={setTone} />
              <ExampleButton onClick={() => setConversation(exampleConvo)} />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setConversation("")}
                className="px-4 py-2 rounded-md bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 transition"
              >
                Clear
              </button>
              <button
                disabled={disabled}
                onClick={() => handleGenerate("replies")}
                className={`inline-flex items-center gap-3 px-4 py-2 rounded-md font-semibold transition ${disabled ? "bg-slate-200 text-slate-500 cursor-not-allowed dark:bg-white/10 dark:text-gray-400" : "bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:scale-[1.02]"}`}
              >
                {loading ? (
                  <>
                    <Spinner />
                    <span>Cooking your rizz... 🔥</span>
                  </>
                ) : (
                  "✨ Generate Rizz"
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6">
          {replies && replies.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {replies.map((r, i) => (
                <ReplyCard
                  key={i}
                  text={r}
                  onCopy={() => handleCopy(r)}
                  tone={tone}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-lg bg-slate-100 text-center text-slate-600 dark:bg-white/5 dark:text-gray-300">
              No rizz yet 😶 Paste a convo and generate replies.
            </div>
          )}
        </div>

        <hr className="my-6 border-slate-200 dark:border-white/10" />

        <div>
          <h2 className="text-lg font-semibold">Bio Opener</h2>
          <p className="text-sm text-slate-600 dark:text-gray-300">
            Short bio → Generate a fast opener
          </p>
          <div className="mt-3 flex gap-3">
            <input
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g., Coffee lover, weekend hiker"
              className="flex-1 rounded-xl p-3 bg-white border border-slate-300 text-slate-900 dark:bg-transparent dark:border-white/10 dark:text-white"
            />
            <button
              onClick={() => handleGenerate("opener")}
              className="px-4 py-2 rounded-md bg-amber-500 text-white"
            >
              ⚡ Generate Opener
            </button>
          </div>

          {openers && openers.length > 0 && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {openers.map((o, i) => (
                <ReplyCard
                  key={i}
                  text={o}
                  onCopy={() => handleCopy(o)}
                  tone={tone}
                />
              ))}
            </div>
          )}
        </div>

        <Toast message={toast} />
      </div>
    </div>
  );
}
