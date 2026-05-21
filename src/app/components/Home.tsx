import { Clock, ListTodo, Lightbulb, Target, TrendingUp } from 'lucide-react';

export function Home() {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-6">
        <div className="flex justify-center mb-6">
          <div className="p-5 bg-primary/10 rounded-xl border border-primary/20">
            <Target size={56} className="text-primary" strokeWidth={1.5} />
          </div>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-foreground">
          Foco na Produtividade
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Seu aliado contra a procrastinação. Organize seus estudos, mantenha o foco e alcance seus objetivos acadêmicos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-primary/10 rounded-lg border border-primary/20">
              <Clock size={22} className="text-primary" strokeWidth={2} />
            </div>
            <h3 className="font-semibold">Cronômetro Pomodoro</h3>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Técnica comprovada para manter o foco. Escolha entre 15, 25, 45 minutos ou 1 hora de concentração total.
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-primary/10 rounded-lg border border-primary/20">
              <ListTodo size={22} className="text-primary" strokeWidth={2} />
            </div>
            <h3 className="font-semibold">Organização</h3>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Crie listas de tarefas, organize matérias, provas e trabalhos. Acompanhe seu progresso em tempo real.
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-primary/10 rounded-lg border border-primary/20">
              <TrendingUp size={22} className="text-primary" strokeWidth={2} />
            </div>
            <h3 className="font-semibold">Motivação</h3>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Frases inspiradoras para manter você motivado durante sua jornada de estudos.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Por que procrastinamos?</h3>
          <div className="space-y-3 text-muted-foreground text-sm leading-relaxed">
            <p>
              A procrastinação é um hábito que afeta milhões de estudantes. O cérebro prefere recompensas imediatas a objetivos de longo prazo.
            </p>
            <p>
              A solução não é esperar motivação - é criar sistemas. Disciplina vence motivação.
            </p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Técnica Pomodoro</h3>
          <div className="space-y-3 text-muted-foreground text-sm leading-relaxed">
            <p>
              Divida seu estudo em blocos de tempo focado (25 minutos) seguidos de pausas curtas (5 minutos).
            </p>
            <p>
              Após 4 blocos, faça uma pausa mais longa (15-30 minutos). Esta técnica aumenta a concentração e reduz o cansaço mental.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-semibold mb-4 text-center">Dicas para Maximizar sua Produtividade</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs text-primary font-bold">
              1
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Elimine distrações:</span> Silencie notificações e mantenha o celular longe durante sessões de estudo.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs text-primary font-bold">
              2
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Planeje com antecedência:</span> Organize suas tarefas e defina prioridades claras.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs text-primary font-bold">
              3
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Faça pausas regulares:</span> Seu cérebro precisa de descanso para manter o desempenho.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs text-primary font-bold">
              4
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Celebre pequenas vitórias:</span> Reconheça cada tarefa concluída para manter a motivação.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center border-t border-border pt-8">
        <p className="text-muted-foreground mb-2">
          Comece agora. Seu futuro eu agradece.
        </p>
        <p className="text-sm text-muted-foreground/70">
          Pequenos passos consistentes levam a grandes resultados
        </p>
      </div>
    </div>
  );
}
