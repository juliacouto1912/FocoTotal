import { useState, useEffect, useMemo, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock, Coffee, Focus, SkipForward } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TimerProps {
  onComplete?: () => void;
}

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

type AudioWindow = Window & {
  webkitAudioContext?: typeof globalThis.AudioContext;
};

interface Session {
  duration: number;
  completedAt: string;
  mode: TimerMode;
}

const STORAGE_KEY = 'focototal-sessions';

const modeConfig: Record<TimerMode, { label: string; minutes: number; description: string }> = {
  focus: {
    label: 'Foco',
    minutes: 25,
    description: 'Sessão principal para estudar sem interrupções.',
  },
  shortBreak: {
    label: 'Pausa curta',
    minutes: 5,
    description: 'Respire, alongue e volte sem perder o ritmo.',
  },
  longBreak: {
    label: 'Pausa longa',
    minutes: 15,
    description: 'Recarregue depois de quatro sessões de foco.',
  },
};

function loadSessions(): Session[] {
  if (typeof window === 'undefined') return [];

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((session) => (
        session &&
        typeof session.duration === 'number' &&
        typeof session.completedAt === 'string'
      ))
      .map((session) => ({
        duration: session.duration,
        completedAt: session.completedAt,
        mode: session.mode === 'shortBreak' || session.mode === 'longBreak' ? session.mode : 'focus',
      }))
      .slice(0, 20);
  } catch {
    return [];
  }
}

export function Timer({ onComplete }: TimerProps) {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [focusCycles, setFocusCycles] = useState(0);
  const [timeLeft, setTimeLeft] = useState(modeConfig.focus.minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState<Session[]>(loadSessions);
  const intervalRef = useRef<number | null>(null);

  const currentMode = modeConfig[mode];
  const totalSeconds = currentMode.minutes * 60;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    }
  }, [sessions]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    document.title = isRunning
      ? `${formatTime(timeLeft)} - ${currentMode.label} - FocoTotal`
      : `${currentMode.label} - FocoTotal`;
  }, [currentMode.label, isRunning, timeLeft]);

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

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        toggleTimer();
      }
      if (e.code === 'KeyR' && e.target === document.body) {
        e.preventDefault();
        resetTimer();
      }
      if (e.code === 'KeyN' && e.target === document.body) {
        e.preventDefault();
        skipToNextMode();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isRunning, mode, timeLeft]);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) {
      return;
    }

    intervalRef.current = window.setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          completeCurrentSession();
          return 0;
        }

        return prevTime - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, timeLeft, mode]);

  const todayFocusMinutes = useMemo(() => {
    const today = new Date().toDateString();
    return sessions
      .filter((session) => new Date(session.completedAt).toDateString() === today)
      .reduce((total, session) => total + session.duration, 0);
  }, [sessions]);

  const totalStudyTime = sessions.reduce((acc, session) => acc + session.duration, 0);
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  const switchMode = (nextMode: TimerMode) => {
    setMode(nextMode);
    setTimeLeft(modeConfig[nextMode].minutes * 60);
    setIsRunning(false);
  };

  const getNextMode = (completedMode: TimerMode, nextFocusCycles = focusCycles) => {
    if (completedMode !== 'focus') return 'focus';
    return nextFocusCycles > 0 && nextFocusCycles % 4 === 0 ? 'longBreak' : 'shortBreak';
  };

  const completeCurrentSession = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsRunning(false);

    const nextFocusCycles = mode === 'focus' ? focusCycles + 1 : focusCycles;
    if (mode === 'focus') {
      setFocusCycles(nextFocusCycles);
    }

    const newSession: Session = {
      duration: currentMode.minutes,
      completedAt: new Date().toISOString(),
      mode,
    };
    setSessions((prev) => [newSession, ...prev].slice(0, 20));
    playNotificationSound(mode);
    celebrate(mode);

    const nextMode = getNextMode(mode, nextFocusCycles);
    setMode(nextMode);
    setTimeLeft(modeConfig[nextMode].minutes * 60);

    if (onComplete) {
      onComplete();
    }
  };

  const playNotificationSound = (completedMode: TimerMode) => {
    try {
      const audioWindow = window as AudioWindow;
      const AudioContextClass = globalThis.AudioContext || audioWindow.webkitAudioContext;
      if (AudioContextClass) {
        const audioContext = new AudioContextClass();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = completedMode === 'focus' ? 880 : 660;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.45);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.45);
      }
    } catch {
      // Audio can fail when the browser blocks sound before user interaction.
    }

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('FocoTotal', {
        body: mode === 'focus' ? 'Sessão de foco concluída. Hora de pausar.' : 'Pausa concluída. Vamos voltar ao foco.',
        icon: '/favicon.ico',
        tag: 'focototal-timer',
      });
    }
  };

  const celebrate = (completedMode: TimerMode) => {
    if (completedMode !== 'focus') return;

    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#0ea5e9', '#06b6d4', '#14b8a6'],
    });
  };

  const toggleTimer = () => {
    if (timeLeft === 0) {
      setTimeLeft(totalSeconds);
    }
    setIsRunning((current) => !current);
  };

  const resetTimer = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    setTimeLeft(totalSeconds);
  };

  const skipToNextMode = () => {
    const nextMode = getNextMode(mode);
    switchMode(nextMode);
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
      minute: '2-digit',
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_0.85fr] gap-6 items-start">
      <div className="bg-card border border-border rounded-lg p-6 sm:p-8">
        <div className="flex flex-wrap gap-2 mb-8">
          {(['focus', 'shortBreak', 'longBreak'] as TimerMode[]).map((timerMode) => {
            const Icon = timerMode === 'focus' ? Focus : Coffee;

            return (
              <button
                key={timerMode}
                onClick={() => switchMode(timerMode)}
                disabled={isRunning}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all font-medium ${
                  mode === timerMode
                    ? 'bg-primary text-white shadow-lg shadow-primary/40'
                    : 'bg-secondary text-foreground hover:bg-secondary/80 border border-border'
                } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Icon size={18} />
                {modeConfig[timerMode].label}
              </button>
            );
          })}
        </div>

        <div className="text-center mb-8">
          <p className="text-sm text-muted-foreground mb-2">{currentMode.description}</p>
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 288 288">
              <circle
                cx="144"
                cy="144"
                r="124"
                stroke="currentColor"
                strokeWidth="10"
                fill="none"
                className="text-muted"
              />
              <circle
                cx="144"
                cy="144"
                r="124"
                stroke="currentColor"
                strokeWidth="10"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 124}`}
                strokeDashoffset={`${2 * Math.PI * 124 * (1 - progress / 100)}`}
                className="text-primary transition-all duration-300"
                strokeLinecap="round"
              />
            </svg>
            <div>
              <div className="text-5xl sm:text-6xl font-bold text-foreground">{formatTime(timeLeft)}</div>
              <div className="text-sm text-muted-foreground mt-3">{currentMode.label}</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={toggleTimer}
            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-primary text-white rounded-lg hover:opacity-90 transition-all shadow-lg shadow-primary/50 font-medium"
          >
            {isRunning ? <Pause size={22} /> : <Play size={22} />}
            {isRunning ? 'Pausar' : timeLeft === 0 ? 'Reiniciar' : 'Iniciar'}
          </button>
          <button
            onClick={resetTimer}
            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-all border border-border font-medium"
          >
            <RotateCcw size={22} />
            Resetar
          </button>
          <button
            onClick={skipToNextMode}
            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-all border border-border font-medium"
          >
            <SkipForward size={22} />
            Próximo
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <Clock size={18} className="text-primary" />
            Resumo
          </h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-secondary/60 border border-border rounded-lg p-3">
              <div className="text-2xl font-bold text-primary">{focusCycles}</div>
              <div className="text-xs text-muted-foreground mt-1">ciclos</div>
            </div>
            <div className="bg-secondary/60 border border-border rounded-lg p-3">
              <div className="text-2xl font-bold">{todayFocusMinutes}</div>
              <div className="text-xs text-muted-foreground mt-1">min hoje</div>
            </div>
            <div className="bg-secondary/60 border border-border rounded-lg p-3">
              <div className="text-2xl font-bold">{totalStudyTime}</div>
              <div className="text-xs text-muted-foreground mt-1">min totais</div>
            </div>
          </div>

          <div className="bg-secondary/50 border border-border rounded-lg p-4 mt-4">
            <div className="flex flex-wrap gap-4 justify-center text-xs text-muted-foreground">
              <span><kbd className="px-2 py-1 bg-card border border-border rounded">Espaço</kbd> iniciar/pausar</span>
              <span><kbd className="px-2 py-1 bg-card border border-border rounded">R</kbd> resetar</span>
              <span><kbd className="px-2 py-1 bg-card border border-border rounded">N</kbd> próximo</span>
            </div>
          </div>
        </div>

        {sessions.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Clock size={18} className="text-primary" />
                Histórico
              </h3>
              <div className="text-sm text-muted-foreground">
                {sessions.length} sessão{sessions.length !== 1 ? 'ões' : ''}
              </div>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {sessions.map((session, index) => (
                <div
                  key={`${session.completedAt}-${index}`}
                  className="flex items-center justify-between p-3 bg-secondary rounded-md"
                >
                  <div>
                    <div className="text-sm font-medium">{modeConfig[session.mode].label}</div>
                    <div className="text-xs text-muted-foreground">{session.duration} minutos</div>
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
    </div>
  );
}
