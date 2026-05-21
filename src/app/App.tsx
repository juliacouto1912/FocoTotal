import { useState, useEffect } from 'react';
import { Home, Clock, ListTodo, Lightbulb } from 'lucide-react';
import { Timer } from './components/Timer';
import { TaskList } from './components/TaskList';
import { Motivation } from './components/Motivation';
import { Home as HomePage } from './components/Home';

type Tab = 'inicio' | 'cronometro' | 'organizacao' | 'motivacao';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('inicio');

  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.body.style.backgroundColor = '#0f1419';
  }, []);

  useEffect(() => {
    const titles = {
      inicio: 'Início - FocoTotal',
      cronometro: 'Cronômetro - FocoTotal',
      organizacao: 'Organização - FocoTotal',
      motivacao: 'Motivação - FocoTotal'
    };
    document.title = titles[activeTab];
  }, [activeTab]);

  const tabs = [
    { id: 'inicio' as Tab, label: 'Início', icon: Home },
    { id: 'cronometro' as Tab, label: 'Cronômetro', icon: Clock },
    { id: 'organizacao' as Tab, label: 'Organização', icon: ListTodo },
    { id: 'motivacao' as Tab, label: 'Motivação', icon: Lightbulb },
  ];

  return (
    <div className="min-h-screen dark" style={{ backgroundColor: '#0f1419', color: '#e4e6eb' }}>
      <header className="border-b border-border bg-card/95 backdrop-blur-md sticky top-0 z-10 shadow-lg">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-foreground">FocoTotal</h1>
            </div>
          </div>

          <nav className="flex gap-2 overflow-x-auto pb-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all whitespace-nowrap font-medium ${
                    activeTab === tab.id
                      ? 'bg-primary text-white shadow-lg shadow-primary/50'
                      : 'bg-secondary text-foreground hover:bg-secondary/80 border border-border'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {activeTab === 'inicio' && <HomePage />}
        {activeTab === 'cronometro' && (
          <div>
            <div className="text-center mb-8">
              <h2 className="mb-2">Cronômetro de Foco</h2>
              <p className="text-muted-foreground">
                Use a técnica Pomodoro para manter a concentração e aumentar a produtividade
              </p>
            </div>
            <Timer />
          </div>
        )}
        {activeTab === 'organizacao' && (
          <div>
            <div className="text-center mb-8">
              <h2 className="mb-2">Organize suas Tarefas</h2>
              <p className="text-muted-foreground">
                Gerencie suas atividades acadêmicas com eficiência
              </p>
            </div>
            <TaskList />
          </div>
        )}
        {activeTab === 'motivacao' && (
          <div>
            <div className="text-center mb-8">
              <h2 className="mb-2">Mantenha-se Motivado</h2>
              <p className="text-muted-foreground">
                Frases para inspirar sua jornada
              </p>
            </div>
            <Motivation />
          </div>
        )}
      </main>

      <footer className="border-t border-border bg-card/50 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground mb-2">Feito para estudantes que querem vencer a procrastinação</p>
          <p className="text-sm text-muted-foreground/70">Transforme tempo em resultados</p>
        </div>
      </footer>
    </div>
  );
}