"use client";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4"
      onMouseDown={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      {children}
    </div>,
    document.body
  );
}
