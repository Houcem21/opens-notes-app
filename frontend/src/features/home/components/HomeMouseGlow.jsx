import { useEffect, useRef } from "react";

export default function HomeMouseGlow() {
  const glowRef = useRef(null);

  useEffect(() => {
    function handleMove(event) {
      if (!glowRef.current) return;

      glowRef.current.style.setProperty("--mouse-x", `${event.clientX}px`);
      glowRef.current.style.setProperty("--mouse-y", `${event.clientY}px`);
    }

    window.addEventListener("pointermove", handleMove);
    return () => window.removeEventListener("pointermove", handleMove);
  }, []);

  return <div ref={glowRef} className="homeMouseGlow" aria-hidden="true" />;
}