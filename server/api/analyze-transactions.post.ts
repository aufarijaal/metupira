import * as google from "@google/genai";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const transactions = body.transactions || [];

  const ai = new google.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `
    Kamu adalah asisten keuangan pribadi.
    Data transaksi diberikan dalam format JSON berikut:
    ${JSON.stringify(transactions)}

    Instruksi gaya output:
    - Tulis ringkasan kondisi keuangan dalam bahasa Indonesia dengan 1-2 paragraf.
    - Jangan tulis kalimat pembuka seperti "Tentu..." atau "Mari kita...".
    - Jangan gunakan simbol formatting seperti ** atau -.
    - Setelah ringkasan, berikan saran perbaikan keuangan di masa depan dalam bentuk paragraf, bukan poin.
    - Gunakan bahasa yang sederhana dan natural.
    `;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite", // or any model you pick
      contents: prompt,
    });

    return { summary: result.text };
  } catch (error: any) {
    console.error("Error analyzing transactions:", error);
    return { error: error.message };
  }
});
