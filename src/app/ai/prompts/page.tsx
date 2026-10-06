import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import PromptsLibraryPage from "./prompts-client";

export const metadata: Metadata = buildMetadata({
  title: "Global AI Prompts Library | Castov",
  description: "A massive, curated collection of professional prompts for ChatGPT, Claude, Gemini, Midjourney, and Cursor. Designed to instantly 10x your productivity.",
  path: "/ai/prompts",
});

export default function Page() {
  return <PromptsLibraryPage />;
}
