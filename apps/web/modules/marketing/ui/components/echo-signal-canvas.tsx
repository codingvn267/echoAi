"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import type { PointerRef } from "./echo-signal-scene";
import { EchoSignalScene } from "./echo-signal-scene";

/**
 * Isolated in its own module (separate from echo-signal-hero.tsx) so
 * next/dynamic can code-split the entire three.js/@react-three/fiber
 * dependency graph out of the main marketing bundle — it is only ever
 * downloaded once a capable, non-reduced-motion, non-constrained client
 * actually renders this component.
 */
export default function EchoSignalCanvas() {
  const pointer = useRef<PointerRef>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);

  // Pause the render loop (not just hide it) when the canvas scrolls out of
  // view or the tab is backgrounded — saves battery/GPU for a decorative visual.
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const io = new IntersectionObserver(
      ([entry]) => setActive(!!entry?.isIntersecting && document.visibilityState === "visible"),
      { threshold: 0.05 }
    );
    io.observe(node);

    const onVisibility = () => {
      if (document.visibilityState === "hidden") setActive(false);
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div ref={containerRef} className="h-full w-full">
      <Canvas
        dpr={[1, 1.5]}
        frameloop={active ? "always" : "never"}
        camera={{ position: [0, 0, 5.5], fov: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
        onCreated={({ gl }) => {
          // Fail gracefully instead of letting a lost context crash the tab.
          gl.domElement.addEventListener("webglcontextlost", (event) => {
            event.preventDefault();
          });
        }}
        onPointerMove={(event) => {
          pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
          pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
        }}
      >
        <EchoSignalScene pointer={pointer} />
      </Canvas>
    </div>
  );
}
