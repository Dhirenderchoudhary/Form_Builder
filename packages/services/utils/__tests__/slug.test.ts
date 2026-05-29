/**
 * Konoha Forms — Slug Utility Tests
 *
 * Covers packages/services/utils/slug.ts — generateSlug()
 * Pure unit tests, zero dependencies.
 */
import { describe, it, expect } from "vitest";
import { generateSlug } from "../slug";

describe("generateSlug", () => {
  // ─── Basic transformations ────────────────────────────────────────────

  it("lowercases the input", () => {
    expect(generateSlug("UPPERCASE")).toBe("uppercase");
  });

  it("replaces spaces with hyphens", () => {
    expect(generateSlug("Hello World")).toBe("hello-world");
  });

  it("trims leading and trailing whitespace", () => {
    expect(generateSlug("  spaced  ")).toBe("spaced");
  });

  it("converts underscores to hyphens", () => {
    expect(generateSlug("hello_world")).toBe("hello-world");
  });

  it("collapses multiple spaces into a single hyphen", () => {
    expect(generateSlug("a   b   c")).toBe("a-b-c");
  });

  it("collapses multiple hyphens into one", () => {
    expect(generateSlug("hello---world")).toBe("hello-world");
  });

  // ─── Character filtering ──────────────────────────────────────────────

  it("removes special characters (@, #, $, %)", () => {
    expect(generateSlug("special @#$% chars")).toBe("special-chars");
  });

  it("removes punctuation (!, ?, .)", () => {
    expect(generateSlug("Naruto Uzumaki!")).toBe("naruto-uzumaki");
  });

  it("removes parentheses", () => {
    expect(generateSlug("Sage Mode (Toad)")).toBe("sage-mode-toad");
  });

  it("preserves numbers", () => {
    expect(generateSlug("Form 42")).toBe("form-42");
  });

  it("preserves hyphens between words", () => {
    expect(generateSlug("already-slug")).toBe("already-slug");
  });

  it("removes leading hyphens", () => {
    expect(generateSlug("--leading-dash")).toBe("leading-dash");
  });

  it("removes trailing hyphens", () => {
    expect(generateSlug("trailing-dash--")).toBe("trailing-dash");
  });

  it("handles a mix of all edge cases", () => {
    expect(generateSlug("  --Hello, World!! 42--  ")).toBe("hello-world-42");
  });

  // ─── Ninja / Konoha-themed strings ───────────────────────────────────

  it("handles Naruto-themed form title", () => {
    expect(generateSlug("Chunin Exam Registration")).toBe(
      "chunin-exam-registration",
    );
  });

  it("handles multi-word with numbers", () => {
    expect(generateSlug("S-Rank Mission 007")).toBe("s-rank-mission-007");
  });

  it("handles Japanese-like romanized text", () => {
    expect(generateSlug("Rasengan Training Form")).toBe(
      "rasengan-training-form",
    );
  });

  // ─── Edge cases ───────────────────────────────────────────────────────

  it("returns empty string for empty input", () => {
    expect(generateSlug("")).toBe("");
  });

  it("returns empty string for all-special-char input", () => {
    expect(generateSlug("@#$%^&*")).toBe("");
  });

  it("truncates to 100 characters", () => {
    const longTitle = "The ".repeat(30); // 120 chars
    const result = generateSlug(longTitle);
    expect(result.length).toBeLessThanOrEqual(100);
  });

  it("does not exceed 100 characters even after hyphen replacement", () => {
    // 101 'a' characters
    const result = generateSlug("a".repeat(105));
    expect(result.length).toBeLessThanOrEqual(100);
  });

  it("handles single word", () => {
    expect(generateSlug("konoha")).toBe("konoha");
  });

  it("handles single character", () => {
    expect(generateSlug("A")).toBe("a");
  });
});
