import * as google from "@google/genai";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const transactions = body.transactions || [];
  const preferredOutputLanguageCode = body.preferredOutputLanguageCode || "id";
  const startDate = body.startDate || "";
  const endDate = body.endDate || "";

  const ai = new google.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const indonesianPrompt = `
      Prompt ini dikirim melalui aplikasi pencatat pemasukan dan pengeluaran bernama Metu Pira.

      Anda adalah asisten keuangan pribadi.  
      Tugas Anda adalah membuat ringkasan keuangan mingguan untuk pengguna.

      Data transaksi untuk minggu ini disediakan dalam format JSON berikut:
      ${JSON.stringify(transactions)}

      Rentang tanggal ringkasan ini adalah:
      Mulai: ${startDate}
      Selesai: ${endDate}

      Setiap objek transaksi memiliki data:
      - amount: angka (positif untuk pemasukan, positif untuk pengeluaran)
      - type: "income" atau "expense"
      - category: nama kategori
      - created_at: tanggal dalam format ISO

      Aturan output:
      - Tulis ringkasan kondisi keuangan pengguna dalam 1–2 paragraf.
      - Jangan mulai dengan kalimat seperti "Baik..." atau "Mari...".
      - Jangan gunakan simbol pemformatan seperti ** atau -.
      - Gunakan bahasa Indonesia yang sederhana, natural, dan mudah dipahami.
      - Setelah ringkasan, berikan satu paragraf berisi saran keuangan untuk minggu berikutnya (tanpa bullet points).

      Jika daftar transaksi kosong, anggap pengguna belum membuat transaksi apa pun.  
      Tulislah pesan singkat yang ramah bahwa belum ada catatan keuangan minggu ini dan sarankan pengguna untuk menambahkan transaksi melalui menu Tambah Transaksi.
    `;

  const englishPrompt = `
      This prompt is sent via an expense and income tracker application called Metu Pira.

      You are a personal finance assistant.  
      Your task is to generate a weekly financial summary for the user.

      The transaction data for this week is provided in JSON format below:
      ${JSON.stringify(transactions)}

      The date range for this summary is:
      Start: ${startDate}
      End: ${endDate}

      Each transaction object includes:
      - amount: number (positive for income, positive for expense)
      - type: "income" or "expense"
      - category: category name
      - created_at: ISO date string

      Output rules:
      - Write a summary of the user's financial condition in 1–2 paragraphs.
      - Do not begin with phrases like "Sure..." or "Let's...".
      - Do not use formatting symbols like ** or -.
      - Use simple, natural English.
      - After the summary, add one paragraph of future financial suggestions.

      If the transactions list is empty, assume the user has not created any transaction yet.  
      Write a short friendly message explaining that there are no records for this week and suggest the user to add a transaction from the Add Transaction menu.
    `;

  function choosePrompt(languageCode: string) {
    if (languageCode.toLowerCase() === "id") {
      return indonesianPrompt;
    } else {
      return englishPrompt;
    }
  }

  const prompt = choosePrompt(preferredOutputLanguageCode);

  try {
    console.log(prompt);
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
