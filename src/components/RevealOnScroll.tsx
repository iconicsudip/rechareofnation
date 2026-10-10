"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Fades page sections up as they scroll into view. Only sections that start
// below the fold are animated, so the first screen is never delayed.
export default function RevealOnScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("rv-in");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    const targets = Array.from(document.querySelectorAll<HTMLElement>("main section"))
      .filter((el) => el.getBoundingClientRect().top > window.innerHeight * 0.9);
    targets.forEach((el) => {
      el.classList.add("rv");
      io.observe(el);
    });
    return () => {
      io.disconnect();
      targets.forEach((el) => el.classList.remove("rv", "rv-in"));
    };
  }, [pathname]);

  return null;
}
