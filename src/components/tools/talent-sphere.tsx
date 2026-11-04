"use client";

import { useEffect, useMemo, useRef } from "react";

/**
 * An illustrative talent pool drawn as a 3D sphere on a <canvas>.
 *
 * Each dot is a made-up profile with a few skills. Selecting skills lights up
 * the dots that have ALL of them — the same AND logic a Boolean string uses.
 * Drag to spin; it drifts slowly on its own unless the visitor prefers
 * reduced motion. No library: points on a Fibonacci sphere, a rotation and a
 * perspective divide.
 */

export const SPHERE_SKILLS = ["Java", "Spring Boot", "AWS", "Kafka", "Python", "SQL", "React", "Kubernetes"] as const;
export type SphereSkill = (typeof SPHERE_SKILLS)[number];

export const POOL_SIZE = 420;

type Node = { x: number; y: number; z: number; skills: Set<SphereSkill> };

/** Small deterministic PRNG so the pool is identical on every render. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildPool(): Node[] {
  const rand = mulberry32(20261104);
  const golden = Math.PI * (3 - Math.sqrt(5));
  const nodes: Node[] = [];
  for (let i = 0; i < POOL_SIZE; i++) {
    const y = 1 - (i / (POOL_SIZE - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    const skills = new Set<SphereSkill>();
    const backend = rand() < 0.5;
    if (backend) {
      if (rand() < 0.75) skills.add("Java");
      if (skills.has("Java") && rand() < 0.65) skills.add("Spring Boot");
      if (rand() < 0.35) skills.add("Kafka");
    } else {
      if (rand() < 0.55) skills.add("Python");
      if (rand() < 0.45) skills.add("React");
    }
    if (rand() < 0.45) skills.add("AWS");
    if (rand() < 0.5) skills.add("SQL");
    if (skills.has("AWS") ? rand() < 0.45 : rand() < 0.1) skills.add("Kubernetes");
    nodes.push({ x: Math.cos(theta) * r, y, z: Math.sin(theta) * r, skills });
  }
  return nodes;
}

export function countMatches(pool: Node[], selected: readonly SphereSkill[]) {
  if (selected.length === 0) return pool.length;
  return pool.filter((n) => selected.every((s) => n.skills.has(s))).length;
}

/** Each node's two nearest neighbours, computed once. */
function buildEdges(nodes: Node[]): [number, number][] {
  const edges: [number, number][] = [];
  const seen = new Set<string>();
  nodes.forEach((a, i) => {
    const near = nodes
      .map((b, j) => ({ j, d: (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2 }))
      .filter((o) => o.j !== i)
      .sort((p, q) => p.d - q.d)
      .slice(0, 2);
    for (const { j } of near) {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (!seen.has(key)) {
        seen.add(key);
        edges.push([i, j]);
      }
    }
  });
  return edges;
}

export function TalentSphere({ selected, className }: { selected: readonly SphereSkill[]; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pool = useMemo(() => buildPool(), []);
  const edges = useMemo(() => buildEdges(pool), [pool]);
  const selectedRef = useRef<readonly SphereSkill[]>(selected);
  const glowRef = useRef(0); // eases toward 1 after a selection change

  useEffect(() => {
    selectedRef.current = selected;
    glowRef.current = 0;
  }, [selected]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let rotY = 0.6;
    let rotX = -0.32;
    let velY = reduce ? 0 : 0.0016;
    let velX = 0;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let visible = true;
    let frame = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !frame) frame = requestAnimationFrame(draw);
    });
    io.observe(canvas);

    const projected = new Array(pool.length).fill(null).map(() => ({ sx: 0, sy: 0, z: 0, scale: 1, hit: false }));

    function draw() {
      frame = 0;
      if (!ctx) return;
      if (!dragging) {
        rotY += velY;
        rotX += velX;
        velX *= 0.94;
        if (!reduce) velY += (0.0016 - velY) * 0.02; // settle back to a slow drift
        else velY *= 0.94;
        rotX = Math.max(-1.1, Math.min(1.1, rotX));
      }
      glowRef.current = Math.min(1, glowRef.current + 0.04);

      const sel = selectedRef.current;
      const R = Math.min(width, height) * 0.4;
      const cx = width / 2;
      const cy = height / 2;
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cam = 2.8;

      for (let i = 0; i < pool.length; i++) {
        const n = pool[i];
        const x1 = n.x * cosY - n.z * sinY;
        const z1 = n.x * sinY + n.z * cosY;
        const y2 = n.y * cosX - z1 * sinX;
        const z2 = n.y * sinX + z1 * cosX;
        const scale = cam / (cam - z2);
        const p = projected[i];
        p.sx = cx + x1 * R * scale;
        p.sy = cy + y2 * R * scale;
        p.z = z2;
        p.scale = scale;
        p.hit = sel.length > 0 && sel.every((s) => n.skills.has(s));
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // halo
      const halo = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 1.35);
      halo.addColorStop(0, "rgba(0,96,240,0.22)");
      halo.addColorStop(1, "rgba(0,96,240,0)");
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, width, height);

      // edges
      ctx.lineWidth = 1;
      for (const [a, b] of edges) {
        const pa = projected[a];
        const pb = projected[b];
        const depth = (pa.z + pb.z) / 2;
        const both = pa.hit && pb.hit;
        const alpha = (0.06 + 0.18 * ((depth + 1) / 2)) * (sel.length && !both ? 0.5 : 1);
        ctx.strokeStyle = both ? `rgba(0,185,237,${0.25 + 0.5 * ((depth + 1) / 2)})` : `rgba(139,154,182,${alpha})`;
        ctx.beginPath();
        ctx.moveTo(pa.sx, pa.sy);
        ctx.lineTo(pb.sx, pb.sy);
        ctx.stroke();
      }

      // nodes, back to front
      const order = projected.map((_, i) => i).sort((i, j) => projected[i].z - projected[j].z);
      const g = glowRef.current;
      for (const i of order) {
        const p = projected[i];
        const front = (p.z + 1) / 2;
        if (p.hit) {
          const r = (2.2 + 1.6 * front) * p.scale;
          ctx.fillStyle = `rgba(0,185,237,${0.12 * g * front})`;
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, r * 3.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = `rgba(0,185,237,${0.55 + 0.45 * front})`;
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2);
          ctx.fill();
        } else {
          const dim = sel.length ? 0.35 : 1;
          ctx.fillStyle = `rgba(199,211,232,${(0.18 + 0.62 * front) * dim})`;
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, (1.1 + 1.1 * front) * p.scale, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // label the three front-most matches with their skills
      if (sel.length) {
        ctx.font = "500 11px var(--font-jetbrains), ui-monospace, monospace";
        ctx.textBaseline = "middle";
        const labelled = order
          .filter((i) => projected[i].hit && projected[i].z > 0.35)
          .slice(-3);
        for (const i of labelled) {
          const p = projected[i];
          const text = [...pool[i].skills].slice(0, 3).join(" · ");
          const w = ctx.measureText(text).width + 14;
          const x = Math.min(p.sx + 10, width - w - 4);
          ctx.fillStyle = `rgba(10,31,68,${0.85 * g})`;
          ctx.strokeStyle = `rgba(0,185,237,${0.6 * g})`;
          ctx.beginPath();
          ctx.roundRect(x, p.sy - 10, w, 20, 6);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = `rgba(255,255,255,${g})`;
          ctx.fillText(text, x + 7, p.sy);
        }
      }

      if (visible) frame = requestAnimationFrame(draw);
    }
    frame = requestAnimationFrame(draw);

    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      rotY += dx * 0.008;
      rotX = Math.max(-1.1, Math.min(1.1, rotX + dy * 0.008));
      velY = dx * 0.008;
      velX = dy * 0.004;
      if (!frame) frame = requestAnimationFrame(draw);
    };
    const onUp = (e: PointerEvent) => {
      dragging = false;
      if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") velY -= 0.02;
      if (e.key === "ArrowRight") velY += 0.02;
      if (e.key === "ArrowUp") velX -= 0.02;
      if (e.key === "ArrowDown") velX += 0.02;
      if (!frame) frame = requestAnimationFrame(draw);
    };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    canvas.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("keydown", onKey);
    };
  }, [pool, edges]);

  return (
    <canvas
      ref={canvasRef}
      tabIndex={0}
      role="img"
      aria-label={`An illustrative pool of ${POOL_SIZE} sample profiles drawn as a rotating sphere. Profiles matching the selected skills light up. Drag or use the arrow keys to spin it.`}
      className={`h-full w-full cursor-grab touch-none outline-none active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-cyan ${className ?? ""}`}
    />
  );
}
