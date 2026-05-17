import { useEffect, useState } from "react";
import "./loadingScreen.css";

export default function LoadingScreen({
  text = "Loading",
  visible = true,
}) {
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      return;
    }

    const timeout = setTimeout(() => {
      setMounted(false);
    }, 320);

    return () => clearTimeout(timeout);
  }, [visible]);

  if (!mounted) {
    return null;
  }

  return (
    <main
      className={`loadingScreen ${
        visible ? "loadingScreenVisible" : "loadingScreenHidden"
      }`}
    >
      <div className="loadingLogoShell">
        <img className="loadingLogo" src="../../../../public/icon-big.png" alt="" />
      </div>

      <p className="loadingText">{text}</p>

      <div className="loadingDots" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </main>
  );
}