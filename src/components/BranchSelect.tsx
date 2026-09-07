"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Check } from "lucide-react";
import { allBranches, ASSOCIATE, OTHER_BRANCH } from "@/data/branches";

const OPTIONS = [ASSOCIATE, ...allBranches, OTHER_BRANCH];

// Searchable branch picker: type to filter, works the same on mobile and
// desktop. Submits the chosen value via a hidden input named `branch`.
export default function BranchSelect({ name = "branch" }: { name?: string }) {
  const [value, setValue] = useState("");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? OPTIONS.filter((o) => o.toLowerCase().includes(q)) : OPTIONS;
    return list.slice(0, 60);
  }, [query]);

  function pick(v: string) {
    setValue(v);
    setQuery(v);
    setOpen(false);
  }

  return (
    <div ref={wrapRef} className="relative">
      <input type="hidden" name={name} value={value} />
      <div className="relative">
        <input
          className="field !pr-9"
          placeholder="Type to search your branch…"
          value={query}
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          autoComplete="off"
          onChange={(e) => {
            setQuery(e.target.value);
            setValue("");
            setOpen(true);
            setActive(0);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
              setActive((a) => Math.min(a + 1, filtered.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, 0));
            } else if (e.key === "Enter") {
              if (open && filtered[active]) {
                e.preventDefault();
                pick(filtered[active]);
              }
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
        />
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      </div>

      {open && (
        <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-line bg-white py-1 shadow-lg">
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted">No match — pick “{OTHER_BRANCH}”.</li>
          ) : (
            filtered.map((o, i) => (
              <li key={o}>
                <button
                  type="button"
                  onClick={() => pick(o)}
                  onMouseEnter={() => setActive(i)}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm ${
                    i === active ? "bg-blue-soft" : ""
                  } ${value === o ? "font-semibold text-blue" : "text-ink"}`}
                >
                  {o}
                  {value === o && <Check className="h-4 w-4 shrink-0 text-blue" />}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
