import {
  Type,
  AlignLeft,
  Mail,
  Hash,
  Phone,
  Link2,
  Calendar,
  Clock,
  ChevronDown,
  ListChecks,
  CheckSquare,
  Star,
  SlidersHorizontal,
  Upload,
  type LucideIcon,
} from "lucide-react";
import type { FieldType } from "./types";

interface FieldDef {
  type: FieldType;
  label: string;
  description: string;
  icon: LucideIcon;
  group: "text" | "choice" | "advanced";
}

/**
 * Catalog of every supported field type — drives the "Add field" popover
 * and the inspector's type-specific config sections.
 */
export const FIELD_CATALOG: FieldDef[] = [
  // Text group
  { type: "short_text", label: "Short Text", description: "A single line of text", icon: Type, group: "text" },
  { type: "long_text", label: "Long Text", description: "Multi-line answer area", icon: AlignLeft, group: "text" },
  { type: "email", label: "Email", description: "Validated hawk address", icon: Mail, group: "text" },
  { type: "number", label: "Number", description: "Integer or decimal", icon: Hash, group: "text" },
  { type: "phone", label: "Phone", description: "Phone or comm number", icon: Phone, group: "text" },
  { type: "url", label: "URL", description: "Link to a scroll", icon: Link2, group: "text" },
  { type: "date", label: "Date", description: "Calendar picker", icon: Calendar, group: "text" },
  { type: "time", label: "Time", description: "Hour and minute", icon: Clock, group: "text" },

  // Choice group
  { type: "select", label: "Single Select", description: "Pick one from a list", icon: ChevronDown, group: "choice" },
  { type: "multi_select", label: "Multi Select", description: "Pick several", icon: ListChecks, group: "choice" },
  { type: "checkbox", label: "Checkbox", description: "Yes/no question", icon: CheckSquare, group: "choice" },

  // Advanced group
  { type: "rating", label: "Rating", description: "Star / shuriken rating", icon: Star, group: "advanced" },
  { type: "scale", label: "Scale", description: "Numeric scale (1–10)", icon: SlidersHorizontal, group: "advanced" },
  { type: "file_upload", label: "File Upload", description: "Receive a scroll file", icon: Upload, group: "advanced" },
];

export const GROUP_LABELS: Record<FieldDef["group"], string> = {
  text: "Text & Numbers",
  choice: "Choices",
  advanced: "Advanced",
};

export function getFieldDef(type: FieldType): FieldDef {
  const def = FIELD_CATALOG.find((f) => f.type === type);
  if (!def) {
    return {
      type,
      label: type,
      description: "Custom field",
      icon: Type,
      group: "text",
    };
  }
  return def;
}

/**
 * Defaults applied when a new field is added to a form.
 */
export function getFieldDefaults(type: FieldType): {
  label: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  minValue?: number;
  maxValue?: number;
  minLabel?: string;
  maxLabel?: string;
} {
  switch (type) {
    case "short_text":
      return { label: "Short answer", placeholder: "Type your answer…" };
    case "long_text":
      return { label: "Long answer", placeholder: "Write the details…" };
    case "email":
      return { label: "Email address", placeholder: "ninja@konohagakure.jp" };
    case "number":
      return { label: "Number", placeholder: "0" };
    case "phone":
      return { label: "Phone", placeholder: "+1 555 0100" };
    case "url":
      return { label: "Link", placeholder: "https://" };
    case "date":
      return { label: "Date" };
    case "time":
      return { label: "Time" };
    case "select":
      return {
        label: "Pick one",
        options: [
          { value: "opt1", label: "Option one" },
          { value: "opt2", label: "Option two" },
          { value: "opt3", label: "Option three" },
        ],
      };
    case "multi_select":
      return {
        label: "Pick several",
        options: [
          { value: "opt1", label: "Option one" },
          { value: "opt2", label: "Option two" },
          { value: "opt3", label: "Option three" },
        ],
      };
    case "checkbox":
      return { label: "I agree" };
    case "rating":
      return { label: "Rate this", maxValue: 5 };
    case "scale":
      return {
        label: "On a scale of 1 to 10",
        minValue: 1,
        maxValue: 10,
        minLabel: "Not at all",
        maxLabel: "Absolutely",
      };
    case "file_upload":
      return { label: "Upload your scroll" };
    default:
      return { label: "Untitled" };
  }
}
