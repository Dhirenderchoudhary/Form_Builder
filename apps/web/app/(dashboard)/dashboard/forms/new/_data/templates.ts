import {
  Contact,
  MessageSquare,
  CalendarCheck,
  Briefcase,
  Bug,
  HelpCircle,
  ShoppingCart,
  Mail,
} from "lucide-react";

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

export interface TemplateField {
  type: FieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  minValue?: number;
  maxValue?: number;
  minLabel?: string;
  maxLabel?: string;
}

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  icon: typeof Contact;
  category: string;
  fields: TemplateField[];
}

export const FORM_TEMPLATES: FormTemplate[] = [
  {
    id: "contact",
    name: "Contact Form",
    description: "Simple contact form with name, email, and message",
    icon: Contact,
    category: "General",
    fields: [
      { type: "short_text", label: "Full Name", placeholder: "Your name", required: true },
      { type: "email", label: "Email Address", placeholder: "you@example.com", required: true },
      { type: "phone", label: "Phone Number", placeholder: "+1 (555) 000-0000" },
      { type: "select", label: "Topic", required: true, options: [
        { value: "general", label: "General Inquiry" },
        { value: "support", label: "Support" },
        { value: "feedback", label: "Feedback" },
        { value: "partnership", label: "Partnership" },
      ]},
      { type: "long_text", label: "Message", placeholder: "Tell us what's on your mind...", required: true },
    ],
  },
  {
    id: "feedback",
    name: "Feedback Survey",
    description: "Collect user feedback with ratings and open-ended questions",
    icon: MessageSquare,
    category: "Research",
    fields: [
      { type: "rating", label: "Overall Experience", required: true, maxValue: 5 },
      { type: "scale", label: "How likely are you to recommend us?", required: true, minValue: 0, maxValue: 10, minLabel: "Not likely", maxLabel: "Very likely" },
      { type: "select", label: "What did you use?", required: true, options: [
        { value: "web", label: "Website" },
        { value: "mobile", label: "Mobile App" },
        { value: "desktop", label: "Desktop App" },
        { value: "api", label: "API" },
      ]},
      { type: "long_text", label: "What did you like most?", placeholder: "Share what worked well..." },
      { type: "long_text", label: "What could be improved?", placeholder: "Help us get better..." },
      { type: "checkbox", label: "I'm open to a follow-up conversation" },
    ],
  },
  {
    id: "event-rsvp",
    name: "Event RSVP",
    description: "Let guests register for your event with dietary preferences",
    icon: CalendarCheck,
    category: "Events",
    fields: [
      { type: "short_text", label: "Full Name", placeholder: "Your name", required: true },
      { type: "email", label: "Email", placeholder: "you@example.com", required: true },
      { type: "select", label: "Attending?", required: true, options: [
        { value: "yes", label: "Yes, I'll be there!" },
        { value: "maybe", label: "Maybe" },
        { value: "no", label: "Can't make it" },
      ]},
      { type: "number", label: "Number of Guests", helpText: "Including yourself" },
      { type: "multi_select", label: "Dietary Restrictions", options: [
        { value: "vegetarian", label: "Vegetarian" },
        { value: "vegan", label: "Vegan" },
        { value: "gluten_free", label: "Gluten-free" },
        { value: "halal", label: "Halal" },
        { value: "kosher", label: "Kosher" },
        { value: "none", label: "None" },
      ]},
      { type: "long_text", label: "Any other notes?", placeholder: "Anything we should know..." },
    ],
  },
  {
    id: "job-application",
    name: "Job Application",
    description: "Collect applications with resume upload and experience details",
    icon: Briefcase,
    category: "HR",
    fields: [
      { type: "short_text", label: "Full Name", required: true },
      { type: "email", label: "Email Address", required: true },
      { type: "phone", label: "Phone Number", required: true },
      { type: "url", label: "LinkedIn Profile", placeholder: "https://linkedin.com/in/..." },
      { type: "url", label: "Portfolio / Website", placeholder: "https://..." },
      { type: "select", label: "Experience Level", required: true, options: [
        { value: "entry", label: "Entry Level (0-2 years)" },
        { value: "mid", label: "Mid Level (2-5 years)" },
        { value: "senior", label: "Senior (5-10 years)" },
        { value: "lead", label: "Lead / Principal (10+ years)" },
      ]},
      { type: "long_text", label: "Why are you interested in this role?", required: true, helpText: "2-3 paragraphs about your motivation" },
      { type: "date", label: "Earliest Start Date" },
      { type: "checkbox", label: "I confirm that all information provided is accurate" },
    ],
  },
  {
    id: "bug-report",
    name: "Bug Report",
    description: "Structured bug reporting with severity and reproduction steps",
    icon: Bug,
    category: "Engineering",
    fields: [
      { type: "short_text", label: "Bug Title", placeholder: "Brief description of the issue", required: true },
      { type: "select", label: "Severity", required: true, options: [
        { value: "critical", label: "🔴 Critical — System unusable" },
        { value: "high", label: "🟠 High — Major feature broken" },
        { value: "medium", label: "🟡 Medium — Feature impaired" },
        { value: "low", label: "🟢 Low — Minor inconvenience" },
      ]},
      { type: "select", label: "Browser / Environment", options: [
        { value: "chrome", label: "Chrome" },
        { value: "firefox", label: "Firefox" },
        { value: "safari", label: "Safari" },
        { value: "edge", label: "Edge" },
        { value: "mobile_ios", label: "iOS Safari" },
        { value: "mobile_android", label: "Android Chrome" },
        { value: "other", label: "Other" },
      ]},
      { type: "long_text", label: "Steps to Reproduce", placeholder: "1. Go to...\n2. Click on...\n3. See error...", required: true },
      { type: "long_text", label: "Expected Behavior", placeholder: "What should have happened?" },
      { type: "long_text", label: "Actual Behavior", placeholder: "What actually happened?", required: true },
      { type: "url", label: "Screenshot / Recording URL", placeholder: "https://..." },
    ],
  },
  {
    id: "quiz",
    name: "Quiz / Assessment",
    description: "Multiple choice quiz with rating questions",
    icon: HelpCircle,
    category: "Education",
    fields: [
      { type: "short_text", label: "Your Name", required: true },
      { type: "select", label: "Question 1: What is 2 + 2?", required: true, options: [
        { value: "3", label: "3" },
        { value: "4", label: "4" },
        { value: "5", label: "5" },
        { value: "22", label: "22" },
      ]},
      { type: "select", label: "Question 2: Which planet is closest to the Sun?", required: true, options: [
        { value: "venus", label: "Venus" },
        { value: "mercury", label: "Mercury" },
        { value: "earth", label: "Earth" },
        { value: "mars", label: "Mars" },
      ]},
      { type: "multi_select", label: "Question 3: Select all prime numbers", required: true, options: [
        { value: "2", label: "2" },
        { value: "3", label: "3" },
        { value: "4", label: "4" },
        { value: "7", label: "7" },
        { value: "9", label: "9" },
      ]},
      { type: "scale", label: "How confident are you in your answers?", minValue: 1, maxValue: 5, minLabel: "Not at all", maxLabel: "Very confident" },
    ],
  },
  {
    id: "order-form",
    name: "Order Form",
    description: "Product order with quantity, preferences, and delivery details",
    icon: ShoppingCart,
    category: "Commerce",
    fields: [
      { type: "short_text", label: "Customer Name", required: true },
      { type: "email", label: "Email", required: true },
      { type: "phone", label: "Phone", required: true },
      { type: "select", label: "Product", required: true, options: [
        { value: "basic", label: "Basic Package — $29" },
        { value: "pro", label: "Pro Package — $79" },
        { value: "enterprise", label: "Enterprise — $199" },
      ]},
      { type: "number", label: "Quantity", required: true },
      { type: "long_text", label: "Delivery Address", required: true, placeholder: "Street, City, State, ZIP" },
      { type: "date", label: "Preferred Delivery Date" },
      { type: "long_text", label: "Special Instructions", placeholder: "Gift wrapping, custom notes, etc." },
    ],
  },
  {
    id: "newsletter",
    name: "Newsletter Signup",
    description: "Email signup with topic preferences and frequency",
    icon: Mail,
    category: "Marketing",
    fields: [
      { type: "short_text", label: "Name", placeholder: "How should we address you?", required: true },
      { type: "email", label: "Email", placeholder: "you@example.com", required: true },
      { type: "multi_select", label: "Interested Topics", options: [
        { value: "product", label: "Product Updates" },
        { value: "engineering", label: "Engineering Blog" },
        { value: "design", label: "Design Insights" },
        { value: "community", label: "Community News" },
        { value: "events", label: "Events & Webinars" },
      ]},
      { type: "select", label: "Frequency", options: [
        { value: "daily", label: "Daily Digest" },
        { value: "weekly", label: "Weekly Roundup" },
        { value: "monthly", label: "Monthly Newsletter" },
      ]},
      { type: "checkbox", label: "I agree to receive marketing emails" },
    ],
  },
];
