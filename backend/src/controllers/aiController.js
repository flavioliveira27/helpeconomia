import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const getFinancialInsights = async (req, res) => {
    try {
        const { transactions } = req.body;

        if (!transactions || !Array.isArray(transactions)) {
            return res.status(400).json({ error: "Transações inválidas ou não fornecidas" });
        }

        const dataSummary = JSON.stringify(transactions.map(t => ({
            desc: t.description,
            val: t.amount,
            type: t.type,
            cat: t.category
        })));

        const prompt = `
            Atue como um consultor financeiro pessoal experiente.
            Analise os seguintes dados de transações financeiras (JSON):
            ${dataSummary}

            Forneça uma análise breve e direta (máximo 3 parágrafos) em Português do Brasil.
            Foque em:
            1. Saúde financeira atual.
            2. Onde o usuário está gastando mais.
            3. Uma sugestão prática para economizar ou investir melhor.
            
            Use formatação Markdown simples (negrito, listas).
        `;

        // Use gemini-2.5-flash which was confirmed to work via diagnostic script
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ result: text });

    } catch (error) {
        console.error("Erro ao gerar insights:", error);
        res.status(500).json({ error: "Erro ao processar insights com IA" });
    }
};
