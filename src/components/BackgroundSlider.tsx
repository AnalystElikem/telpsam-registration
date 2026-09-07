"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

// Full-bleed background slider: fills its (relative) parent, crossfades the
// photos automatically, and lays a dark scrim on top so overlaid text stays
// readable. No arrows — it's a backdrop, not a gallery.
export default function BackgroundSlider({ photos }: { photos: string[] }) {
  const [i, setI] = useState(0);
  const n = photos.length;

  useEffect(() => {
    if (n <= 1) return;
    const t = setInterval(() => setI((p) => (p + 1) % n), 5000);
    return () => clearInterval(t);
  }, [n]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {photos.map((src, idx) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          priority={idx === 0}
          sizes="100vw"
          className={`object-cover transition-opacity duration-1000 ${idx === i ? "opacity-100" : "opacity-0"}`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-black/75" />
      {n > 1 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
          {photos.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              aria-label={`Show photo ${idx + 1}`}
              className={`h-2 w-2 rounded-full transition-colors ${idx === i ? "bg-white" : "bg-white/40"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
