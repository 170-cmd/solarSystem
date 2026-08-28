import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Line, OrbitControls, Stars, useCursor } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { BODIES, type Body } from "../data/bodies";
import { simStore } from "../simStore";
import { getBodyTexture, getCloudTexture, getGlowTexture, getRingTexture } from "../three/textures";

export type FlyPhase = "fly" | "orbit" | "free";

const DEG = Math.PI / 180;
/** наклонение орбит (слегка утрировано для выразительности) */
const INCL: Record<string, number> = { mercury: 2.6, venus: 1.7, earth: 0, mars: 1.9, jupiter: 0.9, saturn: 1.4, uranus: 0.8, neptune: 1.1 };
/** скорость собственного вращения (рад/с, художественно) */
const SPIN: Record<string, number> = { sun: 0.05, mercury: 0.04, venus: -0.025, earth: 0.4, mars: 0.38, jupiter: 0.85, saturn: 0.75, uranus: 0.55, neptune: 0.6 };
/** наклон оси вращения, градусы (Уран «лежит на боку») */
const TILT: Record<string, number> = { sun: 7, mercury: 0.03, venus: 177, earth: 23.4, mars: 25.2, jupiter: 3.1, saturn: 26.7, uranus: 97.8, neptune: 28.3 };

const r3d = (b: Body) => b.size * 0.35;

function orbitPos(b: Body, days: number, out: THREE.Vector3): THREE.Vector3 {
  if (b.periodDays === 0) return out.set(0, 0, 0);
  const a = (b.startAngle + (days / b.periodDays) * 360) * DEG;
  const incl = (INCL[b.id] ?? 0) * DEG;
  return out.set(
    Math.cos(a) * b.orbitR,
    Math.sin(a) * b.orbitR * Math.sin(incl),
    Math.sin(a) * b.orbitR * Math.cos(incl)
  );
}

/* ============================= Солнце ============================= */

function Sun({ onSelect, selected }: { onSelect: (id: string) => void; selected: boolean }) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);
  const sun = BODIES[0];
  const tex = useMemo(() => getBodyTexture(sun), [sun]);
  const glow = useMemo(() => getGlowTexture(), []);
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (mesh.current) mesh.current.rotation.y += dt * 0.05;
  });
  return (
    <group
      onClick={(e) => { e.stopPropagation(); onSelect(sun.id); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={() => setHovered(false)}
    >
      <mesh ref={mesh}>
        <sphereGeometry args={[r3d(sun), 64, 48]} />
        <meshBasicMaterial map={tex} />
      </mesh>
      <sprite scale={72}>
        <spriteMaterial map={glow} color="#ffc266" transparent opacity={0.85} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <sprite scale={180}>
        <spriteMaterial map={glow} color="#ff9d3c" transparent opacity={0.26} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      {(hovered || selected) && (
        <sprite scale={r3d(sun) * 4.6}>
          <spriteMaterial map={glow} color="#fff3c4" transparent opacity={0.32} depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
      )}
      <pointLight intensity={2.6} decay={0} color="#fff2d8" />
    </group>
  );
}

/* ============================= Планета ============================= */

interface PlanetProps {
  body: Body;
  positions: MutableRefObject<Map<string, THREE.Vector3>>;
  onSelect: (id: string) => void;
  selected: boolean;
}

function Planet({ body, positions, onSelect, selected }: PlanetProps) {
  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.Mesh>(null);
  const clouds = useRef<THREE.Mesh>(null);
  const moonPivot = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  const tex = useMemo(() => getBodyTexture(body), [body]);
  const cloudTex = useMemo(() => (body.id === "earth" ? getCloudTexture() : null), [body]);
  const ringTex = useMemo(() => (body.hasRing ? getRingTexture() : null), [body]);
  const glow = useMemo(() => getGlowTexture(), []);
  const r = r3d(body);

  const ringGeom = useMemo(() => {
    if (!body.hasRing) return null;
    const inner = r * 1.4;
    const outer = r * 2.35;
    const g = new THREE.RingGeometry(inner, outer, 96, 1);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const uv = g.attributes.uv as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      uv.setXY(i, (v.length() - inner) / (outer - inner), 0.5);
    }
    uv.needsUpdate = true;
    return g;
  }, [body, r]);

  useFrame((_, dt) => {
    const v = positions.current.get(body.id);
    if (group.current && v) {
      orbitPos(body, simStore.days, v);
      group.current.position.copy(v);
    }
    if (mesh.current) mesh.current.rotation.y += dt * (SPIN[body.id] ?? 0.2);
    if (clouds.current) clouds.current.rotation.y += dt * 0.5;
    if (moonPivot.current) moonPivot.current.rotation.y += dt * 1.1;
  });

  return (
    <group ref={group}>
      <group
        rotation-z={(TILT[body.id] ?? 0) * DEG}
        onClick={(e) => { e.stopPropagation(); onSelect(body.id); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
        onPointerOut={() => setHovered(false)}
      >
        <mesh ref={mesh}>
          <sphereGeometry args={[r, body.kind === "gas" || body.kind === "ice" ? 64 : 48, 32]} />
          <meshStandardMaterial map={tex} roughness={0.95} metalness={0} />
        </mesh>

        {cloudTex && (
          <mesh ref={clouds}>
            <sphereGeometry args={[r * 1.025, 48, 32]} />
            <meshStandardMaterial map={cloudTex} transparent opacity={0.55} depthWrite={false} roughness={1} />
          </mesh>
        )}

        {ringGeom && ringTex && (
          <mesh rotation-x={-Math.PI / 2 + 0.06} geometry={ringGeom}>
            <meshBasicMaterial map={ringTex} transparent side={THREE.DoubleSide} depthWrite={false} opacity={0.92} />
          </mesh>
        )}

        {(hovered || selected) && (
          <sprite scale={r * 5.5}>
            <spriteMaterial map={glow} color={body.hi} transparent opacity={selected ? 0.38 : 0.22} depthWrite={false} blending={THREE.AdditiveBlending} />
          </sprite>
        )}
      </group>

      {body.id === "earth" && (
        <group ref={moonPivot}>
          <mesh position={[r * 2.7, 0, 0]}>
            <sphereGeometry args={[r * 0.27, 20, 14]} />
            <meshStandardMaterial color="#b8b4ac" roughness={1} />
          </mesh>
        </group>
      )}
    </group>
  );
}

/* ============================= Камера ============================= */

interface RigProps {
  selectedId: string | null;
  controlsRef: MutableRefObject<any>;
  positions: MutableRefObject<Map<string, THREE.Vector3>>;
  onPhase: (p: FlyPhase) => void;
}

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function CameraRig({ selectedId, controlsRef, positions, onPhase }: RigProps) {
  const { camera } = useThree();
  const phase = useRef<FlyPhase>("fly");
  const reported = useRef<FlyPhase | "">("");
  const t0 = useRef(performance.now());
  const dur = useRef(1.9);
  const startPos = useRef(new THREE.Vector3(0, 300, 340));
  const startTarget = useRef(new THREE.Vector3(0, 0, 0));
  const curTarget = useRef(new THREE.Vector3());
  const lastPlanet = useRef(new THREE.Vector3());
  const tmp = useRef(new THREE.Vector3());
  const offsetDir = useRef(new THREE.Vector3(0.6, 0.5, 1).normalize());

  const selected = selectedId ? BODIES.find((b) => b.id === selectedId) ?? null : null;

  useEffect(() => {
    const c = controlsRef.current;
    if (selected) {
      startPos.current.copy(camera.position);
      startTarget.current.copy(c ? c.target : tmp.current.set(0, 0, 0));
      t0.current = performance.now();
      dur.current = reported.current === "" ? 1.9 : 1.35;
      const idx = BODIES.indexOf(selected);
      const ang = idx * 0.85;
      offsetDir.current.set(Math.cos(ang) * 0.85, 0.5, Math.sin(ang) * 0.85 + 0.5).normalize();
      phase.current = "fly";
      if (c) c.enabled = false;
    } else {
      phase.current = "free";
      if (c) c.enabled = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  useFrame(() => {
    const c = controlsRef.current;
    if (!selected) {
      if (c) {
        c.enabled = true;
        c.target.lerp(tmp.current.set(0, 0, 0), 0.05);
      }
      if (reported.current !== "free") {
        reported.current = "free";
        onPhase("free");
      }
      return;
    }
    const p = positions.current.get(selected.id);
    if (!p) return;

    if (phase.current === "fly") {
      const t = Math.min((performance.now() - t0.current) / (dur.current * 1000), 1);
      const e = easeInOutCubic(t);
      const dist = r3d(selected) * 6.2 + 5;
      tmp.current.copy(p).addScaledVector(offsetDir.current, dist);
      camera.position.lerpVectors(startPos.current, tmp.current, e);
      curTarget.current.lerpVectors(startTarget.current, p, e);
      camera.lookAt(curTarget.current);
      if (t >= 1) {
        phase.current = "orbit";
        lastPlanet.current.copy(p);
        if (c) {
          c.target.copy(p);
          c.minDistance = r3d(selected) * 2.3 + 1.2;
          c.maxDistance = r3d(selected) * 26 + 60;
          c.enabled = true;
        }
      }
      if (reported.current !== "fly") {
        reported.current = "fly";
        onPhase("fly");
      }
    } else {
      // планета летит по орбите — камера «привязана» к ней,
      // а вращение/зум вокруг неё остаётся за пользователем
      tmp.current.copy(p).sub(lastPlanet.current);
      camera.position.add(tmp.current);
      if (c) c.target.copy(p);
      lastPlanet.current.copy(p);
      if (reported.current !== "orbit") {
        reported.current = "orbit";
        onPhase("orbit");
      }
    }
  });

  return null;
}

/* ============================= Сцена ============================= */

interface SceneProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
  showOrbits: boolean;
  onPhase: (p: FlyPhase) => void;
}

export default function SolarSystem3D({ selectedId, onSelect, showOrbits, onPhase }: SceneProps) {
  const positions = useRef(new Map<string, THREE.Vector3>(BODIES.map((b) => [b.id, new THREE.Vector3()])));
  const controlsRef = useRef<any>(null);

  const orbitLines = useMemo(() => {
    const m = new Map<string, [number, number, number][]>();
    for (const b of BODIES) {
      if (!b.orbitR) continue;
      const pts: [number, number, number][] = [];
      const incl = (INCL[b.id] ?? 0) * DEG;
      for (let i = 0; i <= 128; i++) {
        const a = (i / 128) * Math.PI * 2;
        pts.push([
          Math.cos(a) * b.orbitR,
          Math.sin(a) * b.orbitR * Math.sin(incl),
          Math.sin(a) * b.orbitR * Math.cos(incl),
        ]);
      }
      m.set(b.id, pts);
    }
    return m;
  }, []);

  return (
    <Canvas dpr={[1, 2]} camera={{ position: [0, 300, 340], fov: 42, near: 0.1, far: 6000 }}>
      <ambientLight intensity={0.42} />
      <Stars radius={1500} depth={140} count={6500} factor={6} saturation={0} fade speed={0.5} />

      <Sun onSelect={onSelect} selected={selectedId === "sun"} />

      {BODIES.filter((b) => b.orbitR > 0).map((b) => (
        <Planet key={b.id} body={b} positions={positions} onSelect={onSelect} selected={selectedId === b.id} />
      ))}

      {showOrbits &&
        Array.from(orbitLines.entries()).map(([id, pts]) => (
          <Line
            key={id}
            points={pts}
            color={selectedId === id ? "#f2b544" : "#9db4d8"}
            lineWidth={selectedId === id ? 1.6 : 1}
            transparent
            opacity={selectedId === id ? 0.55 : 0.14}
          />
        ))}

      <CameraRig selectedId={selectedId} controlsRef={controlsRef} positions={positions} onPhase={onPhase} />
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.55}
        zoomSpeed={0.9}
        panSpeed={0.7}
        enabled={false}
      />
    </Canvas>
  );
}
