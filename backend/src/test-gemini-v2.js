import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
console.log("Testando chave:", apiKey ? "OK" : "MISSING");
const genAI = new GoogleGenerativeAI(apiKey);

const modelsToTest = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash-001',
    'gemini-1.5-flash-8b',
    'gemini-pro',
    'gemini-1.0-pro'
];

async function runTests() {
    console.log("Diagnóstico V2 (@google/generative-ai)...");

    for (const modelName of modelsToTest) {
        try {
            process.stdout.write(`Tentando ${modelName}... `);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Olá");
            const response = await result.response;
            console.log(`✅ SUCESSO! (Resposta: ${response.text().substring(0, 20)}...)`);
            console.log(`\n>>> USE O MODELO: "${modelName}" NO CONTROLLER <<<\n`);
            return; // Stop after first success
        } catch (error) {
            if (error.message.includes('404')) console.log("❌ 404 (Não encontrado)");
            else if (error.message.includes('429')) console.log("⚠️ 429 (Cota)");
            else console.log(`❌ ERRO: ${error.message}`);
        }
    }
}

runTests();
