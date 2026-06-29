import { useEffect, useRef } from "react";

// Gentle reveal-on-scroll. Adds `reveal-in` to children with the `reveal`
// class when they enter the viewport. Respects reduced-motion via CSS.
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const targets = root.querySelectorAll<HTMLElement>(".reveal");
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-in");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, []);

  return ref;
}
