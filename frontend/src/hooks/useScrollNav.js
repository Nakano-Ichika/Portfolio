import { useState, useEffect, useRef } from "react";

export default function useScrollNav(showAfter = 500) {
  const [visible, setVisible] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y < showAfter) {
        setVisible(false);
      } else if (y < lastY.current) {
        setVisible(true);   // scrolling up → show
      } else {
        setVisible(false);  // scrolling down → hide
      }
      lastY.current = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [showAfter]);

  return visible;
}
