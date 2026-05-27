import type { Metadata } from "next";
import NarutoForm from "./NarutoForm";

export const metadata: Metadata = {
  title: "Hidden Leaf Village — Shinobi Registration",
  description: "Chunin Exam Clearance — Classified Mission File",
};

export default function NarutoPage() {
  return <NarutoForm />;
}
