"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export interface PointerRef {
  x: number;
  y: number;
}

/** Translucent conversational core — the "Echo" in Echo Signal. */
function Core() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    const mesh = ref.current;
    if (!mesh) return;
    mesh.rotation.y += delta * 0.15;
    mesh.rotation.x += delta * 0.05;
  });

  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[1.15, 2]} />
      <meshPhysicalMaterial
        color="#22d3ee"
        transmission={0.9}
        roughness={0.15}
        thickness={1.5}
        ior={1.4}
        clearcoat={1}
        clearcoatRoughness={0.2}
        metalness={0.05}
      />
    </mesh>
  );
}

/** A small knowledge/response node orbiting the core. */
function OrbitingNode({
  radius,
  speed,
  offset,
  color,
  size = 0.09,
}: {
  radius: number;
  speed: number;
  offset: number;
  color: string;
  size?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = clock.getElapsedTime() * speed + offset;
    mesh.position.set(Math.cos(t) * radius, Math.sin(t * 0.6) * 0.4, Math.sin(t) * radius);
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
    </mesh>
  );
}

/** A thin "response ring" that frames the core, like an expanding signal. */
function ResponseRing({ radius, tilt, color }: { radius: number; tilt: number; color: string }) {
  return (
    <mesh rotation={[tilt, 0, 0]}>
      <torusGeometry args={[radius, 0.008, 16, 100]} />
      <meshBasicMaterial color={color} transparent opacity={0.35} />
    </mesh>
  );
}

/** The warm "escalation" node — visualizes the AI-to-human handoff. */
function EscalationNode() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const mesh = ref.current;
    if (!mesh) return;
    const s = 1 + Math.sin(clock.getElapsedTime() * 1.4) * 0.15;
    mesh.scale.setScalar(s);
  });

  return (
    <mesh ref={ref} position={[1.6, 0.9, 0]}>
      <sphereGeometry args={[0.12, 16, 16]} />
      <meshStandardMaterial color="#fb923c" emissive="#fb923c" emissiveIntensity={0.8} />
    </mesh>
  );
}

/**
 * The full "Echo Signal" scene: a translucent conversational core, orbiting
 * knowledge/response nodes, expanding response rings, and a warm escalation
 * node. Gently tracks the pointer via a plain ref (never React state) so it
 * never triggers a re-render from inside the animation loop.
 */
export function EchoSignalScene({ pointer }: { pointer: React.RefObject<PointerRef> }) {
  const group = useRef<THREE.Group>(null);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const targetY = pointer.current.x * 0.3;
    const targetX = pointer.current.y * 0.2;
    g.rotation.y += (targetY - g.rotation.y) * 0.04;
    g.rotation.x += (targetX - g.rotation.x) * 0.04;
  });

  return (
    <group ref={group}>
      <ambientLight intensity={0.65} />
      <directionalLight position={[3, 4, 2]} intensity={1.1} color="#a7f3d0" />
      <directionalLight position={[-3, -2, -2]} intensity={0.4} color="#67e8f9" />

      <Core />
      <ResponseRing radius={1.7} tilt={Math.PI / 3} color="#67e8f9" />
      <ResponseRing radius={2.05} tilt={-Math.PI / 4} color="#a78bfa" />
      <OrbitingNode radius={1.9} speed={0.35} offset={0} color="#22d3ee" />
      <OrbitingNode radius={1.6} speed={-0.28} offset={2} color="#34d399" />
      <OrbitingNode radius={2.2} speed={0.22} offset={4} color="#a78bfa" />
      <EscalationNode />
    </group>
  );
}
