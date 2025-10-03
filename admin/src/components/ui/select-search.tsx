"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

export type SelectOption = { value: string; label: string };

interface SelectSearchProps {
  options: SelectOption[];
  value?: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  disabled?: boolean;
}

export function SelectSearch({ options, value, onChange, placeholder = "Select options", searchPlaceholder = "Search...", className = "", disabled }: SelectSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const selected = useMemo(() => options.find(o => o.value === value), [options, value]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(o => o.label.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (containerRef.current.contains(e.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        ref={btnRef}
        type="button"
        disabled={disabled}
        className={`w-full border rounded px-3 py-2 text-left bg-white ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
        onClick={() => setOpen(o => !o)}
      >
        {selected ? selected.label : <span className="text-muted-foreground">{placeholder}</span>}
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded border bg-white shadow-lg">
          <div className="p-2 border-b">
            <input
              autoFocus
              className="w-full border rounded px-2 py-1 text-sm"
              placeholder={searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="max-h-64 overflow-auto">
            {filtered.length === 0 && (
              <div className="px-3 py-2 text-sm text-muted-foreground">No results</div>
            )}
            {filtered.map(opt => (
              <button
                key={opt.value}
                type="button"
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${opt.value === value ? "bg-gray-100" : ""}`}
                onClick={() => { onChange(opt.value); setOpen(false); setQuery(""); }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between p-2 border-t text-xs">
            <button type="button" className="text-muted-foreground hover:underline" onClick={() => { onChange(undefined); setQuery(""); setOpen(false); }}>Clear</button>
            <button type="button" className="text-muted-foreground hover:underline" onClick={() => setOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
