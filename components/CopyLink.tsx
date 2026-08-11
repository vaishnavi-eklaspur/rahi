"use client";

import { useState } from "react";

export default function CopyLink() {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() =>
        navigator.clipboard?.writeText(window.location.href).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        })
      }
      className="inline-flex h-11 items-center rounded-full bg-brand-600 px-6 text-sm font-medium text-white transition-colors hover:bg-brand-700"
    >
      {copied ? "Link copied ✓" : "Copy share link"}
    </button>
  );
}
