"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/** Logical size of the phone the preview is rendered at. */
export const PREVIEW_WIDTH = 390;
export const PREVIEW_HEIGHT = 844;

/**
 * Renders children at a fixed phone size and scales them to fit the
 * available width (and, when given, height) with a CSS transform.
 */
export function PreviewFrame({ children, maxHeight }: { children: ReactNode; maxHeight?: number }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const update = () => {
      const width = el.clientWidth;
      let s = Math.min(1, width / PREVIEW_WIDTH);
      if (maxHeight) s = Math.min(s, maxHeight / PREVIEW_HEIGHT);
      setScale(s > 0 ? s : 1);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [maxHeight]);

  return (
    <div ref={outerRef} className="w-full">
      <div
        className="relative mx-auto overflow-hidden rounded-[28px] border-8 border-stone-900 bg-black shadow-xl"
        style={{ width: PREVIEW_WIDTH * scale, height: PREVIEW_HEIGHT * scale }}
      >
        <div
          style={{
            width: PREVIEW_WIDTH,
            height: PREVIEW_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
