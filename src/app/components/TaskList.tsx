import { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Calendar,
  BookOpen,
  Filter,
  SortAsc,
  Download,
  Search,
  Pencil,
  Save,
  X,
  Flag,
} from 'lucide-react';
import confetti from 'canvas-confetti';

type Priority = 'low' | 'medium' | 'high';

interface Task {
  id: string;
  title: string;
  category: string;
  subject: string;
  dueDate: string;
  completed: boolean;
  priority: Priority;
}

type FilterType = 'all' | 'pending' | 'completed' | 'overdue' | 'high';
type SortType = 'date' | 'subject' | 'category' | 'priority' | 'recent';

const STORAGE_KEY = 'focototal-tasks';

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
  'Inglês',
];

const priorities: Array<{ value: Priority; label: string; className: string }> = [
  { value: 'low', label: 'Baixa', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { value: 'medium', label: 'Média', className: 'bg-amber-500/10 text-amber-300 border-amber-500/20' },
  { value: 'high', label: 'Alta', className: 'bg-destructive/10 text-destructive border-destructive/20' },
];

const priorityWeight: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

function isTask(value: unknown): value is Task {
  if (!value || typeof value !== 'object') return false;

  const task = value as Partial<Task>;
  return (
    typeof task.id === 'string' &&
    typeof task.title === 'string' &&
    typeof task.category === 'string' &&
    typeof task.subject === 'string' &&
    typeof task.dueDate === 'string' &&
    typeof task.completed === 'boolean'
  );
}

function normalizeTask(value: unknown): Task | null {
  if (!isTask(value)) return null;
  const priority = priorities.some((item) => item.value === value.priority) ? value.priority : 'medium';
  return { ...value, priority };
}

function loadTasks(): Task[] {
  if (typeof window === 'undefined') return [];

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];

    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];

    return parsed.map(normalizeTask).filter((task): task is Task => Boolean(task));
  } catch {
    return [];
  }
}

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [newTask, setNewTask] = useState('');
  const [category, setCategory] = useState('Prova');
  const [subject, setSubject] = useState('Matemática');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortType, setSortType] = useState<SortType>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Omit<Task, 'id' | 'completed'> | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  }, [tasks]);

  const addTask = () => {
    const title = newTask.trim();
    if (!title) return;

    setTasks([
      ...tasks,
      {
        id: Date.now().toString(),
        title,
        category,
        subject,
        dueDate,
        completed: false,
        priority,
      },
    ]);
    setNewTask('');
    setDueDate('');
    setPriority('medium');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map((task) => {
      if (task.id === id) {
        if (!task.completed) {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#0ea5e9', '#06b6d4', '#14b8a6'],
          });
        }
        return { ...task, completed: !task.completed };
      }
      return task;
    }));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
    if (editingTaskId === id) {
      cancelEditing();
    }
  };

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingTask({
      title: task.title,
      category: task.category,
      subject: task.subject,
      dueDate: task.dueDate,
      priority: task.priority,
    });
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditingTask(null);
  };

  const saveEditing = () => {
    if (!editingTaskId || !editingTask?.title.trim()) return;

    setTasks(tasks.map((task) => (
      task.id === editingTaskId
        ? { ...task, ...editingTask, title: editingTask.title.trim() }
        : task
    )));
    cancelEditing();
  };

  const clearCompleted = () => {
    if (window.confirm('Deseja realmente excluir todas as tarefas concluídas?')) {
      setTasks(tasks.filter((task) => !task.completed));
    }
  };

  const exportTasks = () => {
    const csvContent = [
      ['Título', 'Disciplina', 'Tipo', 'Prioridade', 'Data de Entrega', 'Status'].join(','),
      ...tasks.map((task) => [
        `"${task.title.replace(/"/g, '""')}"`,
        task.subject,
        task.category,
        getPriorityLabel(task.priority),
        task.dueDate || 'Sem data',
        task.completed ? 'Concluída' : 'Pendente',
      ].join(',')),
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
    URL.revokeObjectURL(url);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(`${dateString}T00:00:00`);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const isOverdue = (dateString: string) => {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDueDate = new Date(`${dateString}T00:00:00`);
    return taskDueDate < today;
  };

  const getPriorityLabel = (taskPriority: Priority) => {
    return priorities.find((item) => item.value === taskPriority)?.label ?? 'Média';
  };

  const getPriorityClassName = (taskPriority: Priority) => {
    return priorities.find((item) => item.value === taskPriority)?.className ?? priorities[1].className;
  };

  const filteredAndSortedTasks = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLocaleLowerCase('pt-BR');
    let filtered = [...tasks];

    if (normalizedSearch) {
      filtered = filtered.filter((task) => {
        const searchable = `${task.title} ${task.subject} ${task.category}`.toLocaleLowerCase('pt-BR');
        return searchable.includes(normalizedSearch);
      });
    }

    switch (filterType) {
      case 'pending':
        filtered = filtered.filter((task) => !task.completed);
        break;
      case 'completed':
        filtered = filtered.filter((task) => task.completed);
        break;
      case 'overdue':
        filtered = filtered.filter((task) => isOverdue(task.dueDate) && !task.completed);
        break;
      case 'high':
        filtered = filtered.filter((task) => task.priority === 'high' && !task.completed);
        break;
    }

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
      case 'priority':
        filtered.sort((a, b) => priorityWeight[a.priority] - priorityWeight[b.priority]);
        break;
      case 'recent':
        filtered.reverse();
        break;
    }

    return filtered;
  }, [tasks, filterType, sortType, searchQuery]);

  const completedTasks = tasks.filter((task) => task.completed).length;
  const pendingTasks = tasks.filter((task) => !task.completed).length;
  const overdueTasks = tasks.filter((task) => isOverdue(task.dueDate) && !task.completed).length;
  const highPriorityTasks = tasks.filter((task) => task.priority === 'high' && !task.completed).length;
  const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {tasks.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por tarefa, disciplina ou tipo..."
                className="w-full pl-10 pr-4 py-2.5 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <Filter size={18} className="text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Filtrar:</span>
                {[
                  ['all', 'Todas'],
                  ['pending', 'Pendentes'],
                  ['completed', 'Concluídas'],
                  ['overdue', 'Atrasadas'],
                  ['high', 'Alta prioridade'],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setFilterType(value as FilterType)}
                    className={`px-3 py-1 text-xs rounded-md transition-all ${
                      filterType === value
                        ? value === 'overdue' || value === 'high'
                          ? 'bg-destructive text-white'
                          : 'bg-primary text-white'
                        : 'bg-secondary text-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {label}
                  </button>
                ))}
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
                  <option value="priority">Prioridade</option>
                  <option value="date">Data de entrega</option>
                  <option value="subject">Disciplina</option>
                  <option value="category">Tipo</option>
                </select>
              </div>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                Prioridade
              </label>
              <div className="relative">
                <Flag size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground appearance-none cursor-pointer"
                >
                  {priorities.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
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
              Tente ajustar busca, filtros ou ordenação
            </p>
          </div>
        ) : (
          filteredAndSortedTasks.map((task) => {
            const isEditing = editingTaskId === task.id && editingTask;

            return (
              <div
                key={task.id}
                className={`bg-card border rounded-lg hover:border-primary/50 transition-all p-4 ${
                  task.completed ? 'opacity-75' : ''
                } ${isOverdue(task.dueDate) && !task.completed ? 'border-destructive/50 bg-destructive/5' : 'border-border'}`}
              >
                {isEditing ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editingTask.title}
                      onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                      className="w-full px-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <select
                        value={editingTask.subject}
                        onChange={(e) => setEditingTask({ ...editingTask, subject: e.target.value })}
                        className="px-4 py-2.5 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                      >
                        {subjects.map((subj) => (
                          <option key={subj} value={subj}>{subj}</option>
                        ))}
                      </select>

                      <select
                        value={editingTask.category}
                        onChange={(e) => setEditingTask({ ...editingTask, category: e.target.value })}
                        className="px-4 py-2.5 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>

                      <select
                        value={editingTask.priority}
                        onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as Priority })}
                        className="px-4 py-2.5 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                      >
                        {priorities.map((item) => (
                          <option key={item.value} value={item.value}>{item.label}</option>
                        ))}
                      </select>

                      <input
                        type="date"
                        value={editingTask.dueDate}
                        onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                        className="px-4 py-2.5 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={saveEditing}
                        disabled={!editingTask.title.trim()}
                        className="flex-1 px-4 py-2 text-sm bg-primary text-white hover:opacity-90 rounded-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Save size={16} />
                        Salvar
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="flex-1 px-4 py-2 text-sm bg-secondary text-foreground hover:bg-secondary/80 rounded-md transition-colors flex items-center justify-center gap-2"
                      >
                        <X size={16} />
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="flex-shrink-0 mt-1 text-primary hover:scale-110 transition-transform"
                      title={task.completed ? 'Marcar como pendente' : 'Marcar como concluída'}
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

                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border ${getPriorityClassName(task.priority)}`}>
                          <Flag size={14} />
                          {getPriorityLabel(task.priority)}
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

                    <div className="flex flex-shrink-0 gap-1">
                      <button
                        onClick={() => startEditing(task)}
                        className="text-muted-foreground hover:text-primary transition-colors p-1"
                        title="Editar tarefa"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1"
                        title="Excluir tarefa"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {tasks.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Progresso Geral</span>
              <span className="text-sm font-medium text-foreground">
                {progress}%
              </span>
            </div>
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center mb-4">
            <div>
              <div className="text-2xl font-bold text-foreground">{tasks.length}</div>
              <div className="text-xs text-muted-foreground mt-1">Total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{completedTasks}</div>
              <div className="text-xs text-muted-foreground mt-1">Concluídas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{pendingTasks}</div>
              <div className="text-xs text-muted-foreground mt-1">Pendentes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-destructive">{overdueTasks}</div>
              <div className="text-xs text-muted-foreground mt-1">Atrasadas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-300">{highPriorityTasks}</div>
              <div className="text-xs text-muted-foreground mt-1">Prioridade alta</div>
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
            {completedTasks > 0 && (
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
