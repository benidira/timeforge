import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI } from "@google/genai";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role for bulk inserts
if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Gemini API
const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
  console.error("Missing GEMINI_API_KEY in .env.local");
  process.exit(1);
}
const ai = new GoogleGenAI({ apiKey: geminiApiKey });

const AIs = [
  "ChatGPT", "Claude AI", "Google Gemini", "Midjourney", "Leonardo AI",
  "ElevenLabs", "Perplexity AI", "Runway", "Kling AI", "Hailuo AI (MiniMax)",
  "Luma Dream Machine", "Suno AI", "Udio", "Cursor", "GitHub Copilot",
  "HeyGen", "CapCut AI", "Flux AI", "Ideogram", "Poe"
];

const ROLES = ["Developer", "Creator", "Marketer", "Designer", "Writer", "Student"];

async function generateBatch(aiModel, targetCount = 50) {
  console.log(`Generating batch of ${targetCount} prompts for ${aiModel}...`);
  
  const systemPrompt = `You are an expert prompt engineer building a master database of prompts. 
Generate exactly ${targetCount} unique, high-quality, professional prompts specifically optimized for ${aiModel}.
Assign a random appropriate role from this list for each prompt: ${ROLES.join(", ")}.
Return the result strictly as a JSON array of objects. Do not use markdown blocks.

Required JSON format:
[
  {
    "ai_model": "${aiModel}",
    "role": "...",
    "title": "Short descriptive title",
    "prompt_text": "The highly detailed prompt...",
    "tags": ["tag1", "tag2", "tag3"]
  }
]`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: systemPrompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text();
    if (!text) throw new Error("Empty response");
    
    const prompts = JSON.parse(text);
    return prompts;
  } catch (error) {
    console.error(`Failed to generate batch for ${aiModel}:`, error);
    return [];
  }
}

async function main() {
  console.log("🚀 Starting the 100,000 Prompts Generation Engine...");
  
  const targetPerAi = 5000;
  const batchSize = 50;

  for (const aiModel of AIs) {
    console.log(`\n===========================================`);
    console.log(`Processing: ${aiModel} (Target: ${targetPerAi} prompts)`);
    console.log(`===========================================\n`);
    
    let currentCount = 0;
    
    while (currentCount < targetPerAi) {
      const prompts = await generateBatch(aiModel, batchSize);
      
      if (prompts.length > 0) {
        // Insert into Supabase
        const { error } = await supabase.from('prompts').insert(prompts);
        
        if (error) {
          console.error(`❌ Error inserting into Supabase:`, error.message);
        } else {
          currentCount += prompts.length;
          console.log(`✅ Inserted ${prompts.length} prompts. Total for ${aiModel}: ${currentCount}/${targetPerAi}`);
        }
      } else {
        console.log("⚠️ Retrying batch due to generation failure...");
      }
      
      // Delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  console.log("🎉 Generation Complete!");
}

main();
