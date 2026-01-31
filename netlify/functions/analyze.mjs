import { GoogleGenAI, Type } from "@google/genai";

const SYSTEM_INSTRUCTION = `
Você é o "Matchday Reality Engine", um analista de futebol de elite que foca exclusivamente na REALIDADE DE HOJE.
Ignore histórico pesado e foque na temperatura do momento: desfalques, motivação, condições do dia e estilo atual.

REGRAS:
1) Seja brutalmente realista.
2) Nada de linguagem de tipster/odds.
3) Dê só 1 ou 2 Correct Scores.
4) Leia o clima do jogo.
5) Responda em JSON no esquema.
`.trim();

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    matchSummary: { type: Type.STRING },
    temperature: { type: Type.STRING },
    intensityLevel: { type: Type.NUMBER },
    tacticalReality: { type: Type.STRING },
    keyDrivers: { type: Type.ARRAY, items: { type: Type.STRING } },
    suggestedOutcomes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.STRING },
          probabilityLabel: { type: Type.STRING },
          reason: { type: Type.STRING }
        },
        required: ["score","probabilityLabel","reason"]
      }
    },
    confidenceNote: { type: Type.STRING }
  },
  required: ["matchSummary","temperature","intensityLevel","tacticalReality","keyDrivers","suggestedOutcomes","confidenceNote"]
};

function extractJson(text) {
  const a = text.indexOf("{");
  const b = text.lastIndexOf("}");
  if (a === -1 || b === -1 || b <= a) return text;
  return text.slice(a, b + 1);
}

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: "Missing GEMINI_API_KEY env var" };
  }

  let payload = {};
  try { payload = JSON.parse(event.body || "{}"); }
  catch { return { statusCode: 400, body: "Invalid JSON" }; }

  const text = payload?.text;
  if (!text || typeof text !== "string") {
    return { statusCode: 400, body: 'Missing "text"' };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const res = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analise este contexto de jogo e extraia a realidade para HOJE:\n\n${text}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.2
      }
    });

    const body = extractJson(res.text || "{}");
    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body };
  } catch (e) {
    return { statusCode: 500, body: e?.message || "Server error" };
  }
}
