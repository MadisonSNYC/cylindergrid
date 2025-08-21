import { useEffect, useState } from "react";

export default function useReducedMotionPref(): boolean {
  const [prefersReduced, setPrefersReduced] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setPrefersReduced(mq.matches);
    mq.addEventListener?.("change", onChange) ?? mq.addListener(onChange);
    return () => {
      mq.removeEventListener?.("change", onChange) ?? mq.removeListener(onChange);
    };
  }, []);

  return prefersReduced;
}