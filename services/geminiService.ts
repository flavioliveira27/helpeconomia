import { Transaction } from "../types";
import { apiService } from "./apiService";

export const generateFinancialInsights = async (transactions: Transaction[]): Promise<string> => {
  try {
    const response = await apiService.request('/api/ai/insights', {
      method: 'POST',
      body: JSON.stringify({ transactions })
    });

    return response.result || "Não foi possível gerar insights no momento.";
  } catch (error) {
    console.error("Erro ao gerar insights:", error);
    return "Ocorreu um erro ao analisar seus dados. Tente novamente mais tarde.";
  }
};