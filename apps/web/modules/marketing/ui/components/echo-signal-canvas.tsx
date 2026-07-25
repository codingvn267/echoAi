"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Isolated in its own module (separate from echo-signal-hero.tsx) so
 * next/dynamic can code-split the entire three.js/@react-three/fiber
 * dependency graph out of the main marketing bundle — it is only ever
 * downloaded once a capable, non-reduced-motion, non-constrained client
 * actually renders this component.
 */
export default function EchoSignalCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0, 6);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.dataset.echoSignal = "true";
    renderer.domElement.className = "h-full w-full";
    container.appendChild(renderer.domElement);

    const signal = new THREE.Group();
    signal.position.set(0.95, 0.55, 0);
    signal.scale.setScalar(0.72);
    signal.rotation.set(-0.12, -0.2, 0.08);
    scene.add(signal);

    scene.add(new THREE.AmbientLight(0xbffdf4, 1.25));
    const cyanLight = new THREE.PointLight(0x22d3ee, 14, 12);
    cyanLight.position.set(3, 3, 4);
    scene.add(cyanLight);
    const emeraldLight = new THREE.PointLight(0x34d399, 10, 10);
    emeraldLight.position.set(-3, -2, 3);
    scene.add(emeraldLight);

    const coreGeometry = new THREE.IcosahedronGeometry(1.05, 3);
    const coreMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x22d3ee,
      emissive: 0x063d4a,
      emissiveIntensity: 0.65,
      metalness: 0.15,
      roughness: 0.12,
      transmission: 0.42,
      thickness: 1.4,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
      transparent: true,
      opacity: 0.9,
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    signal.add(core);

    const shell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.12, 2),
      new THREE.MeshBasicMaterial({
        color: 0xa7f3d0,
        transparent: true,
        opacity: 0.16,
        wireframe: true,
      })
    );
    signal.add(shell);

    const rings = [
      {
        radius: 1.65,
        color: 0x67e8f9,
        opacity: 0.34,
        rotation: [Math.PI / 3, 0.2, 0],
      },
      {
        radius: 2.05,
        color: 0x34d399,
        opacity: 0.24,
        rotation: [-Math.PI / 4, -0.35, 0.5],
      },
    ].map(({ radius, color, opacity, rotation }) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(radius, 0.014, 12, 160),
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity,
        })
      );
      ring.rotation.set(rotation[0]!, rotation[1]!, rotation[2]!);
      signal.add(ring);
      return ring;
    });

    const nodeSpecs = [
      { radius: 1.5, speed: 0.42, offset: 0, color: 0x22d3ee, size: 0.1 },
      { radius: 1.85, speed: -0.3, offset: 2.1, color: 0x34d399, size: 0.085 },
      { radius: 2.05, speed: -0.2, offset: 5.4, color: 0xfb923c, size: 0.13 },
    ];
    const nodes = nodeSpecs.map(({ color, size }) => {
      const node = new THREE.Mesh(
        new THREE.SphereGeometry(size, 20, 20),
        new THREE.MeshStandardMaterial({
          color,
          emissive: color,
          emissiveIntensity: 1.5,
        })
      );
      signal.add(node);
      return node;
    });

    const particlePositions = new Float32Array(36 * 3);
    for (let index = 0; index < particlePositions.length; index += 3) {
      const radius = 2.4 + Math.random() * 1.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      particlePositions[index] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[index + 1] = radius * Math.cos(phi) * 0.62;
      particlePositions[index + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3)
    );
    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({
        color: 0x67e8f9,
        transparent: true,
        opacity: 0.42,
        size: 0.022,
        sizeAttenuation: true,
      })
    );
    signal.add(particles);

    const pointer = new THREE.Vector2();
    const clock = new THREE.Clock();
    let frameId = 0;
    let visible = true;
    let hasRendered = false;

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visible = Boolean(entry?.isIntersecting);
      },
      { threshold: 0.02 }
    );
    intersectionObserver.observe(container);

    const handlePointerMove = (event: PointerEvent) => {
      pointer.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        (event.clientY / window.innerHeight) * 2 - 1
      );
    };
    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });

    const render = () => {
      frameId = window.requestAnimationFrame(render);
      if (hasRendered && (!visible || document.visibilityState === "hidden"))
        return;

      const elapsed = clock.getElapsedTime();
      core.rotation.y = elapsed * 0.18;
      core.rotation.x = elapsed * 0.07;
      shell.rotation.y = -elapsed * 0.11;
      shell.rotation.z = elapsed * 0.06;
      rings.forEach((ring, index) => {
        ring.rotation.z += 0.0008 * (index + 1);
      });
      nodes.forEach((node, index) => {
        const spec = nodeSpecs[index]!;
        const angle = elapsed * spec.speed + spec.offset;
        node.position.set(
          Math.cos(angle) * spec.radius,
          Math.sin(angle * 0.68) * 0.55,
          Math.sin(angle) * spec.radius
        );
        if (index === nodes.length - 1) {
          node.scale.setScalar(1 + Math.sin(elapsed * 1.7) * 0.18);
        }
      });
      particles.rotation.y = elapsed * 0.025;
      signal.rotation.y += (pointer.x * 0.22 - signal.rotation.y) * 0.025;
      signal.rotation.x += (-pointer.y * 0.12 - signal.rotation.x) * 0.025;
      signal.position.y = 0.55 + Math.sin(elapsed * 0.38) * 0.045;

      renderer.render(scene, camera);
      hasRendered = true;
    };
    render();

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("pointermove", handlePointerMove);
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh || object instanceof THREE.Points))
          return;
        object.geometry.dispose();
        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material];
        materials.forEach((material) => material.dispose());
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={containerRef} className="h-full w-full" />;
}
