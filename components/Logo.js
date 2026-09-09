"use client";

import { useState } from "react";

export default function Logo({ size = 36 }) {
  const [imgError, setImgError] = useState(false);

  if (!imgError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/logo-taspen.jpg"
        alt="Logo PT Taspen"
        width={size}
        height={size}
        className="rounded-lg object-contain bg-white"
        style={{ width: size, height: size }}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className="rounded-lg flex items-center justify-center font-bold text-navy-900 text-xs bg-gradient-to-br from-amber-500 to-amber-400"
      style={{ width: size, height: size }}
      title="Ganti dengan logo resmi di /public/logo-taspen.png"
    >
      PT
    </div>
  );
}
