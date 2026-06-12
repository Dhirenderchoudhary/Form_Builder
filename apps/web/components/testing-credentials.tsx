"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function TestingCredentials() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const email = "demo@konoha.com";
  const password = "Konoha!Demo2024$";

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="mt-6 flex flex-col text-xs border border-konoha-orange/30 bg-konoha-ink/80 backdrop-blur-md rounded-lg p-4 w-full sm:w-[320px] shadow-[0_0_15px_rgba(255,107,0,0.1)] transition-all hover:border-konoha-orange/50 hover:shadow-[0_0_20px_rgba(255,107,0,0.15)] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-konoha-orange to-transparent opacity-50" />
      
      <p className="text-muted-foreground font-semibold uppercase tracking-[0.2em] mb-3 text-[10px] flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-konoha-orange animate-pulse" />
        Judges & Testing Credentials
      </p>

      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between bg-black/40 rounded p-2 border border-konoha-forest/20 group">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] uppercase tracking-wider text-konoha-orange/80">Email</span>
            <span className="text-foreground font-mono font-medium">{email}</span>
          </div>
          <button
            onClick={() => handleCopy(email, "email")}
            className="p-1.5 rounded-md hover:bg-konoha-orange/10 text-muted-foreground hover:text-konoha-orange transition-colors"
            title="Copy Email"
          >
            {copiedKey === "email" ? (
              <Check className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        <div className="flex items-center justify-between bg-black/40 rounded p-2 border border-konoha-forest/20 group">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] uppercase tracking-wider text-konoha-orange/80">Password</span>
            <span className="text-foreground font-mono font-medium">{password}</span>
          </div>
          <button
            onClick={() => handleCopy(password, "password")}
            className="p-1.5 rounded-md hover:bg-konoha-orange/10 text-muted-foreground hover:text-konoha-orange transition-colors"
            title="Copy Password"
          >
            {copiedKey === "password" ? (
              <Check className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
