"use client";

import { useState, useRef, useEffect } from "react";

type Msg = { role: "user" | "assistant"; content: string };

// Starters double as a light conversational intake: describe your situation and
// Rahi tailors advice to it, grounded in your results.
const STARTERS = [
  "I'm a student unsure about my path — where do I start?",
  "Why is my top match a good fit?",
  "What if I prefer more creative work?",
  "Compare my top two careers.",
];

export default function Chat({ code }: { code: string }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: q }];
    setMessages([...next, { role: "assistant", content: "" }]); // placeholder, fills as it streams
    setInput("");
    setLoading(true);
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, messages: next }),
      });
      if (!r.body) throw new Error("no stream");
      const reader = r.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setMessages([...next, { role: "assistant", content: acc }]);
      }
    } catch {
      setMessages([...next, { role: "assistant", content: "Something went wrong — please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-12 rounded-2xl border border-hairline bg-paper-2 p-5 print:hidden">
      <h2 className="font-display text-xl font-semibold">Ask Rahi about your results</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Tell Rahi your situation or ask anything — answers are grounded in your results.
      </p>

      {messages.length > 0 && (
        <div className="mt-4 max-h-96 space-y-3 overflow-y-auto pr-1">
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-brand-600 text-white"
                    : "border border-hairline bg-[var(--background)] text-foreground"
                }`}
              >
                {m.role === "assistant" && m.content === "" ? (
                  <span className="text-[var(--muted)]">Rahi is thinking…</span>
                ) : (
                  m.content
                )}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
      )}

      {messages.length === 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {STARTERS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border border-hairline bg-[var(--background)] px-3 py-1.5 text-sm text-[var(--muted)] transition-colors hover:border-brand-400 hover:text-brand-700 dark:hover:text-brand-400"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        className="mt-4 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={2000}
          aria-label="Ask Rahi about your results"
          placeholder="Tell Rahi about yourself, or ask a question…"
          className="h-11 flex-1 rounded-full border border-hairline bg-[var(--background)] px-4 text-sm outline-none focus:border-brand-500"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="inline-flex h-11 items-center rounded-full bg-brand-600 px-5 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  );
}
