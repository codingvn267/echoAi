"use client";

import {
  Component,
  Suspense,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import dynamic from "next/dynamic";
import { MeshBackground } from "./mesh-background";

const EchoSignalCanvas = dynamic(() => import("./echo-signal-canvas"), {
  ssr: false,
  loading: () => null,
});

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

class WebGLErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("EchoSignalHero: WebGL scene failed, falling back.", error);
    }
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

/**
 * Progressive-enhancement host for the decorative "Echo Signal" 3D visual.
 *
 * Always renders the pure-CSS MeshBackground first (zero layout shift, works
 * without JS). Only mounts the dynamically-imported WebGL canvas on top once
 * we've confirmed, client-side, that the device supports WebGL, the user
 * hasn't requested reduced motion, and the viewport/hardware isn't heavily
 * constrained. Fully decorative: aria-hidden and never intercepts pointer
 * events meant for real DOM controls.
 */
export function EchoSignalHero() {
  const [enable3D, setEnable3D] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isConstrained =
      window.innerWidth < 768 ||
      (typeof navigator.hardwareConcurrency === "number" &&
        navigator.hardwareConcurrency <= 2);

    if (!reduceMotion && !isConstrained && supportsWebGL()) {
      setEnable3D(true);
    }
  }, []);

  return (
    <>
      <MeshBackground />
      {enable3D && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden [mask-image:radial-gradient(ellipse_45%_48%_at_73%_28%,black_48%,transparent_90%)]"
        >
          <WebGLErrorBoundary fallback={null}>
            <Suspense fallback={null}>
              <EchoSignalCanvas />
            </Suspense>
          </WebGLErrorBoundary>
        </div>
      )}
    </>
  );
}
