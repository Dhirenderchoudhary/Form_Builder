"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Twitter = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
);
const Linkedin = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
);
const Github = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
);

export function CreatorCredits() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <span ref={containerRef} className="relative inline-flex items-center">
      Built by{" "}
      <span className="ml-1 relative">
        <span
          onClick={() => setIsOpen(!isOpen)}
          className="font-medium text-foreground cursor-pointer hover:text-konoha-orange transition-colors underline underline-offset-4 decoration-muted-foreground/30 hover:decoration-konoha-orange"
        >
          Dhirenderchoudhary
        </span>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 5, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-konoha-ink border border-konoha-forest/40 rounded-xl shadow-xl p-1.5 min-w-[150px] flex flex-col gap-1 z-50 text-left"
              onClick={(e) => {
                e.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
              }}
            >
              <a
                href="https://x.com/Dhirender_0001"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 px-3 py-2 hover:bg-konoha-forest/20 rounded-md text-foreground transition-colors cursor-pointer"
              >
                <Twitter className="h-4 w-4 shrink-0 text-[#1DA1F2]" />
                <div className="flex flex-col leading-tight">
                  <span className="text-[13px] font-medium normal-case tracking-normal">Twitter</span>
                  <span className="text-[10px] text-muted-foreground normal-case tracking-normal">@Dhirender_0001</span>
                </div>
              </a>
              <a
                href="https://www.linkedin.com/in/dhirender-choudhary0001/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 px-3 py-2 hover:bg-konoha-forest/20 rounded-md text-foreground transition-colors cursor-pointer"
              >
                <Linkedin className="h-4 w-4 shrink-0 text-[#0077b5]" />
                <div className="flex flex-col leading-tight">
                  <span className="text-[13px] font-medium normal-case tracking-normal">LinkedIn</span>
                  <span className="text-[10px] text-muted-foreground normal-case tracking-normal">@dhirender-choudhary0001</span>
                </div>
              </a>
              <a
                href="https://github.com/Dhirenderchoudhary"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 px-3 py-2 hover:bg-konoha-forest/20 rounded-md text-foreground transition-colors cursor-pointer"
              >
                <Github className="h-4 w-4 shrink-0" />
                <div className="flex flex-col leading-tight">
                  <span className="text-[13px] font-medium normal-case tracking-normal">GitHub</span>
                  <span className="text-[10px] text-muted-foreground normal-case tracking-normal">@Dhirenderchoudhary</span>
                </div>
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </span>
    </span>
  );
}
