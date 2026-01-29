import React, { useState } from 'react';
import { Sparkles, RefreshCcw } from 'lucide-react';
import { useFinancial } from '../../contexts/FinancialContext';
import { generateFinancialInsights } from '../../services/geminiService';
import ReactMarkdown from 'react-markdown';

export const SmartAdvisor: React.FC = () => {
  const { transactions } = useFinancial();
  const [insight, setInsight] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const result = await generateFinancialInsights(transactions);
    setInsight(result);
    setLoading(false);
    setHasLoaded(true);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-xl p-6 text-white shadow-lg mb-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32 pointer-events-none"></div>

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <Sparkles className="text-yellow-400" />
          <h3 className="font-bold text-lg">Consultor IA</h3>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-2 text-sm bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
        >
          <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
          {loading ? 'Analisando...' : (hasLoaded ? 'Atualizar Análise' : 'Gerar Insights')}
        </button>
      </div>

      <div className="relative z-10 min-h-[100px]">
        {loading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-white/20 rounded w-3/4"></div>
            <div className="h-4 bg-white/20 rounded w-full"></div>
            <div className="h-4 bg-white/20 rounded w-5/6"></div>
          </div>
        ) : hasLoaded ? (
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown>{insight}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-slate-300 text-sm">
            Clique em "Gerar Insights" para receber uma análise inteligente das suas finanças baseada nas transações cadastradas, powered by Gemini.
          </p>
        )}
      </div>
    </div>
  );
};