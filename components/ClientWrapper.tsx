"use client";

import { useEffect } from "react";

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  // Disable right-click
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu);
    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, []);

  // Random background position
  useEffect(() => {
    const positions = [
      "center",
      "top",
      "top left",
      "top right",
      "bottom",
      "bottom left",
      "bottom right",
      "left",
      "right",
    ];
    document.body.style.backgroundPosition =
      positions[Math.floor(Math.random() * positions.length)];
  }, []);

  return <>{children}</>;
}
