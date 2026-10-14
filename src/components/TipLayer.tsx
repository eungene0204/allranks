"use client";

import { useEffect } from "react";

/**
 * One instant tooltip for every viz mark. Any element with a `data-tip` attribute shows its text as soon as the pointer
 * (or keyboard focus) reaches it; a native `title` waits about a second. Works on SVG shapes too, which CSS `::after` cannot reach.
 */
export default function TipLayer() {
  useEffect(() => {
    const el = document.createElement("div");
    el.className = "tip-pop";
    el.hidden = true;
    el.setAttribute("aria-hidden", "true");
    document.body.appendChild(el);

    let cur: Element | null = null;
    const place = () => {
      if (!cur) return;
      const r = cur.getBoundingClientRect();
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const x = Math.max(8, Math.min(r.left + r.width / 2 - w / 2, window.innerWidth - w - 8));
      const above = r.top - h - 6;
      const y = above < 8 ? r.bottom + 6 : above;
      el.style.transform = `translate(${x}px, ${y}px)`;
    };
    const hide = () => {
      cur = null;
      el.hidden = true;
    };
    const show = (target: Element | null) => {
      const t = target?.closest("[data-tip]");
      if (!t) return hide();
      if (t === cur) return;
      cur = t;
      el.textContent = t.getAttribute("data-tip");
      el.hidden = false;
      place();
    };
    const onOver = (e: Event) => show(e.target as Element);
    const onOut = (e: Event) => {
      if (!(e as PointerEvent).relatedTarget) hide();
    };
    const onFocus = (e: Event) => show(e.target as Element);
    const onBlur = () => hide();

    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerout", onOut);
    document.addEventListener("focusin", onFocus);
    document.addEventListener("focusout", onBlur);
    window.addEventListener("scroll", hide, { passive: true });
    return () => {
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
      document.removeEventListener("focusin", onFocus);
      document.removeEventListener("focusout", onBlur);
      window.removeEventListener("scroll", hide);
      el.remove();
    };
  }, []);

  return null;
}
