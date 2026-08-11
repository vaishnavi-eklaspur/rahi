"use client";

export default function PrintButton({ className = "", label = "⬇ Save as PDF" }: { className?: string; label?: string }) {
  return (
    <button onClick={() => window.print()} className={className}>
      {label}
    </button>
  );
}
