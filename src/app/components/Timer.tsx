import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TimerProps {
  onComplete?: () => void;
}

interface Session {
  duration: number;
  completedAt: string;
}

export function Timer({ onComplete }: TimerProps) {
  const [selectedTime, setSelectedTime] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState<Session[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('focototal-sessions');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const intervalRef = useRef<number | null>(null);

  // Salvar sessões no localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('focototal-sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  // Solicitar permissão para notificações
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []);

  // Atualizar título da página quando cronômetro estiver rodando
  useEffect(() => {
    if (isRunning) {
      const interval = window.setInterval(() => {
        document.title = `${formatTime(timeLeft)} - Cronômetro - FocoTotal`;
      }, 1000);
      return () => window.clearInterval(interval);
    } else {
      document.title = 'Cronômetro - FocoTotal';
    }
  }, [isRunning, timeLeft]);

  // Prevenir saída acidental quando cronômetro estiver rodando
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isRunning) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isRunning]);

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Espaço para iniciar/pausar
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        toggleTimer();
      }
      // R para resetar
      if (e.code === 'KeyR' && e.target === document.body) {
        e.preventDefault();
        resetTimer();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isRunning, timeLeft, selectedTime]);

  const timeOptions = [
    { label: '15 min', value: 15 },
    { label: '25 min', value: 25 },
    { label: '45 min', value: 45 },
    { label: '1 hora', value: 60 },
  ];

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            setIsRunning(false);
            if (intervalRef.current) {
              window.clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            // Adicionar sessão completada
            const newSession: Session = {
              duration: selectedTime,
              completedAt: new Date().toISOString()
            };
            setSessions(prev => [newSession, ...prev].slice(0, 10));

            // Tocar som de notificação (beep básico)
            playNotificationSound();

            // Celebração com confete
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            });

            if (onComplete) {
              onComplete();
            }
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (!isRunning && intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, onComplete, selectedTime]);

  const playNotificationSound = () => {
    // Criar um beep simples usando Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Não foi possível reproduzir o som');
    }

    // Mostrar notificação do navegador
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('FocoTotal - Sessão Concluída!', {
        body: `Parabéns! Você completou ${selectedTime} minutos de estudo focado.`,
        icon: '/favicon.ico',
        tag: 'focototal-timer'
      });
    }
  };

  useEffect(() => {
    if (timeLeft === 0 && intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsRunning(false);
    }
  }, [timeLeft]);

  const handleTimeSelect = (minutes: number) => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setSelectedTime(minutes);
    setTimeLeft(minutes * 60);
    setIsRunning(false);
  };

  const toggleTimer = () => {
    if (timeLeft === 0) {
      setTimeLeft(selectedTime * 60);
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    setTimeLeft(selectedTime * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatSessionTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const progress = ((selectedTime * 60 - timeLeft) / (selectedTime * 60)) * 100;
  const totalStudyTime = sessions.reduce((acc, session) => acc + session.duration, 0);

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-md mx-auto">
      <div className="flex gap-2 flex-wrap justify-center">
        {timeOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handleTimeSelect(option.value)}
            disabled={isRunning}
            className={`px-5 py-2.5 rounded-lg transition-all font-medium ${
              selectedTime === option.value
                ? 'bg-primary text-white shadow-lg shadow-primary/50'
                : 'bg-secondary text-foreground hover:bg-secondary/80 border border-border'
            } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="relative w-64 h-64 flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="128"
            cy="128"
            r="112"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-muted"
          />
          <circle
            cx="128"
            cy="128"
            r="112"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 112}`}
            strokeDashoffset={`${2 * Math.PI * 112 * (1 - progress / 100)}`}
            className="text-primary transition-all duration-300"
            strokeLinecap="round"
          />
        </svg>
        <div className="text-5xl font-bold text-foreground">{formatTime(timeLeft)}</div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={toggleTimer}
          className="flex items-center gap-2 px-8 py-3.5 bg-primary text-white rounded-lg hover:opacity-90 transition-all shadow-lg shadow-primary/50 font-medium"
        >
          {isRunning ? (
            <>
              <Pause size={22} />
              Pausar
            </>
          ) : (
            <>
              <Play size={22} />
              {timeLeft === 0 ? 'Reiniciar' : 'Iniciar'}
            </>
          )}
        </button>
        <button
          onClick={resetTimer}
          className="flex items-center gap-2 px-8 py-3.5 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-all border border-border font-medium"
        >
          <RotateCcw size={22} />
          Resetar
        </button>
      </div>

      {timeLeft === 0 && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <p className="text-primary font-medium">Tempo concluído</p>
          </div>
          <p className="text-sm text-muted-foreground mt-3">Ótimo trabalho! Faça uma pausa.</p>
        </div>
      )}

      <div className="w-full max-w-md mx-auto mt-8">
        <div className="bg-secondary/50 border border-border rounded-lg p-4 mb-4">
          <p className="text-sm text-muted-foreground text-center mb-2">
            <span className="font-medium text-foreground">Atalhos:</span>
          </p>
          <div className="flex gap-4 justify-center text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-card border border-border rounded">Espaço</kbd>
              Iniciar/Pausar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-card border border-border rounded">R</kbd>
              Resetar
            </span>
          </div>
        </div>
      </div>

      {sessions.length > 0 && (
        <div className="w-full max-w-md mx-auto bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Clock size={18} className="text-primary" />
              Histórico de Sessões
            </h3>
            <div className="text-sm text-muted-foreground">
              {sessions.length} sessão{sessions.length !== 1 ? 'ões' : ''}
            </div>
          </div>

          <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg text-center">
            <div className="text-2xl font-bold text-primary">
              {totalStudyTime} min
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Tempo total de estudo
            </div>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {sessions.map((session, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-secondary rounded-md"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm font-medium">{session.duration} minutos</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatSessionTime(session.completedAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
