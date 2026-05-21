import { useState, useMemo, useEffect } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, Calendar, BookOpen, Filter, SortAsc, Download } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Task {
  id: string;
  title: string;
  category: string;
  subject: string;
  dueDate: string;
  completed: boolean;
}

type FilterType = 'all' | 'pending' | 'completed' | 'overdue';
type SortType = 'date' | 'subject' | 'category' | 'recent';

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('focototal-tasks');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [newTask, setNewTask] = useState('');
  const [category, setCategory] = useState('Prova');
  const [subject, setSubject] = useState('Matemática');
  const [dueDate, setDueDate] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortType, setSortType] = useState<SortType>('recent');

  // Salvar tarefas no localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('focototal-tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  const categories = ['Prova', 'Trabalho', 'Projeto', 'Exercícios', 'Estudo'];
  const subjects = [
    'Matemática',
    'Português',
    'Química',
    'Física',
    'História',
    'Biologia',
    'Sociologia',
    'Filosofia',
    'Geografia',
    'Inglês'
  ];

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([
        ...tasks,
        {
          id: Date.now().toString(),
          title: newTask,
          category,
          subject,
          dueDate,
          completed: false,
        },
      ]);
      setNewTask('');
      setDueDate('');
    }
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map((task) => {
      if (task.id === id) {
        // Se está marcando como completa (não estava completo antes)
        if (!task.completed) {
          // Pequeno confete de celebração
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#0ea5e9', '#06b6d4', '#14b8a6']
          });
        }
        return { ...task, completed: !task.completed };
      }
      return task;
    }));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const clearCompleted = () => {
    if (window.confirm('Deseja realmente excluir todas as tarefas concluídas?')) {
      setTasks(tasks.filter((task) => !task.completed));
    }
  };

  const exportTasks = () => {
    const csvContent = [
      ['Título', 'Disciplina', 'Tipo', 'Data de Entrega', 'Status'].join(','),
      ...tasks.map(task => [
        `"${task.title}"`,
        task.subject,
        task.category,
        task.dueDate || 'Sem data',
        task.completed ? 'Concluída' : 'Pendente'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `focototal-tarefas-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const isOverdue = (dateString: string) => {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dateString + 'T00:00:00');
    return dueDate < today;
  };

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = [...tasks];

    // Aplicar filtro
    switch (filterType) {
      case 'pending':
        filtered = filtered.filter(t => !t.completed);
        break;
      case 'completed':
        filtered = filtered.filter(t => t.completed);
        break;
      case 'overdue':
        filtered = filtered.filter(t => isOverdue(t.dueDate) && !t.completed);
        break;
    }

    // Aplicar ordenação
    switch (sortType) {
      case 'date':
        filtered.sort((a, b) => {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.localeCompare(b.dueDate);
        });
        break;
      case 'subject':
        filtered.sort((a, b) => a.subject.localeCompare(b.subject));
        break;
      case 'category':
        filtered.sort((a, b) => a.category.localeCompare(b.category));
        break;
      case 'recent':
        filtered.reverse();
        break;
    }

    return filtered;
  }, [tasks, filterType, sortType]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {tasks.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Filtrar:</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1 text-xs rounded-md transition-all ${
                    filterType === 'all'
                      ? 'bg-primary text-white'
                      : 'bg-secondary text-foreground hover:bg-secondary/80'
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setFilterType('pending')}
                  className={`px-3 py-1 text-xs rounded-md transition-all ${
                    filterType === 'pending'
                      ? 'bg-primary text-white'
                      : 'bg-secondary text-foreground hover:bg-secondary/80'
                  }`}
                >
                  Pendentes
                </button>
                <button
                  onClick={() => setFilterType('completed')}
                  className={`px-3 py-1 text-xs rounded-md transition-all ${
                    filterType === 'completed'
                      ? 'bg-primary text-white'
                      : 'bg-secondary text-foreground hover:bg-secondary/80'
                  }`}
                >
                  Concluídas
                </button>
                <button
                  onClick={() => setFilterType('overdue')}
                  className={`px-3 py-1 text-xs rounded-md transition-all ${
                    filterType === 'overdue'
                      ? 'bg-destructive text-white'
                      : 'bg-secondary text-foreground hover:bg-secondary/80'
                  }`}
                >
                  Atrasadas
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <SortAsc size={18} className="text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Ordenar:</span>
              <select
                value={sortType}
                onChange={(e) => setSortType(e.target.value as SortType)}
                className="px-3 py-1 text-xs bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground cursor-pointer"
              >
                <option value="recent">Mais recentes</option>
                <option value="date">Data de entrega</option>
                <option value="subject">Disciplina</option>
                <option value="category">Tipo</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Plus size={20} className="text-primary" />
          Nova Tarefa
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-muted-foreground">
              Descrição da Tarefa
            </label>
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ex: Estudar para prova de derivadas..."
              className="w-full px-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-muted-foreground">
                Disciplina
              </label>
              <div className="relative">
                <BookOpen size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground appearance-none cursor-pointer"
                >
                  {subjects.map((subj) => (
                    <option key={subj} value={subj}>
                      {subj}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-muted-foreground">
                Tipo
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground appearance-none cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-muted-foreground">
                Data de Entrega
              </label>
              <div className="relative">
                <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground cursor-pointer"
                />
              </div>
            </div>
          </div>

          <button
            onClick={addTask}
            disabled={!newTask.trim()}
            className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:opacity-90 transition-all shadow-lg shadow-primary/50 flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={20} />
            Adicionar Tarefa
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary rounded-full mb-4">
              <BookOpen size={32} className="text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-2">Nenhuma tarefa adicionada</p>
            <p className="text-sm text-muted-foreground/70">
              Comece organizando seus estudos adicionando sua primeira tarefa
            </p>
          </div>
        ) : filteredAndSortedTasks.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary rounded-full mb-4">
              <Filter size={32} className="text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-2">Nenhuma tarefa encontrada</p>
            <p className="text-sm text-muted-foreground/70">
              Tente ajustar os filtros para ver suas tarefas
            </p>
          </div>
        ) : (
          filteredAndSortedTasks.map((task) => (
            <div
              key={task.id}
              className={`bg-card border rounded-lg hover:border-primary/50 transition-all p-4 ${
                task.completed ? 'opacity-75' : ''
              } ${isOverdue(task.dueDate) && !task.completed ? 'border-destructive/50 bg-destructive/5' : 'border-border'}`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleTask(task.id)}
                  className="flex-shrink-0 mt-1 text-primary hover:scale-110 transition-transform"
                >
                  {task.completed ? (
                    <CheckCircle2 size={24} className="text-primary" />
                  ) : (
                    <Circle size={24} />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className={`font-medium mb-2 ${task.completed ? 'line-through opacity-60' : ''}`}>
                    {task.title}
                  </div>

                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-md border border-primary/20">
                      <BookOpen size={14} />
                      {task.subject}
                    </span>

                    <span className="inline-flex items-center px-2.5 py-1 bg-secondary text-foreground text-xs rounded-md border border-border">
                      {task.category}
                    </span>

                    {task.dueDate && (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border ${
                        isOverdue(task.dueDate) && !task.completed
                          ? 'bg-destructive/10 text-destructive border-destructive/20'
                          : 'bg-secondary text-muted-foreground border-border'
                      }`}>
                        <Calendar size={14} />
                        {formatDate(task.dueDate)}
                        {isOverdue(task.dueDate) && !task.completed && (
                          <span className="font-medium">(Atrasada)</span>
                        )}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="flex-shrink-0 text-muted-foreground hover:text-destructive transition-colors p-1"
                  title="Excluir tarefa"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {tasks.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Progresso Geral</span>
              <span className="text-sm font-medium text-foreground">
                {Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100)}%
              </span>
            </div>
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${(tasks.filter(t => t.completed).length / tasks.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center mb-4">
            <div>
              <div className="text-2xl font-bold text-foreground">
                {tasks.length}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Total
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {tasks.filter((t) => t.completed).length}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Concluídas
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {tasks.filter((t) => !t.completed).length}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Pendentes
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-destructive">
                {tasks.filter((t) => isOverdue(t.dueDate) && !t.completed).length}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Atrasadas
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-4 flex gap-2">
            <button
              onClick={exportTasks}
              className="flex-1 px-4 py-2 text-sm bg-secondary text-foreground hover:bg-secondary/80 rounded-md transition-colors flex items-center justify-center gap-2"
            >
              <Download size={16} />
              Exportar CSV
            </button>
            {tasks.filter((t) => t.completed).length > 0 && (
              <button
                onClick={clearCompleted}
                className="flex-1 px-4 py-2 text-sm bg-secondary text-foreground hover:bg-secondary/80 rounded-md transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                Limpar Concluídas
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
