import { SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import {
  ArrowRight,
  CheckCircle2,
  ScrollText,
  Wind,
  Zap,
  Eye,
  Flame,
} from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KonohaLeaf, Shuriken } from "@/components/konoha/leaf";
import {
  Sharingan,
  Headband,
  Rasengan,
  HokageRock,
  CloudPattern,
  Scroll,
  SageMarks,
} from "@/components/konoha/illustrations";
import { NetworkStatus } from "@/components/konoha/network-status";

const oaths = [
  "No credit scroll required",
  "Live in 60 seconds, shinobi",
  "100 missions per moon — free tier",
];

const techniques = [
  {
    icon: Wind,
    kanji: "風",
    name: "Wind Release",
    title: "Drag & drop builder",
    description:
      "Compose mission scrolls with the speed of the Yondaime. No code, no friction — only flow.",
  },
  {
    icon: Eye,
    kanji: "眼",
    name: "Sharingan",
    title: "Realtime analytics",
    description:
      "Read every drop-off, every hesitation. See your form the way an Uchiha sees a fight.",
  },
  {
    icon: Zap,
    kanji: "雷",
    name: "Lightning Style",
    title: "Webhook integrations",
    description:
      "Pipe responses to Slack, Notion, Sheets, or your own jutsu. Set it once, never look back.",
  },
  {
    icon: Flame,
    kanji: "炎",
    name: "Fire Release",
    title: "Conditional logic",
    description:
      "Branch and adapt. Show the right field, ask the right question, at the right moment.",
  },
];

const ranks = [
  {
    rank: "壱",
    label: "Genin",
    title: "Forge the scroll",
    description:
      "Pick a template or start from blank parchment. Drag the fields, write the prompts.",
  },
  {
    rank: "弐",
    label: "Chunin",
    title: "Seal with chakra",
    description:
      "Add validation, branching, password seals. Customize the theme. Publish to the village.",
  },
  {
    rank: "参",
    label: "Jonin",
    title: "Receive the intel",
    description:
      "Watch responses flow in. Export to CSV, forward to allies, sleep well at night.",
  },
];

export default async function HomePage() {
  const { userId } = await auth();
  const isSignedIn = !!userId;
  return (
    <div className="relative min-h-screen text-foreground">
      <Header />
      <NetworkStatus />

      {/* ------------------------------------------------------------------
          HERO — Hokage Rock silhouette + asymmetric type
          ------------------------------------------------------------------ */}
      <section className="relative flex min-h-screen items-center overflow-hidden px-6 pt-24">
        {/* Hokage Rock backdrop */}
        <div className="absolute inset-x-0 bottom-0 z-0 opacity-50">
          <HokageRock width={1600} className="w-full" />
        </div>

        {/* Akatsuki cloud pattern, very subtle */}
        <div className="absolute inset-0 z-0 opacity-50">
          <CloudPattern className="absolute inset-0" opacity={0.025} />
        </div>

        <div className="relative z-10 container mx-auto grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Left — copy */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="h-px w-12 bg-konoha-orange/60" />
              <span className="text-[10px] font-medium uppercase tracking-[0.4em] text-konoha-orange">
                Hidden Leaf · Edition III
              </span>
            </div>

            <h1 className="font-heading text-4xl font-black leading-[0.95] tracking-tight sm:text-5xl md:text-6xl lg:text-[5.5rem]">
              <span className="block text-foreground/90">Forms</span>
              <span className="block">
                forged with the
              </span>
              <span className="block bg-gradient-to-r from-konoha-orange via-konoha-gold to-konoha-orange bg-clip-text text-transparent text-glow-orange">
                Will of Fire.
              </span>
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Build mission scrolls that capture intel. Seal them with chakra.
              Send them across the village in seconds. Built for shinobi who
              ship.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {isSignedIn ? (
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="btn-rasengan gap-2 bg-gradient-to-br from-konoha-orange to-[#cc4400] font-heading uppercase tracking-[0.18em] shadow-[0_0_30px_rgba(255,107,0,0.35)] hover:shadow-[0_0_50px_rgba(255,107,0,0.5)]"
                  >
                    Hokage&apos;s Desk
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <SignUpButton mode="modal">
                    <Button
                      size="lg"
                      className="btn-rasengan gap-2 bg-gradient-to-br from-konoha-orange to-[#cc4400] font-heading uppercase tracking-[0.18em] shadow-[0_0_30px_rgba(255,107,0,0.35)] hover:shadow-[0_0_50px_rgba(255,107,0,0.5)]"
                    >
                      Begin training
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </SignUpButton>

                  <Link href="/api/demo-login">
                    <Button
                      variant="outline"
                      size="lg"
                      className="gap-2 border-konoha-orange text-konoha-orange font-heading uppercase tracking-[0.18em] hover:bg-konoha-orange/15"
                    >
                      Try Sandbox Demo
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )}

              <Link href="/naruto">
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 border-konoha-forest font-heading uppercase tracking-[0.18em] hover:border-konoha-orange hover:text-konoha-orange"
                >
                  <ScrollText className="h-4 w-4" />
                  See the Chunin Exam
                </Button>
              </Link>
            </div>

            <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2">
              {oaths.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-konoha-orange" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right — Rasengan + headband */}
          <div className="lg:col-span-5 relative flex flex-col items-center gap-8">
            <div className="relative">
              <div className="absolute inset-0 -z-10 animate-chakra-pulse rounded-full bg-konoha-chakra/20 blur-3xl" />
              <Rasengan size={260} />
            </div>
            <Headband size={300} className="opacity-90" />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------
          DIVIDER — chakra line
          ------------------------------------------------------------------ */}
      <div className="container mx-auto px-6">
        <div className="chakra-divider" />
      </div>

      {/* ------------------------------------------------------------------
          TECHNIQUES — feature grid
          ------------------------------------------------------------------ */}
      <section id="features" className="relative z-10 container mx-auto px-6 py-24">
        <div className="mb-14 grid grid-cols-1 items-end gap-6 md:grid-cols-2">
          <div>
            <p className="mb-3 text-[10px] uppercase tracking-[0.4em] text-konoha-orange">
              Jutsu · 術
            </p>
            <h2 className="font-heading text-3xl font-bold tracking-tight md:text-5xl">
              Master every<br />
              <span className="text-konoha-orange">technique</span>.
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground md:text-right md:text-base">
            Four fundamental jutsu. Endless combinations. Each one tested in the
            field by shinobi who care about every detail.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {techniques.map(({ icon: Icon, kanji, name, title, description }) => (
            <article
              key={title}
              className="scroll-card group relative flex flex-col gap-3 p-6 transition-all hover:-translate-y-1 hover:border-konoha-orange/60 hover:shadow-[0_0_30px_rgba(255,107,0,0.15)]"
            >
              <span className="absolute right-3 top-2 font-heading text-5xl leading-none text-konoha-orange/10 transition-colors group-hover:text-konoha-orange/25">
                {kanji}
              </span>

              <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-md border border-konoha-orange/40 bg-konoha-ink text-konoha-orange transition-all group-hover:border-konoha-orange group-hover:shadow-[0_0_16px_rgba(255,107,0,0.4)]">
                <Icon className="h-5 w-5" />
              </div>

              <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
                {name}
              </p>
              <h3 className="font-heading text-lg font-bold tracking-wide leading-tight">
                {title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------
          PATH OF THE SHINOBI — three ranks
          ------------------------------------------------------------------ */}
      <section
        id="how-it-works"
        className="relative z-10 border-y border-konoha-forest/30 bg-konoha-ink/40 px-6 py-24 backdrop-blur-sm overflow-hidden"
      >
        {/* Sharingan watermark */}
        <div className="pointer-events-none absolute right-[-80px] top-1/2 -translate-y-1/2 opacity-[0.06]">
          <Sharingan size={520} />
        </div>

        <div className="relative container mx-auto">
          <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-2 md:items-end">
            <div>
              <p className="mb-3 text-[10px] uppercase tracking-[0.4em] text-konoha-orange">
                Path · 道
              </p>
              <h2 className="font-heading text-3xl font-bold tracking-tight md:text-5xl">
                From genin<br />
                to <span className="text-konoha-orange">legend</span>.
              </h2>
            </div>
            <div className="flex md:justify-end">
              <SageMarks size={120} className="text-konoha-orange/60" />
            </div>
          </div>

          <ol className="grid gap-10 md:grid-cols-3">
            {ranks.map(({ rank, label, title, description }, i) => (
              <li
                key={rank}
                className="relative flex flex-col gap-4 border-l border-konoha-forest pl-6"
              >
                <span className="absolute -left-3 top-0 flex h-6 w-6 items-center justify-center rounded-full border border-konoha-orange bg-konoha-ink">
                  <span className="h-2 w-2 rounded-full bg-konoha-orange shadow-[0_0_8px_#FF6B00]" />
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="font-heading text-6xl font-black text-konoha-orange/30 leading-none">
                    {rank}
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-konoha-gold">
                    {label}
                  </span>
                </div>
                <h3 className="font-heading text-xl font-bold tracking-wide">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
                {i < ranks.length - 1 && (
                  <Shuriken
                    size={14}
                    color="#FF6B00"
                    className="absolute -bottom-6 left-[-7px] opacity-40 animate-spin-slow"
                  />
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ------------------------------------------------------------------
          DEMO CTA — points to /naruto form
          ------------------------------------------------------------------ */}
      <section className="relative z-10 container mx-auto px-6 py-24">
        <div className="scroll-card relative overflow-hidden p-6 sm:p-10 md:p-16">
          <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 opacity-[0.07]">
            <KonohaLeaf size={420} color="#FF6B00" />
          </div>
          <div aria-hidden className="pointer-events-none absolute -left-20 -bottom-20 opacity-[0.07]">
            <Sharingan size={360} />
          </div>

          <div className="relative grid grid-cols-1 items-center gap-10 md:grid-cols-2">
            <div className="flex flex-col gap-5">
              <p className="text-[10px] uppercase tracking-[0.4em] text-konoha-orange">
                Live demo
              </p>
              <h2 className="font-heading text-3xl font-black leading-tight md:text-5xl">
                Sit the
                <span className="text-konoha-orange text-glow-orange"> Chunin Exam</span>.
              </h2>
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
                A four-step shinobi registration. Element selection, mission
                briefing, oath of fire, Rasengan submission. Built with the same
                forms engine you&apos;ll use.
              </p>
              <div>
                <Link href="/naruto">
                  <Button
                    size="lg"
                    className="btn-rasengan gap-2 bg-gradient-to-br from-konoha-orange to-[#cc4400] font-heading uppercase tracking-[0.18em] shadow-[0_0_30px_rgba(255,107,0,0.35)]"
                  >
                    Enter the exam
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 -z-10 rounded-full bg-konoha-chakra/20 blur-3xl" />
                <Rasengan size={220} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------
          FINAL CTA
          ------------------------------------------------------------------ */}
      <section className="relative z-10 container mx-auto px-6 pb-24 pt-8 text-center">
        <div className="mx-auto max-w-2xl">
          <Scroll size={36} className="mx-auto mb-4 text-konoha-orange" />
          <h2 className="font-heading text-3xl font-black md:text-4xl text-konoha-orange text-glow-orange">
            The Hokage awaits.
          </h2>
          <p className="mt-3 text-sm uppercase tracking-[0.25em] text-muted-foreground">
            Forge your first scroll today
          </p>
          <div className="mt-6 flex justify-center">
            {isSignedIn ? (
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="btn-rasengan gap-2 bg-gradient-to-br from-konoha-orange to-[#cc4400] font-heading uppercase tracking-[0.18em] shadow-[0_0_40px_rgba(255,107,0,0.4)]"
                >
                  Open Hokage&apos;s Desk
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-3">
                <SignUpButton mode="modal">
                  <Button
                    size="lg"
                    className="btn-rasengan gap-2 bg-gradient-to-br from-konoha-orange to-[#cc4400] font-heading uppercase tracking-[0.18em] shadow-[0_0_40px_rgba(255,107,0,0.4)]"
                  >
                    Enlist now
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </SignUpButton>

                <Link href="/api/demo-login">
                  <Button
                    variant="outline"
                    size="lg"
                    className="gap-2 border-konoha-orange text-konoha-orange font-heading uppercase tracking-[0.18em] hover:bg-konoha-orange/15"
                  >
                    Enter Sandbox
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------
          FOOTER
          ------------------------------------------------------------------ */}
      <footer className="relative z-10 border-t border-konoha-forest/40 bg-konoha-ink/60 px-6 py-8 backdrop-blur">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 text-[10px] uppercase tracking-[0.25em] text-muted-foreground md:flex-row">
          <div className="flex items-center gap-3">
            <KonohaLeaf size={22} color="#FF6B00" />
            <span className="font-heading font-bold tracking-[0.3em] text-konoha-orange">
              KONOHA · FORM SCROLLS
            </span>
          </div>
          <p>© {new Date().getFullYear()} Hidden Leaf Division</p>
          <nav className="flex gap-5">
            <a href="#" className="hover:text-konoha-orange">Privacy</a>
            <a href="#" className="hover:text-konoha-orange">Terms</a>
            <a href="#" className="hover:text-konoha-orange">Contact</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
