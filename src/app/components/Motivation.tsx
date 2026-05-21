import { useState, useEffect } from 'react';
import { RefreshCw, Quote } from 'lucide-react';

export function Motivation() {
  const motivationalQuotes = [
    'O sucesso é a soma de pequenos esforços repetidos dia após dia.',
    'Não espere a motivação. Discipline-se e comece agora.',
    'Cada minuto estudando é um investimento no seu futuro.',
    'A procrastinação rouba seus sonhos. Aja agora.',
    'Você é mais forte do que pensa. Continue focado.',
    'O difícil de hoje é o fácil de amanhã.',
    'Não desista. O começo é sempre o mais difícil.',
    'Concentração é a chave para transformar esforço em resultado.',
    'Seu futuro eu agradece pelo esforço de hoje.',
    'Pequenos progressos ainda são progressos.',
    'A disciplina supera a motivação.',
    'Faça hoje o que outros não querem, amanhã você terá o que outros não têm.',
    'Cada hora de estudo é um passo mais perto dos seus objetivos.',
    'Não conte os dias, faça os dias contarem.',
    'O único lugar onde sucesso vem antes de trabalho é no dicionário.',
  ];

  const [currentQuote, setCurrentQuote] = useState('');
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setCurrentQuote(motivationalQuotes[0]);
  }, []);

  const getNewQuote = () => {
    setIsTransitioning(true);

    setTimeout(() => {
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * motivationalQuotes.length);
      } while (newIndex === quoteIndex && motivationalQuotes.length > 1);

      setQuoteIndex(newIndex);
      setCurrentQuote(motivationalQuotes[newIndex]);
      setIsTransitioning(false);
    }, 200);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      <div className="relative">
        <div className="absolute top-6 left-6 text-primary/20">
          <Quote size={40} strokeWidth={2} />
        </div>
        <div className="relative bg-card border border-border rounded-lg p-12 sm:p-16">
          <blockquote
            className={`text-xl sm:text-2xl text-center leading-relaxed text-foreground transition-opacity duration-200 ${
              isTransitioning ? 'opacity-0' : 'opacity-100'
            }`}
          >
            {currentQuote}
          </blockquote>
        </div>
        <div className="absolute bottom-6 right-6 text-primary/20 rotate-180">
          <Quote size={40} strokeWidth={2} />
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={getNewQuote}
          className="flex items-center gap-2 px-8 py-3.5 bg-primary text-white rounded-lg hover:opacity-90 transition-all shadow-lg shadow-primary/50 font-medium"
        >
          <RefreshCw size={22} />
          Nova Frase
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8">
        <div className="bg-card border border-border rounded-lg p-6 text-center hover:border-primary/50 transition-all">
          <div className="mb-3 flex justify-center">
            <div className="p-2.5 bg-primary/10 rounded-lg border border-primary/20">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="6"/>
                <circle cx="12" cy="12" r="2"/>
              </svg>
            </div>
          </div>
          <h3 className="mb-2 font-semibold">Foco Total</h3>
          <p className="text-sm text-muted-foreground">
            Elimine distrações e concentre-se no que importa
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 text-center hover:border-primary/50 transition-all">
          <div className="mb-3 flex justify-center">
            <div className="p-2.5 bg-primary/10 rounded-lg border border-primary/20">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            </div>
          </div>
          <h3 className="mb-2 font-semibold">Organização</h3>
          <p className="text-sm text-muted-foreground">
            Planeje suas tarefas e alcance seus objetivos
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 text-center hover:border-primary/50 transition-all">
          <div className="mb-3 flex justify-center">
            <div className="p-2.5 bg-primary/10 rounded-lg border border-primary/20">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
          </div>
          <h3 className="mb-2 font-semibold">Produtividade</h3>
          <p className="text-sm text-muted-foreground">
            Transforme tempo em resultados concretos
          </p>
        </div>
      </div>
    </div>
  );
}
