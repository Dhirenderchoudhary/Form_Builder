"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import styles from "./naruto.module.css";

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = "naruto-shippuden-form-v1";

const ELEMENTS = [
  { id: "fire", label: "Fire", icon: "🔥", className: styles.fire },
  { id: "water", label: "Water", icon: "💧", className: styles.water },
  { id: "wind", label: "Wind", icon: "🌀", className: styles.wind },
  { id: "lightning", label: "Lightning", icon: "⚡", className: styles.lightning },
  { id: "earth", label: "Earth", icon: "🪨", className: styles.earth },
] as const;

const RANKS = ["Genin", "Chunin", "Jonin", "ANBU", "Kage"] as const;

const ABILITIES = [
  "Genjutsu",
  "Ninjutsu",
  "Taijutsu",
  "Fuinjutsu",
  "Medical Ninjutsu",
  "Senjutsu",
] as const;

const MISSIONS = [
  { id: "recon", label: "Reconnaissance", icon: "🦅" },
  { id: "combat", label: "Combat", icon: "⚔️" },
  { id: "escort", label: "Escort", icon: "🛡️" },
  { id: "infiltration", label: "Infiltration", icon: "🥷" },
  { id: "srank", label: "S-Rank", icon: "💀" },
] as const;

const STEP_LABELS = [
  "Shinobi Identity",
  "Chakra & Rank",
  "Mission Briefing",
  "Oath & Submission",
] as const;

// ============================================================================
// Types
// ============================================================================

interface FormState {
  // Step 1
  fullName: string;
  clan: string;
  age: string;
  email: string;
  // Step 2
  element: string;
  rank: string;
  abilities: string[];
  chakra: number;
  // Step 3
  missionType: string;
  missionDetails: string;
  urgent: boolean;
  fileName: string;
  // Step 4
  oath: boolean;
}

const INITIAL_STATE: FormState = {
  fullName: "",
  clan: "",
  age: "",
  email: "",
  element: "",
  rank: "",
  abilities: [],
  chakra: 50,
  missionType: "",
  missionDetails: "",
  urgent: false,
  fileName: "",
  oath: false,
};

// ============================================================================
// Konoha Leaf SVG (used for header logo + success seal + watermark)
// ============================================================================

function KonohaLeaf({ size = 88, color = "#FF6B00" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      <defs>
        <radialGradient id="leafGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#leafGrad)" />
      <circle cx="50" cy="50" r="46" fill="none" stroke={color} strokeWidth="2" />
      {/* Stylized leaf */}
      <path
        d="M50 18 Q 64 28, 64 44 Q 64 58, 50 60 Q 36 58, 36 44 Q 36 28, 50 18 Z"
        fill={color}
      />
      <path d="M50 60 L 50 82" stroke={color} strokeWidth="4" strokeLinecap="round" />
      <path
        d="M50 50 Q 60 56, 64 64"
        fill="none"
        stroke="#0A0A0F"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function KunaiIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 2 L 14 6 L 14 16 L 16 18 L 13 21 L 12 22 L 11 21 L 8 18 L 10 16 L 10 6 Z"
        fill="currentColor"
      />
      <circle cx="12" cy="19" r="1.5" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function ScrollIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <rect x="4" y="6" width="16" height="12" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 9 L 20 9 M 4 15 L 20 15" stroke="currentColor" strokeWidth="1" />
      <path d="M2 6 L 6 6 M 2 18 L 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function HashIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M9 4 L 7 20 M 17 4 L 15 20 M 4 9 L 20 9 M 4 15 L 20 15"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ShurikenIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 3 L 14 10 L 21 12 L 14 14 L 12 21 L 10 14 L 3 12 L 10 10 Z"
        fill="currentColor"
      />
      <circle cx="12" cy="12" r="1.5" fill="#0A0A0F" />
    </svg>
  );
}

// ============================================================================
// Canvas particle system
// ============================================================================

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotSpeed: number;
  color: string;
  type: "leaf" | "chakra" | "kunai";
  life: number;
  maxLife: number;
}

function useParticles(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth * window.devicePixelRatio);
    let height = (canvas.height = window.innerHeight * window.devicePixelRatio);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const particles: Particle[] = [];
    let lastKunai = 0;

    function rand(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    function spawnLeaf(): Particle {
      const colors = ["#FF6B00", "#228B22", "#8B4513", "#FFD700"];
      return {
        x: rand(0, window.innerWidth),
        y: -20,
        vx: rand(-0.4, 0.4),
        vy: rand(0.4, 1.2),
        size: rand(6, 18),
        rotation: rand(0, Math.PI * 2),
        rotSpeed: rand(-0.02, 0.02),
        color: colors[Math.floor(Math.random() * colors.length)]!,
        type: "leaf",
        life: 1,
        maxLife: 1,
      };
    }

    function spawnChakra(): Particle {
      const colors = ["#00D4FF", "#FF6B00", "#FFD700"];
      return {
        x: rand(0, window.innerWidth),
        y: window.innerHeight + 10,
        vx: rand(-0.2, 0.2),
        vy: rand(-1.2, -0.5),
        size: rand(1.5, 3.5),
        rotation: 0,
        rotSpeed: 0,
        color: colors[Math.floor(Math.random() * colors.length)]!,
        type: "chakra",
        life: 1,
        maxLife: 1,
      };
    }

    function spawnKunai(): Particle {
      return {
        x: rand(0, window.innerWidth),
        y: -30,
        vx: rand(0.8, 1.6),
        vy: rand(3, 5),
        size: 14,
        rotation: Math.atan2(4, 1.2),
        rotSpeed: 0,
        color: "#888",
        type: "kunai",
        life: 1,
        maxLife: 1,
      };
    }

    // Seed initial leaves
    for (let i = 0; i < 25; i++) {
      const p = spawnLeaf();
      p.y = rand(0, window.innerHeight);
      particles.push(p);
    }

    function drawLeaf(p: Particle) {
      ctx!.save();
      ctx!.translate(p.x, p.y);
      ctx!.rotate(p.rotation);
      ctx!.globalAlpha = 0.18;
      ctx!.fillStyle = p.color;
      ctx!.beginPath();
      ctx!.ellipse(0, 0, p.size * 0.4, p.size, 0, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.strokeStyle = "rgba(0,0,0,0.3)";
      ctx!.lineWidth = 0.5;
      ctx!.beginPath();
      ctx!.moveTo(0, -p.size);
      ctx!.lineTo(0, p.size);
      ctx!.stroke();
      ctx!.restore();
    }

    function drawChakra(p: Particle) {
      ctx!.save();
      const alpha = p.life * 0.7;
      ctx!.globalAlpha = alpha;
      const grad = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
      grad.addColorStop(0, p.color);
      grad.addColorStop(1, "transparent");
      ctx!.fillStyle = grad;
      ctx!.beginPath();
      ctx!.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.fillStyle = p.color;
      ctx!.globalAlpha = alpha;
      ctx!.beginPath();
      ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.restore();
    }

    function drawKunai(p: Particle) {
      ctx!.save();
      ctx!.translate(p.x, p.y);
      ctx!.rotate(p.rotation);
      ctx!.globalAlpha = 0.4;
      ctx!.fillStyle = p.color;
      ctx!.beginPath();
      ctx!.moveTo(0, -p.size);
      ctx!.lineTo(p.size * 0.3, 0);
      ctx!.lineTo(p.size * 0.3, p.size);
      ctx!.lineTo(-p.size * 0.3, p.size);
      ctx!.lineTo(-p.size * 0.3, 0);
      ctx!.closePath();
      ctx!.fill();
      ctx!.restore();
    }

    let raf = 0;
    let running = true;
    let chakraTimer = 0;

    function tick() {
      if (!running) return;
      ctx!.clearRect(0, 0, window.innerWidth, window.innerHeight);

      const now = performance.now();

      // Spawn rates
      if (Math.random() < 0.04 && particles.filter((p) => p.type === "leaf").length < 35) {
        particles.push(spawnLeaf());
      }
      chakraTimer++;
      if (chakraTimer > 8) {
        chakraTimer = 0;
        if (particles.filter((p) => p.type === "chakra").length < 30) {
          particles.push(spawnChakra());
        }
      }
      if (now - lastKunai > 8000 && Math.random() < 0.01) {
        lastKunai = now;
        particles.push(spawnKunai());
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
        } else if (p.type === "chakra") {
          p.life -= 0.005;
          drawChakra(p);
          if (p.life <= 0 || p.y < -20) particles.splice(i, 1);
        } else if (p.type === "kunai") {
          drawKunai(p);
          if (p.y > window.innerHeight + 50 || p.x > window.innerWidth + 50)
            particles.splice(i, 1);
        }
      }

      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    function onResize() {
      width = canvas!.width = window.innerWidth * window.devicePixelRatio;
      height = canvas!.height = window.innerHeight * window.devicePixelRatio;
      canvas!.style.width = `${window.innerWidth}px`;
      canvas!.style.height = `${window.innerHeight}px`;
      ctx!.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    window.addEventListener("resize", onResize);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [canvasRef]);
}

// ============================================================================
// Main component
// ============================================================================

export default function NarutoForm() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [explosion, setExplosion] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [soundOn, setSoundOn] = useState(false);

  useParticles(canvasRef);

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.data) setData({ ...INITIAL_STATE, ...parsed.data });
        if (typeof parsed.step === "number") setStep(parsed.step);
      }
    } catch {
      // ignore
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, step }));
    } catch {
      // ignore
    }
  }, [data, step]);

  // Inject Google Fonts once
  useEffect(() => {
    const id = "naruto-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Noto+Sans+JP:wght@300;400;500;700&display=swap";
    document.head.appendChild(link);
  }, []);

  // ----- Sound (Web Audio synthesis) -----
  const audioCtxRef = useRef<AudioContext | null>(null);
  const playSound = useCallback(
    (type: "step" | "chime" | "submit") => {
      if (!soundOn) return;
      try {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext })
              .webkitAudioContext)();
        }
        const ctx = audioCtxRef.current;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === "step") {
          osc.frequency.setValueAtTime(180, now);
          osc.frequency.exponentialRampToValueAtTime(60, now + 0.3);
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
          osc.type = "sine";
          osc.start(now);
          osc.stop(now + 0.3);
        } else if (type === "chime") {
          osc.frequency.setValueAtTime(880, now);
          osc.frequency.exponentialRampToValueAtTime(1320, now + 0.15);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
          osc.type = "triangle";
          osc.start(now);
          osc.stop(now + 0.2);
        } else if (type === "submit") {
          // Epic boom: low rumble + high sparkle
          osc.frequency.setValueAtTime(60, now);
          osc.frequency.exponentialRampToValueAtTime(20, now + 1.5);
          gain.gain.setValueAtTime(0.4, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
          osc.type = "sawtooth";
          osc.start(now);
          osc.stop(now + 1.5);
          // Sparkle
          const sparkle = ctx.createOscillator();
          const sg = ctx.createGain();
          sparkle.connect(sg);
          sg.connect(ctx.destination);
          sparkle.frequency.setValueAtTime(2400, now);
          sparkle.frequency.exponentialRampToValueAtTime(800, now + 0.6);
          sg.gain.setValueAtTime(0.1, now);
          sg.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
          sparkle.type = "triangle";
          sparkle.start(now);
          sparkle.stop(now + 0.6);
        }
      } catch {
        // ignore audio errors
      }
    },
    [soundOn],
  );

  // ----- Validation -----
  const validateStep = useCallback(
    (s: number): Record<string, string> => {
      const e: Record<string, string> = {};
      if (s === 0) {
        if (!data.fullName.trim())
          e.fullName = "Your chakra is insufficient — please fill this field, shinobi!";
        if (!data.clan.trim()) e.clan = "Every shinobi must declare their clan.";
        if (!data.age.trim()) e.age = "How many years have you trained?";
        else if (Number.isNaN(Number(data.age)) || Number(data.age) < 0)
          e.age = "Enter a valid number of years.";
        if (!data.email.trim()) e.email = "We need a hawk address to reach you.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
          e.email = "That hawk cannot find this address.";
      } else if (s === 1) {
        if (!data.element) e.element = "Choose your chakra nature.";
        if (!data.rank) e.rank = "Declare your ninja rank.";
      } else if (s === 2) {
        if (!data.missionType) e.missionType = "Select a mission type.";
        if (!data.missionDetails.trim()) e.missionDetails = "The Hokage needs details.";
      } else if (s === 3) {
        if (!data.oath) e.oath = "Swear the oath, shinobi.";
      }
      return e;
    },
    [data],
  );

  const next = () => {
    const e = validateStep(step);
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setErrors({});
    setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));
    playSound("step");
  };

  const prev = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
    playSound("step");
  };

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setData((d) => ({ ...d, [key]: value }));
    if (errors[key as string]) {
      setErrors((e) => {
        const copy = { ...e };
        delete copy[key as string];
        return copy;
      });
    }
  };

  const markComplete = (key: string, isFilled: boolean) => {
    setCompleted((c) => {
      if (c[key] === isFilled) return c;
      return { ...c, [key]: isFilled };
    });
    if (isFilled) playSound("chime");
  };

  // ----- Submit -----
  const handleSubmit = () => {
    const e = validateStep(3);
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setSubmitting(true);
    playSound("submit");
    // Charge for 600ms, then flash, then success
    setTimeout(() => {
      setExplosion(true);
      setTimeout(() => {
        setSuccess(true);
        setExplosion(false);
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          // ignore
        }
      }, 500);
    }, 500);
  };

  // ----- File drop -----
  const handleDrop = (ev: React.DragEvent) => {
    ev.preventDefault();
    setDragOver(false);
    const file = ev.dataTransfer.files?.[0];
    if (file) update("fileName", file.name);
  };

  // ============================================================================
  // Success screen
  // ============================================================================
  if (success) {
    return (
      <div className={styles.root}>
        <canvas ref={canvasRef} className={styles.bgCanvas} aria-hidden />
        <div className={styles.bgGradient} aria-hidden />
        <div className={styles.successOverlay}>
          <div className={styles.seal}>
            <KonohaLeaf size={160} color="#FF6B00" />
          </div>
          <h1 className={styles.successTitle}>Mission Accepted</h1>
          <p className={styles.successMsg}>
            Your registration has been submitted to the Hokage&apos;s office.
            <br />
            Report at dawn, shinobi.
          </p>
          <blockquote className={styles.itachiQuote}>
            &ldquo;Those who forgive themselves, and are able to accept their
            true nature… They are the strong ones.&rdquo;
            <span className={styles.itachiAuthor}>— Itachi Uchiha</span>
          </blockquote>
          <Confetti />
        </div>
      </div>
    );
  }

  const progressPercent = (step / (STEP_LABELS.length - 1)) * 100;

  return (
    <div className={styles.root}>
      <canvas ref={canvasRef} className={styles.bgCanvas} aria-hidden />
      <div className={styles.bgGradient} aria-hidden />
      <div className={styles.bgClouds} aria-hidden />
      <div className={styles.bgRain} aria-hidden />
      <div className={styles.bgWatermark} aria-hidden>
        <KonohaLeaf size={700} color="#FF6B00" />
      </div>
      <div className={styles.bgVignette} aria-hidden />

      <button
        type="button"
        className={styles.soundToggle}
        onClick={() => setSoundOn((s) => !s)}
        aria-label={soundOn ? "Mute sounds" : "Unmute sounds"}
        title={soundOn ? "Sound on" : "Sound off"}
      >
        {soundOn ? "🔊" : "🔇"}
      </button>

      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.logo}>
            <KonohaLeaf />
          </div>
          <h1 className={styles.title}>Hidden Leaf Village</h1>
          <p className={styles.subtitle}>Shinobi Registration · Chunin Exam Clearance</p>
          <div className={styles.headerUnderline} />
        </header>

        {/* Progress */}
        <div className={styles.progress} role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={STEP_LABELS.length}>
          <div className={styles.progressLine} />
          <div
            className={styles.progressLineFill}
            style={{ width: `calc(${progressPercent}% - ${progressPercent === 0 ? 0 : 24}px)` }}
          />
          {STEP_LABELS.map((_, i) => (
            <div
              key={i}
              className={`${styles.stepMarker} ${i === step ? styles.active : ""} ${
                i < step ? styles.completed : ""
              }`}
              aria-current={i === step ? "step" : undefined}
            >
              {i < step ? <ShurikenIcon size={20} /> : <span>{i + 1}</span>}
            </div>
          ))}
        </div>
        <div className={styles.stepLabel}>{STEP_LABELS[step]}</div>

        {/* Card */}
        <div className={styles.card}>
          <div key={step} className={styles.step}>
            {step === 0 && (
              <Step1
                data={data}
                errors={errors}
                completed={completed}
                onChange={update}
                onComplete={markComplete}
              />
            )}
            {step === 1 && (
              <Step2
                data={data}
                errors={errors}
                onChange={update}
              />
            )}
            {step === 2 && (
              <Step3
                data={data}
                errors={errors}
                onChange={update}
                onComplete={markComplete}
                dragOver={dragOver}
                setDragOver={setDragOver}
                onDrop={handleDrop}
              />
            )}
            {step === 3 && (
              <Step4 data={data} errors={errors} onChange={update} />
            )}
          </div>

          {/* Actions */}
          {step < 3 ? (
            <div className={styles.actions}>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={prev}
                disabled={step === 0}
              >
                ← Back
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={next}
              >
                Continue →
              </button>
            </div>
          ) : (
            <div className={styles.submitWrap}>
              <div className={styles.actions}>
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnSecondary}`}
                  onClick={prev}
                >
                  ← Back
                </button>
                <span />
              </div>
              <button
                type="button"
                className={`${styles.rasengan} ${submitting ? styles.charging : ""}`}
                onClick={handleSubmit}
                disabled={submitting || !data.oath}
                aria-label="Submit Rasengan"
              >
                <span className={styles.rasenganRing} aria-hidden />
                <span className={styles.rasenganRing2} aria-hidden />
                <span className={styles.rasenganLabel}>
                  {submitting ? "..." : "Rasengan"}
                </span>
              </button>
              <p className={styles.submitHint}>
                {submitting
                  ? "Releasing chakra…"
                  : data.oath
                    ? "Strike to release"
                    : "Swear the oath to release"}
              </p>
            </div>
          )}
        </div>
      </div>

      {explosion && <div className={styles.explosion} aria-hidden />}
    </div>
  );
}

// ============================================================================
// Step 1
// ============================================================================

function Step1({
  data,
  errors,
  completed,
  onChange,
  onComplete,
}: {
  data: FormState;
  errors: Record<string, string>;
  completed: Record<string, boolean>;
  onChange: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  onComplete: (k: string, filled: boolean) => void;
}) {
  return (
    <>
      <h2 className={styles.stepHeading}>Shinobi Identity</h2>
      <p className={styles.stepDesc}>Identify yourself, warrior of the Leaf.</p>

      <Field
        label="Shinobi Name"
        required
        error={errors.fullName}
        completed={completed.fullName && !!data.fullName}
        icon={<KunaiIcon />}
      >
        <input
          className={styles.input}
          placeholder="e.g. Naruto Uzumaki"
          value={data.fullName}
          onChange={(e) => onChange("fullName", e.target.value)}
          onBlur={(e) => onComplete("fullName", !!e.target.value.trim())}
        />
      </Field>

      <Field
        label="Your Clan"
        required
        error={errors.clan}
        completed={completed.clan && !!data.clan}
        icon={<KunaiIcon />}
      >
        <input
          className={styles.input}
          placeholder="e.g. Uzumaki, Uchiha, Hyuga"
          value={data.clan}
          onChange={(e) => onChange("clan", e.target.value)}
          onBlur={(e) => onComplete("clan", !!e.target.value.trim())}
        />
      </Field>

      <Field
        label="Years Since Awakening"
        required
        error={errors.age}
        completed={completed.age && !!data.age}
        icon={<HashIcon />}
      >
        <input
          type="number"
          className={styles.input}
          placeholder="e.g. 16"
          value={data.age}
          onChange={(e) => onChange("age", e.target.value)}
          onBlur={(e) => onComplete("age", !!e.target.value.trim())}
          min={0}
          max={100}
        />
      </Field>

      <Field
        label="Hawk Messenger Address"
        required
        error={errors.email}
        completed={completed.email && !!data.email}
        icon={<ScrollIcon />}
      >
        <input
          type="email"
          className={styles.input}
          placeholder="hawk@konohagakure.jp"
          value={data.email}
          onChange={(e) => onChange("email", e.target.value)}
          onBlur={(e) => onComplete("email", !!e.target.value.trim())}
        />
      </Field>
    </>
  );
}

// ============================================================================
// Step 2
// ============================================================================

function Step2({
  data,
  errors,
  onChange,
}: {
  data: FormState;
  errors: Record<string, string>;
  onChange: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
}) {
  const chakraLabel =
    data.chakra < 25
      ? "Insufficient"
      : data.chakra < 50
        ? "Genin Level"
        : data.chakra < 75
          ? "Chunin Level"
          : data.chakra < 95
            ? "Jonin Level"
            : "Kage Level";

  const toggleAbility = (a: string) => {
    const set = new Set(data.abilities);
    if (set.has(a)) set.delete(a);
    else set.add(a);
    onChange("abilities", Array.from(set));
  };

  return (
    <>
      <h2 className={styles.stepHeading}>Chakra Nature & Rank</h2>
      <p className={styles.stepDesc}>What flows through you?</p>

      <div className={styles.field}>
        <label className={styles.label}>
          Chakra Nature<span className={styles.required}>✦</span>
        </label>
        <div
          className={`${styles.orbGroup} ${errors.element ? styles.fieldError : ""}`}
          role="radiogroup"
        >
          {ELEMENTS.map((el) => (
            <label
              key={el.id}
              className={`${styles.orb} ${el.className} ${
                data.element === el.id ? styles.selected : ""
              }`}
            >
              <input
                type="radio"
                name="element"
                value={el.id}
                checked={data.element === el.id}
                onChange={() => onChange("element", el.id)}
              />
              <span className={styles.orbIcon}>{el.icon}</span>
              <span>{el.label}</span>
            </label>
          ))}
        </div>
        {errors.element && <div className={styles.errorText}>⚡ {errors.element}</div>}
      </div>

      <Field label="Ninja Rank" required error={errors.rank}>
        <select
          className={styles.select}
          value={data.rank}
          onChange={(e) => onChange("rank", e.target.value)}
          style={{ paddingLeft: 16 }}
        >
          <option value="">Select your rank…</option>
          {RANKS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </Field>

      <div className={styles.field}>
        <label className={styles.label}>Special Abilities</label>
        <div className={styles.tagGroup}>
          {ABILITIES.map((a) => (
            <button
              type="button"
              key={a}
              className={`${styles.tag} ${data.abilities.includes(a) ? styles.selected : ""}`}
              onClick={() => toggleAbility(a)}
              aria-pressed={data.abilities.includes(a)}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Chakra Level</label>
        <div className={styles.sliderWrap}>
          <div className={styles.sliderTrack}>
            <div className={styles.sliderFill} style={{ width: `${data.chakra}%` }} />
            <input
              type="range"
              className={styles.slider}
              min={0}
              max={100}
              value={data.chakra}
              onChange={(e) => onChange("chakra", Number(e.target.value))}
            />
          </div>
          <div className={styles.sliderMeta}>
            <span className={styles.sliderLabel}>{chakraLabel}</span>
            <span className={styles.sliderValue}>{data.chakra}%</span>
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================================================
// Step 3
// ============================================================================

function Step3({
  data,
  errors,
  onChange,
  onComplete,
  dragOver,
  setDragOver,
  onDrop,
}: {
  data: FormState;
  errors: Record<string, string>;
  onChange: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  onComplete: (k: string, filled: boolean) => void;
  dragOver: boolean;
  setDragOver: (b: boolean) => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  return (
    <>
      <h2 className={styles.stepHeading}>Mission Briefing</h2>
      <p className={styles.stepDesc}>Tell the Hokage what awaits you.</p>

      <div className={styles.field}>
        <label className={styles.label}>
          Mission Type<span className={styles.required}>✦</span>
        </label>
        <div className={`${styles.cardGrid} ${errors.missionType ? styles.fieldError : ""}`}>
          {MISSIONS.map((m) => (
            <button
              type="button"
              key={m.id}
              className={`${styles.missionCard} ${
                data.missionType === m.id ? styles.selected : ""
              }`}
              onClick={() => onChange("missionType", m.id)}
            >
              <span className={styles.missionIcon}>{m.icon}</span>
              {m.label}
            </button>
          ))}
        </div>
        {errors.missionType && <div className={styles.errorText}>⚡ {errors.missionType}</div>}
      </div>

      <Field label="Mission Details" required error={errors.missionDetails}>
        <textarea
          className={styles.textarea}
          rows={5}
          placeholder="Describe the mission, the targets, the risks…"
          value={data.missionDetails}
          onChange={(e) => onChange("missionDetails", e.target.value)}
          onBlur={(e) => onComplete("missionDetails", !!e.target.value.trim())}
        />
      </Field>

      <div className={styles.field}>
        <label className={styles.label}>Urgency</label>
        <div className={styles.toggleRow}>
          <span className={styles.toggleLabel}>
            {data.urgent ? "S-Class — Immediate" : "Standard timing"}
          </span>
          <button
            type="button"
            className={`${styles.toggleSwitch} ${data.urgent ? styles.on : ""}`}
            onClick={() => onChange("urgent", !data.urgent)}
            aria-pressed={data.urgent}
            aria-label="Toggle urgency"
          >
            <span className={styles.toggleKnob}>{data.urgent ? "印" : ""}</span>
          </button>
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Mission Scroll</label>
        <label
          className={`${styles.dropZone} ${dragOver ? styles.over : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
        >
          <input
            type="file"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onChange("fileName", f.name);
            }}
          />
          <div>📜 Drop your mission scroll here</div>
          {data.fileName && <div className={styles.fileName}>✓ {data.fileName}</div>}
        </label>
      </div>
    </>
  );
}

// ============================================================================
// Step 4
// ============================================================================

function Step4({
  data,
  errors,
  onChange,
}: {
  data: FormState;
  errors: Record<string, string>;
  onChange: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
}) {
  const elementLabel =
    ELEMENTS.find((e) => e.id === data.element)?.label ?? "—";
  const missionLabel =
    MISSIONS.find((m) => m.id === data.missionType)?.label ?? "—";

  const rows: Array<[string, string]> = [
    ["Shinobi Name", data.fullName || "—"],
    ["Clan", data.clan || "—"],
    ["Years", data.age || "—"],
    ["Hawk Address", data.email || "—"],
    ["Chakra Nature", elementLabel],
    ["Rank", data.rank || "—"],
    ["Abilities", data.abilities.length ? data.abilities.join(", ") : "—"],
    ["Chakra Level", `${data.chakra}%`],
    ["Mission", missionLabel],
    ["Urgency", data.urgent ? "S-Class — Immediate" : "Standard"],
    ["Scroll", data.fileName || "—"],
  ];

  return (
    <>
      <h2 className={styles.stepHeading}>Oath & Submission</h2>
      <p className={styles.stepDesc}>Review your scroll, then swear the oath.</p>

      <dl className={styles.review}>
        {rows.map(([k, v]) => (
          <div key={k} className={styles.reviewCard}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>

      <label className={`${styles.oath} ${data.oath ? styles.checked : ""}`}>
        <input
          type="checkbox"
          checked={data.oath}
          onChange={(e) => onChange("oath", e.target.checked)}
        />
        <span className={styles.oathBox} />
        <span className={styles.oathText}>
          I swear on the Will of Fire to complete this mission.
        </span>
      </label>
      {errors.oath && <div className={styles.errorText}>⚡ {errors.oath}</div>}
    </>
  );
}

// ============================================================================
// Reusable Field
// ============================================================================

function Field({
  label,
  required,
  error,
  completed,
  icon,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  completed?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className={`${styles.field} ${error ? styles.fieldError : ""}`}>
      <label className={styles.label}>
        {label}
        {required && <span className={styles.required}>✦</span>}
      </label>
      <div className={styles.inputWrap}>
        {icon && <span className={styles.inputIcon}>{icon}</span>}
        {children}
        {completed && !error && (
          <span className={styles.checkmark} aria-hidden>
            ✦
          </span>
        )}
      </div>
      {error && <div className={styles.errorText}>⚡ {error}</div>}
    </div>
  );
}

// ============================================================================
// Confetti (success screen)
// ============================================================================

function Confetti() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#FF6B00", "#FFD700", "#228B22", "#CC0000"];
    const pieces = Array.from({ length: 80 }, () => ({
      x: Math.random() * window.innerWidth,
      y: -Math.random() * 200,
      vy: Math.random() * 2 + 1,
      vx: Math.random() * 2 - 1,
      size: Math.random() * 8 + 4,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.1,
      color: colors[Math.floor(Math.random() * colors.length)]!,
    }));

    let raf = 0;
    function loop() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      pieces.forEach((p) => {
        p.y += p.vy;
        p.x += p.vx;
        p.rot += p.vr;
        if (p.y > canvas!.height + 20) {
          p.y = -20;
          p.x = Math.random() * canvas!.width;
        }
        ctx!.save();
        ctx!.translate(p.x, p.y);
        ctx!.rotate(p.rot);
        ctx!.fillStyle = p.color;
        ctx!.beginPath();
        ctx!.ellipse(0, 0, p.size * 0.5, p.size, 0, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.restore();
      });
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={ref}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 51,
      }}
      aria-hidden
    />
  );
}
