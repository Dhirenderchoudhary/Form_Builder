"use client";

import { useEffect, useRef } from "react";
import { KonohaLeaf } from "./leaf";

/**
 * Renders the global Konoha atmosphere:
 *  - Falling leaf canvas
 *  - Floating chakra dots
 *  - Slowly rotating watermark
 *  - Vignette + faint rain layers
 *
 * Mounted once in the root layout. Pure visual layer with pointer-events: none.
 */
export function KonohaAtmosphere() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    const setSize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    setSize();

    const rand = (a: number, b: number) => Math.random() * (b - a) + a;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      rotation: number;
      rotSpeed: number;
      color: string;
      type: "leaf" | "chakra";
      life: number;
    }

    const particles: Particle[] = [];

    const leafColors = ["#FF6B00", "#228B22", "#8B4513", "#FFD700"];
    const chakraColors = ["#00D4FF", "#FF6B00", "#FFD700"];

    const spawnLeaf = (): Particle => ({
      x: rand(0, window.innerWidth),
      y: -20,
      vx: rand(-0.4, 0.4),
      vy: rand(0.4, 1.1),
      size: rand(6, 16),
      rotation: rand(0, Math.PI * 2),
      rotSpeed: rand(-0.02, 0.02),
      color: leafColors[Math.floor(Math.random() * leafColors.length)]!,
      type: "leaf",
      life: 1,
    });

    const spawnChakra = (): Particle => ({
      x: rand(0, window.innerWidth),
      y: window.innerHeight + 10,
      vx: rand(-0.2, 0.2),
      vy: rand(-1.0, -0.4),
      size: rand(1.2, 3),
      rotation: 0,
      rotSpeed: 0,
      color: chakraColors[Math.floor(Math.random() * chakraColors.length)]!,
      type: "chakra",
      life: 1,
    });

    // Seed initial leaves so the page isn't empty on load
    for (let i = 0; i < 22; i++) {
      const p = spawnLeaf();
      p.y = rand(0, window.innerHeight);
      particles.push(p);
    }

    const drawLeaf = (p: Particle) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size * 0.4, p.size, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.3)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, -p.size);
      ctx.lineTo(0, p.size);
      ctx.stroke();
      ctx.restore();
    };

    const drawChakra = (p: Particle) => {
      ctx.save();
      ctx.globalAlpha = p.life * 0.65;
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
      grad.addColorStop(0, p.color);
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    let raf = 0;
    let chakraTimer = 0;
    let running = true;

    const tick = () => {
      if (!running) return;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // Spawn leaves
      if (Math.random() < 0.04 && particles.filter((p) => p.type === "leaf").length < 30) {
        particles.push(spawnLeaf());
      }
      // Spawn chakra dots
      chakraTimer++;
      if (chakraTimer > 10) {
        chakraTimer = 0;
        if (particles.filter((p) => p.type === "chakra").length < 25) {
          particles.push(spawnChakra());
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]!;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;

        if (p.type === "leaf") {
          p.vx += Math.sin(p.y * 0.01) * 0.01;
          drawLeaf(p);
          if (p.y > window.innerHeight + 30) particles.splice(i, 1);
        } else {
          p.life -= 0.005;
          drawChakra(p);
          if (p.life <= 0 || p.y < -20) particles.splice(i, 1);
        }
      }

      raf = requestAnimationFrame(tick);
    };
    
    // Delay initialization so it doesn't block LCP
    const initTimeout = setTimeout(() => {
      raf = requestAnimationFrame(tick);
    }, 500);

    const onResize = () => setSize();
    window.addEventListener("resize", onResize);

    // Pause when tab is hidden — saves battery
    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      clearTimeout(initTimeout);
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="konoha-bg" aria-hidden tabIndex={-1} />
      <div className="konoha-rain" aria-hidden />
      <div className="konoha-watermark" aria-hidden>
        <KonohaLeaf size={800} color="#FF6B00" />
      </div>
      <div className="konoha-vignette" aria-hidden />
    </>
  );
}
