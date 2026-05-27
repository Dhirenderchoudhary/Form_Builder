import type { LucideIcon } from "lucide-react";
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
} from "lucide-react";

/**
 * Map of every supported field type to its UI metadata.
 * Backend schema is the single source of truth — this just decorates.
 */
export type FieldType =
  | "short_text"
  | "long_text"
  | "email"
  | "number"
  | "phone"
  | "url"
  | "date"
  | "time"
  | "select"
  | "multi_select"
  | "checkbox"
  | "rating"
  | "scale"
  | "file_upload";

export interface FieldTypeMeta {
  type: FieldType;
  label: string;
  description: string;
  icon: LucideIcon;
  category: "text" | "choice" | "advanced";
  defaultLabel: string;
  hasOptions?: boolean;
  hasRange?: boolean;
}

export const FIELD_TYPES: FieldTypeMeta[] = [
  {
    type: "short_text",
    label: "Short Text",
    description: "Single line. Names, codes, titles.",
    icon: Type,
    category: "text",
    defaultLabel: "Shinobi name",
  },
  {
    type: "long_text",
    label: "Long Text",
    description: "Multiple lines. Stories and reports.",
    icon: AlignLeft,
    category: "text",
    defaultLabel: "Mission report",
  },
  {
    type: "email",
    label: "Email",
    description: "Validated hawk address.",
    icon: Mail,
    category: "text",
    defaultLabel: "Hawk address",
  },
  {
    type: "number",
    label: "Number",
    description: "Integers and decimals.",
    icon: Hash,
    category: "text",
    defaultLabel: "Years of training",
  },
  {
    type: "phone",
    label: "Phone",
    description: "Contact line.",
    icon: Phone,
    category: "text",
    defaultLabel: "Communicator code",
  },
  {
    type: "url",
    label: "URL",
    description: "Validated link.",
    icon: Link2,
    category: "text",
    defaultLabel: "Reference scroll",
  },
  {
    type: "date",
    label: "Date",
    description: "Calendar picker.",
    icon: Calendar,
    category: "text",
    defaultLabel: "Mission date",
  },
  {
    type: "time",
    label: "Time",
    description: "Clock picker.",
    icon: Clock,
    category: "text",
    defaultLabel: "Departure time",
  },
  {
    type: "select",
    label: "Single Select",
    description: "Dropdown — pick one.",
    icon: ChevronDown,
    category: "choice",
    defaultLabel: "Ninja rank",
    hasOptions: true,
  },
  {
    type: "multi_select",
    label: "Multi Select",
    description: "Pick several from a list.",
    icon: ListChecks,
    category: "choice",
    defaultLabel: "Special abilities",
    hasOptions: true,
  },
  {
    type: "checkbox",
    label: "Checkbox",
    description: "Yes/no acknowledgement.",
    icon: CheckSquare,
    category: "choice",
    defaultLabel: "I swear the oath",
  },
  {
    type: "rating",
    label: "Rating",
    description: "Star scale 1–5.",
    icon: Star,
    category: "advanced",
    defaultLabel: "Rate the mission",
    hasRange: true,
  },
  {
    type: "scale",
    label: "Scale",
    description: "Linear scale (e.g. 1–10).",
    icon: SlidersHorizontal,
    category: "advanced",
    defaultLabel: "Chakra level",
    hasRange: true,
  },
  {
    type: "file_upload",
    label: "File Upload",
    description: "Attach a scroll or document.",
    icon: Upload,
    category: "advanced",
    defaultLabel: "Mission scroll",
  },
];

export const FIELD_TYPE_MAP: Record<FieldType, FieldTypeMeta> = Object.fromEntries(
  FIELD_TYPES.map((f) => [f.type, f]),
) as Record<FieldType, FieldTypeMeta>;
