
import https from 'https';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

function getModels() {
    return new Promise((resolve, reject) => {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.error) reject(json.error);
                    else resolve(json.models);
                } catch (e) { reject(e); }
            });
        }).on('error', reject);
    });
}

const genAI = new GoogleGenerativeAI(apiKey);

async function test() {
    console.log("🔍 Buscando modelos disponíveis na API...");
    try {
        const models = await getModels();
        if (!models) {
            console.log("❌ Nenhhum modelo retornado.");
            return;
        }

        console.log(`📋 Encontrados ${models.length} modelos.`);

        const contentModels = models.filter(m => m.supportedGenerationMethods.includes('generateContent'));
        console.log(`🤖 ${contentModels.length} suportam geração de texto.`);

        for (const m of contentModels) {
            const name = m.name.replace('models/', ''); // SDK uses name without prefix usually
            process.stdout.write(`\nTeste: [${name}] ... `);
            try {
                const model = genAI.getGenerativeModel({ model: name });
                const result = await model.generateContent("Oi");
                const response = await result.response;
                console.log(`✅ SUCESSO!`);
                console.log(`>>> USE ESTE NOME: "${name}" <<<`);
                return;
            } catch (e) {
                if (e.message && e.message.includes('429')) console.log("⚠️ 429 (Cota)");
                else if (e.message && e.message.includes('404')) console.log("❌ 404");
                else console.log(`❌ ${e.message}`);

                // Try with prefix if failed without
                if (e.message && e.message.includes('404')) {
                    process.stdout.write(`   (Tentando com prefixo ${m.name})... `);
                    try {
                        const modelP = genAI.getGenerativeModel({ model: m.name });
                        const resultP = await modelP.generateContent("Oi");
                        await resultP.response;
                        console.log(`✅ SUCESSO COM PREFIXO!`);
                        console.log(`>>> USE ESTE NOME: "${m.name}" <<<`);
                        return;
                    } catch (e2) {
                        console.log("❌ Falhou também.");
                    }
                }
            }
        }
        console.log("\n❌ Nenhum modelo funcionou.");

    } catch (e) {
        console.error("Erro fatal:", e);
    }
}

test();
