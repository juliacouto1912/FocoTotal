import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, CheckCircle2, Clock, Flame, ListTodo, Target, TrendingUp } from 'lucide-react';

type Priority = 'low' | 'medium' | 'high';

interface Task {
  id: string;
  title: string;
  category: string;
  subject: string;
  dueDate: string;
  completed: boolean;
  priority?: Priority;
}

interface Session {
  duration: number;
  completedAt: string;
  mode?: string;
}

function loadStoredArray<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];

  try {
    const saved = localStorage.getItem(key);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function isToday(isoString: string) {
  const date = new Date(isoString);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

function isOverdue(dateString: string) {
  if (!dateString) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(`${dateString}T00:00:00`) < today;
}

function formatDate(dateString: string) {
  if (!dateString) return 'Sem data';
  return new Date(`${dateString}T00:00:00`).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });
}

export function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    setTasks(loadStoredArray<Task>('focototal-tasks'));
    setSessions(loadStoredArray<Session>('focototal-sessions'));
  }, []);

  const pendingTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed).length;
  const overdueTasks = pendingTasks.filter((task) => isOverdue(task.dueDate)).length;
  const todayFocusMinutes = sessions
    .filter((session) => isToday(session.completedAt))
    .reduce((total, session) => total + session.duration, 0);
  const totalFocusMinutes = sessions.reduce((total, session) => total + session.duration, 0);

  const nextTasks = useMemo(() => {
    return [...pendingTasks]
      .sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      })
      .slice(0, 4);
  }, [pendingTasks]);

  const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      <section className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.8fr] gap-6 items-stretch">
        <div className="bg-card border border-border rounded-lg p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
              <Target size={28} className="text-primary" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Painel de foco</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">FocoTotal</h1>
            </div>
          </div>

          <p className="text-muted-foreground max-w-2xl leading-relaxed mb-8">
            Organize suas tarefas, acompanhe sessões de estudo e mantenha uma rotina mais previsível sem depender só de motivação.
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-secondary/60 border border-border rounded-lg p-4">
              <ListTodo size={20} className="text-primary mb-3" />
              <div className="text-2xl font-bold">{pendingTasks.length}</div>
              <div className="text-xs text-muted-foreground mt-1">tarefas pendentes</div>
            </div>
            <div className="bg-secondary/60 border border-border rounded-lg p-4">
              <CheckCircle2 size={20} className="text-primary mb-3" />
              <div className="text-2xl font-bold">{completionRate}%</div>
              <div className="text-xs text-muted-foreground mt-1">progresso geral</div>
            </div>
            <div className="bg-secondary/60 border border-border rounded-lg p-4">
              <Clock size={20} className="text-primary mb-3" />
              <div className="text-2xl font-bold">{todayFocusMinutes}</div>
              <div className="text-xs text-muted-foreground mt-1">min hoje</div>
            </div>
            <div className="bg-secondary/60 border border-border rounded-lg p-4">
              <TrendingUp size={20} className="text-primary mb-3" />
              <div className="text-2xl font-bold">{totalFocusMinutes}</div>
              <div className="text-xs text-muted-foreground mt-1">min totais</div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold flex items-center gap-2">
              <CalendarClock size={20} className="text-primary" />
              Próximas entregas
            </h2>
            {overdueTasks > 0 && (
              <span className="text-xs px-2.5 py-1 rounded-md bg-destructive/10 text-destructive border border-destructive/20">
                {overdueTasks} atrasada{overdueTasks !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {nextTasks.length > 0 ? (
            <div className="space-y-3">
              {nextTasks.map((task) => (
                <div key={task.id} className="border border-border rounded-lg p-3 bg-secondary/40">
                  <div className="font-medium text-sm mb-2">{task.title}</div>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span>{task.subject}</span>
                    <span>•</span>
                    <span>{task.category}</span>
                    <span>•</span>
                    <span className={isOverdue(task.dueDate) ? 'text-destructive' : ''}>
                      {formatDate(task.dueDate)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <Flame size={32} className="text-primary mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Sem tarefas pendentes por enquanto.</p>
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <Clock size={24} className="text-primary mb-4" />
          <h3 className="font-semibold mb-2">Ciclos de foco</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Trabalhe em blocos curtos e alternados com pausas para manter energia e reduzir desgaste mental.
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <ListTodo size={24} className="text-primary mb-4" />
          <h3 className="font-semibold mb-2">Prioridade visível</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Busque, filtre e organize tarefas para decidir mais rápido o que merece sua atenção agora.
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <TrendingUp size={24} className="text-primary mb-4" />
          <h3 className="font-semibold mb-2">Progresso acumulado</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Acompanhe minutos estudados e tarefas concluídas para transformar esforço em histórico concreto.
          </p>
        </div>
      </section>
    </div>
  );
}
