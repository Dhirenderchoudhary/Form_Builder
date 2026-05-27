
import Link from "next/link";
import { Header } from "@/components/header";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Pricing | Konoha Form Scrolls",
  description: "Simple, transparent pricing for your form building needs.",
};

const TIERS = [
  {
    name: "Genin (Free)",
    price: "$0",
    description: "Perfect for personal projects and small gatherings.",
    features: [
      "Up to 3 Forms",
      "100 Responses per month",
      "Standard templates",
      "Basic Analytics",
      "Community Support",
    ],
    cta: "Start Free",
    href: "/sign-up",
    popular: false,
  },
  {
    name: "Chunin (Pro)",
    price: "$19",
    period: "/mo",
    description: "For professionals who need more power and customization.",
    features: [
      "Unlimited Forms",
      "5,000 Responses per month",
      "Advanced Logic & Routing",
      "Custom Themes & Branding",
      "CSV Exports",
      "Email Notifications",
    ],
    cta: "Upgrade to Chunin",
    href: "/sign-up?tier=pro",
    popular: true,
  },
  {
    name: "Hokage (Enterprise)",
    price: "$99",
    period: "/mo",
    description: "Ultimate power for large teams and high-volume data collection.",
    features: [
      "Everything in Chunin",
      "Unlimited Responses",
      "API Access & Webhooks",
      "Remove Konoha Branding",
      "Priority 24/7 Support",
      "Custom Domain",
    ],
    cta: "Contact Sales",
    href: "mailto:sales@konoha-forms.com",
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background selection:bg-konoha-orange/20 selection:text-konoha-orange">
      <Header />
      
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center space-y-4 mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h1 className="font-heading text-4xl md:text-6xl font-black uppercase tracking-tight">
              Invest in your <span className="text-konoha-orange">Jutsu</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
              Simple, transparent pricing. Scale your form collection capabilities as your village grows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {TIERS.map((tier, i) => (
              <div 
                key={tier.name}
                className={`relative rounded-2xl border bg-card/50 backdrop-blur-sm p-8 flex flex-col h-full animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both ${
                  tier.popular 
                    ? "border-konoha-orange shadow-[0_0_30px_-5px_rgba(255,107,0,0.2)] md:-translate-y-4" 
                    : "border-border/50"
                }`}
                style={{ animationDelay: `${i * 150}ms` }}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <span className="bg-konoha-orange text-black font-heading text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className="font-heading text-xl font-bold uppercase tracking-wide mb-2">{tier.name}</h3>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-4xl font-black">{tier.price}</span>
                    {tier.period && <span className="text-muted-foreground">{tier.period}</span>}
                  </div>
                  <p className="text-sm text-muted-foreground">{tier.description}</p>
                </div>
                
                <div className="flex-1 space-y-4 mb-8">
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <CheckCircle2 className={`w-5 h-5 shrink-0 ${tier.popular ? "text-konoha-orange" : "text-muted-foreground"}`} />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Link 
                  href={tier.href}
                  className={`w-full py-3 rounded-md font-heading text-sm uppercase tracking-wider font-bold flex items-center justify-center gap-2 transition-all ${
                    tier.popular
                      ? "bg-konoha-orange text-black hover:bg-konoha-orange/90 hover:shadow-[0_0_20px_rgba(255,107,0,0.4)]"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {tier.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
