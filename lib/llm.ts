// Server-side LLM helper. Uses Google Gemini when GEMINI_API_KEY is set (works on
// Vercel), else falls back to a local Ollama (free/private in dev), else returns
// null so callers keep their deterministic fallback. Facts stay curated either way.

export interface Msg { role: "system" | "user" | "assistant"; content: string }

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2";

// ---- Gemini ----
function toGemini(messages: Msg[]) {
  let system = "";
  const contents: { role: string; parts: { text: string }[] }[] = [];
  for (const m of messages) {
    if (m.role === "system") { system += (system ? "\n" : "") + m.content; continue; }
    contents.push({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] });
  }
  return { system, contents };
}

async function geminiComplete(messages: Msg[], opts?: { json?: boolean; temperature?: number }): Promise<string | null> {
  const { system, contents } = toGemini(messages);
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
        generationConfig: {
          temperature: opts?.temperature ?? 0.6,
          ...(opts?.json ? { responseMimeType: "application/json" } : {}),
        },
      }),
    });
    if (!r.ok) return null;
    const data = await r.json();
    const parts = data?.candidates?.[0]?.content?.parts;
    return Array.isArray(parts) ? parts.map((p: { text?: string }) => p.text ?? "").join("") || null : null;
  } catch {
    return null;
  }
}

async function geminiStream(messages: Msg[], opts?: { temperature?: number }): Promise<ReadableStream | null> {
  const { system, contents } = toGemini(messages);
  let r: Response;
  try {
    r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse&key=${GEMINI_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
        generationConfig: { temperature: opts?.temperature ?? 0.7 },
      }),
    });
  } catch {
    return null;
  }
  if (!r.ok || !r.body) return null;
  return sseStream(r.body, (obj) => obj?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "");
}

// ---- Ollama (local) ----
async function ollamaComplete(messages: Msg[], opts?: { json?: boolean; temperature?: number }): Promise<string | null> {
  try {
    const r = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        stream: false,
        ...(opts?.json ? { format: "json" } : {}),
        options: { temperature: opts?.temperature ?? 0.6 },
        messages,
      }),
    });
    if (!r.ok) return null;
    return (await r.json())?.message?.content ?? null;
  } catch {
    return null;
  }
}

async function ollamaStream(messages: Msg[], opts?: { temperature?: number }): Promise<ReadableStream | null> {
  let r: Response;
  try {
    r = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: OLLAMA_MODEL, stream: true, options: { temperature: opts?.temperature ?? 0.7 }, messages }),
    });
  } catch {
    return null;
  }
  if (!r.ok || !r.body) return null;
  return ndjsonStream(r.body, (obj) => obj?.message?.content ?? "");
}

// ---- shared stream plumbing: parse upstream lines → emit plain text ----
type StreamChunk = {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
  message?: { content?: string };
};
function pipe(
  body: ReadableStream<Uint8Array>,
  lineToJson: (line: string) => string | null,
  extract: (obj: StreamChunk) => string,
): ReadableStream {
  const reader = body.getReader();
  const dec = new TextDecoder();
  const enc = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      let buf = "";
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          let nl: number;
          while ((nl = buf.indexOf("\n")) >= 0) {
            const jsonStr = lineToJson(buf.slice(0, nl).trim());
            buf = buf.slice(nl + 1);
            if (!jsonStr) continue;
            try {
              const piece = extract(JSON.parse(jsonStr));
              if (piece) controller.enqueue(enc.encode(piece));
            } catch {}
          }
        }
      } catch {
        /* upstream aborted mid-stream */
      } finally {
        controller.close();
      }
    },
  });
}
const sseStream = (body: ReadableStream<Uint8Array>, extract: (o: StreamChunk) => string) =>
  pipe(body, (l) => (l.startsWith("data:") ? l.slice(5).trim() : null), extract);
const ndjsonStream = (body: ReadableStream<Uint8Array>, extract: (o: StreamChunk) => string) =>
  pipe(body, (l) => l || null, extract);

// ---- public API ----
export function complete(messages: Msg[], opts?: { json?: boolean; temperature?: number }): Promise<string | null> {
  return GEMINI_KEY ? geminiComplete(messages, opts) : ollamaComplete(messages, opts);
}
export function stream(messages: Msg[], opts?: { temperature?: number }): Promise<ReadableStream | null> {
  return GEMINI_KEY ? geminiStream(messages, opts) : ollamaStream(messages, opts);
}
