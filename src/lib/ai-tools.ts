import data from "@/data/ai-tools.json";

export interface AiToolInput {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  options?: string[];
}

export interface AiTool {
  slug: string;
  name: string;
  category: string;
  description: string;
  keywords: string[];
  inputs: AiToolInput[];
  pseoContent: {
    h2: string;
    content: string;
  };
}

export const AI_TOOLS: AiTool[] = data as AiTool[];

export const AI_CATEGORIES = Array.from(new Set(AI_TOOLS.map((t) => t.category)));

export function getAiToolBySlug(slug: string): AiTool | undefined {
  return AI_TOOLS.find((t) => t.slug === slug);
}

export function getAiToolsByCategory(category: string): AiTool[] {
  return AI_TOOLS.filter((t) => t.category === category);
}
