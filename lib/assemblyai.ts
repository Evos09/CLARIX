import { AssemblyAI } from "assemblyai";

let client: AssemblyAI | null = null;

export function getAssemblyAI(): AssemblyAI {
  if (!process.env.ASSEMBLYAI_API_KEY) {
    throw new Error("ASSEMBLYAI_API_KEY is not set");
  }
  if (!client) {
    client = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY });
  }
  return client;
}

export function isAssemblyConfigured(): boolean {
  return Boolean(process.env.ASSEMBLYAI_API_KEY);
}
