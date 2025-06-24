import { useState, useEffect, useRef } from "react";

interface TimerProps {
  isOpen: boolean;
  onClose: () => void;
  clockIcon: string;
}

export function Timer({ isOpen, onClose, clockIcon }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'pomodoro' | 'shortBreak' | 'longBreak'>('pomodoro');
  const [position, setPosition] = useState({ x: 40, y: 100 });
  const [size, setSize] = useState({ width: 280, height: 420 });
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string>('');
  const [rel, setRel] = useState({ x: 0, y: 0 });
  const [sessionCount, setSessionCount] = useState(0);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [autoProgress, setAutoProgress] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [targetSessions, setTargetSessions] = useState(4);
  const [customTimeSettings, setCustomTimeSettings] = useState({
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15
  });
  const timerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Convert minutes to seconds for timer
  const timeSettings = {
    pomodoro: customTimeSettings.pomodoro * 60,
    shortBreak: customTimeSettings.shortBreak * 60,
    longBreak: customTimeSettings.longBreak * 60
  };

  // Function to play notification sound
  const playNotificationSound = () => {
    try {
      // Create audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Play first sound
      playSingleBeep(audioContext, 0);
      // Play second sound after 0.5 seconds
      playSingleBeep(audioContext, 0.5);
      
    } catch (error) {
      console.warn("Could not play notification sound:", error);
    }
  };

  // Helper function to play a single beep
  const playSingleBeep = (audioContext: AudioContext, startTime: number) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configure sound - back to original simple beep
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + startTime); // 800Hz tone
    oscillator.type = 'sine';
    
    // Configure volume envelope
    gainNode.gain.setValueAtTime(0, audioContext.currentTime + startTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + startTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + startTime + 0.5);
    
    // Play the sound
    oscillator.start(audioContext.currentTime + startTime);
    oscillator.stop(audioContext.currentTime + startTime + 0.5);
  };

  // Function to automatically progress to next session
  const progressToNextSession = () => {
    if (!autoProgress) return;

    if (mode === 'pomodoro') {
      setCompletedPomodoros(prev => prev + 1);
      // After targetSessions pomodoros, take a long break, otherwise short break
      if ((completedPomodoros + 1) % targetSessions === 0) {
        setMode('longBreak');
        setTimeLeft(timeSettings.longBreak);
      } else {
        setMode('shortBreak');
        setTimeLeft(timeSettings.shortBreak);
      }
    } else {
      // After break, go back to pomodoro
      setMode('pomodoro');
      setTimeLeft(timeSettings.pomodoro);
      setSessionCount(prev => prev + 1);
    }
    
    // Auto-start the next session
    setIsRunning(true);
  };

  // Update timeLeft when custom settings change
  useEffect(() => {
    setTimeLeft(timeSettings[mode]);
  }, [customTimeSettings, mode]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            // Play notification sound when timer ends
            playNotificationSound();
            
            if (autoProgress) {
              // Use setTimeout to allow state updates to complete
              setTimeout(() => {
                progressToNextSession();
              }, 100);
            } else {
              // Reset to current mode time if auto-progress is disabled
              return timeSettings[mode];
            }
            return prev; // Return current value while transitioning
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, mode, timeSettings, autoProgress, completedPomodoros, targetSessions]);

  // Clamp position utility
  function clampPosition(pos: {x: number, y: number}, size: {width: number, height: number}) {
    const maxX = window.innerWidth - size.width;
    const maxY = window.innerHeight - size.height;
    return {
      x: Math.max(0, Math.min(pos.x, maxX)),
      y: Math.max(0, Math.min(pos.y, maxY)),
    };
  }

  // Drag and resize logic
  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (dragging) {
        setPosition(clampPosition({ x: e.clientX - rel.x, y: e.clientY - rel.y }, size));
      } else if (resizing) {
        const newSize = { ...size };
        const newPosition = { ...position };
        
        if (resizeDirection.includes('e')) {
          newSize.width = Math.max(240, e.clientX - position.x);
        }
        if (resizeDirection.includes('w')) {
          const newWidth = Math.max(240, position.x + size.width - e.clientX);
          newSize.width = newWidth;
          newPosition.x = e.clientX;
        }
        if (resizeDirection.includes('s')) {
          newSize.height = Math.max(300, e.clientY - position.y);
        }
        if (resizeDirection.includes('n')) {
          const newHeight = Math.max(300, position.y + size.height - e.clientY);
          newSize.height = newHeight;
          newPosition.y = e.clientY;
        }
        
        setSize(newSize);
        setPosition(clampPosition(newPosition, newSize));
      }
    }
    
    function onMouseUp() {
      setDragging(false);
      setResizing(false);
      setResizeDirection('');
    }
    
    if (dragging || resizing) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    } else {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragging, resizing, resizeDirection, rel, size, position]);

  // Add window resize effect to keep panel in view
  useEffect(() => {
    function handleResize() {
      setPosition(prev => clampPosition(prev, size));
      setSize(prev => ({
        width: Math.min(prev.width, window.innerWidth),
        height: Math.min(prev.height, window.innerHeight)
      }));
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [size]);

  const onDragStart = (e: React.MouseEvent) => {
    if (!timerRef.current) return;
    setDragging(true);
    const rect = timerRef.current.getBoundingClientRect();
    setRel({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    e.preventDefault();
  };

  const onResizeStart = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    setResizing(true);
    setResizeDirection(direction);
    e.preventDefault();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => setIsRunning(true);
  const pauseTimer = () => setIsRunning(false);
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(timeSettings[mode]);
  };
  
  const switchMode = (newMode: 'pomodoro' | 'shortBreak' | 'longBreak') => {
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(timeSettings[newMode]);
  };

  const resetSessions = () => {
    setSessionCount(0);
    setCompletedPomodoros(0);
    setMode('pomodoro');
    setTimeLeft(timeSettings.pomodoro);
    setIsRunning(false);
  };

  const handleTimeSettingChange = (setting: keyof typeof customTimeSettings, value: string) => {
    const numValue = parseInt(value) || 0;
    if (numValue >= 0 && numValue <= 999) {
      setCustomTimeSettings(prev => ({
        ...prev,
        [setting]: numValue
      }));
    }
  };

  const handleTargetSessionsChange = (value: string) => {
    const numValue = parseInt(value) || 1;
    if (numValue >= 1 && numValue <= 99) {
      setTargetSessions(numValue);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Hidden audio element for notification sound */}
      <audio ref={audioRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT" type="audio/wav" />
      </audio>

      <div
        ref={timerRef}
        className="fixed z-50 rounded-2xl shadow-2xl select-none cursor-move bg-white/30 backdrop-blur-md border border-white/20"
        style={{ 
          left: position.x, 
          top: position.y, 
          width: size.width, 
          height: size.height,
          minWidth: '240px',
          minHeight: '300px',
          color: '#4A2C2A'
        }}
        onMouseDown={onDragStart}
      >
        {/* Resize handles */}
        <div 
          className="absolute top-0 left-0 w-4 h-4 cursor-nwse-resize z-40"
          onMouseDown={(e) => onResizeStart(e, 'nw')}
        />
        <div 
          className="absolute top-0 right-0 w-4 h-4 cursor-nesw-resize z-40"
          onMouseDown={(e) => onResizeStart(e, 'ne')}
        />
        <div 
          className="absolute bottom-0 left-0 w-4 h-4 cursor-nesw-resize z-40"
          onMouseDown={(e) => onResizeStart(e, 'sw')}
        />
        <div 
          className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-40"
          onMouseDown={(e) => onResizeStart(e, 'se')}
        />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col p-5">
          {/* Header with close and settings */}
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={e => { e.stopPropagation(); setShowSettings(!showSettings); }}
              className="w-8 h-8 flex items-center justify-center text-xl text-[#4A2C2A]/70 hover:text-[#db8b44] hover:bg-black/10 rounded-full transition-colors z-20"
              style={{ pointerEvents: 'auto' }}
              title="Settings"
            >⚙️</button>
            
            {size.width >= 270 && (
              <div className="flex items-center gap-2">
                <img src={clockIcon} alt="clock" className="w-6 h-6" />
                <span className="text-lg font-semibold">Pomodoro Timer</span>
              </div>
            )}
            
            <button
              onClick={e => { e.stopPropagation(); onClose(); }}
              className="w-8 h-8 flex items-center justify-center text-2xl text-[#4A2C2A]/70 hover:text-[#db8b44] hover:bg-black/10 rounded-full transition-colors z-20"
              style={{ pointerEvents: 'auto' }}
            >×
            </button>
          </div>
          
          {/* Session Progress */}
          {size.height >= 380 && (
            <div className="text-center mb-4 p-3 bg-black/5 rounded-lg">
              <div className="text-sm font-medium text-[#4A2C2A] mb-2">
                <span>Session {sessionCount + 1}</span>
                <span className="mx-2">•</span>
                <span>{completedPomodoros}/{targetSessions} done</span>
              </div>
              <div className="w-full bg-black/10 rounded-full h-2.5">
                <div 
                  className="bg-[#db8b44] h-2.5 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(completedPomodoros / targetSessions) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {showSettings ? (
            <div className="mb-4 p-4 rounded-lg bg-black/5 flex-1">
              <div className="text-md font-semibold text-[#4A2C2A] mb-3 text-center">Timer Settings</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold mb-1 block">Work (min)</label>
                  <input
                    type="number"
                    value={customTimeSettings.pomodoro}
                    onChange={(e) => handleTimeSettingChange('pomodoro', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm rounded-md border-none bg-white/50 focus:outline-none focus:ring-2 focus:ring-[#db8b44]"
                    min="1"
                    max="999"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                  />
                </div>
                
                <div>
                  <label className="text-xs font-bold mb-1 block">Short Break (min)</label>
                  <input
                    type="number"
                    value={customTimeSettings.shortBreak}
                    onChange={(e) => handleTimeSettingChange('shortBreak', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm rounded-md border-none bg-white/50 focus:outline-none focus:ring-2 focus:ring-[#db8b44]"
                    min="0"
                    max="999"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                  />
                </div>
                
                <div>
                  <label className="text-xs font-bold mb-1 block">Long Break (min)</label>
                  <input
                    type="number"
                    value={customTimeSettings.longBreak}
                    onChange={(e) => handleTimeSettingChange('longBreak', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm rounded-md border-none bg-white/50 focus:outline-none focus:ring-2 focus:ring-[#db8b44]"
                    min="0"
                    max="999"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                  />
                </div>
                
                <div>
                  <label className="text-xs font-bold mb-1 block">Sessions</label>
                  <input
                    type="number"
                    value={targetSessions}
                    onChange={(e) => handleTargetSessionsChange(e.target.value)}
                    className="w-full px-2 py-1.5 text-sm rounded-md border-none bg-white/50 focus:outline-none focus:ring-2 focus:ring-[#db8b44]"
                    min="1"
                    max="99"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
              
              <div className="mt-4 flex justify-center">
                <button
                  onClick={e => { e.stopPropagation(); setAutoProgress(!autoProgress); }}
                  className={`px-4 py-2 rounded-md text-sm font-bold transition-all duration-300 w-full ${autoProgress ? 'bg-[#db8b44] text-white shadow-md' : 'bg-black/10 text-[#4A2C2A]/80 hover:bg-black/20'}`}
                  style={{ pointerEvents: 'auto' }}
                  title="Auto-progress to next session"
                >
                  {autoProgress ? 'Auto Progress: ON' : 'Auto Progress: OFF'}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Mode Selection */}
              <div className="flex justify-center mb-6">
                <div className="flex bg-black/10 rounded-full p-1">
                  <button
                    onClick={e => { e.stopPropagation(); switchMode('pomodoro'); }}
                    className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${mode === 'pomodoro' ? 'bg-white/80 text-[#db8b44] shadow-sm' : 'text-[#4A2C2A]/70 hover:bg-white/30'}`}
                    style={{ pointerEvents: 'auto' }}
                  >Focus</button>
                  <button
                    onClick={e => { e.stopPropagation(); switchMode('shortBreak'); }}
                    className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${mode === 'shortBreak' ? 'bg-white/80 text-[#db8b44] shadow-sm' : 'text-[#4A2C2A]/70 hover:bg-white/30'}`}
                    style={{ pointerEvents: 'auto' }}
                  >Short</button>
                  <button
                    onClick={e => { e.stopPropagation(); switchMode('longBreak'); }}
                    className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${mode === 'longBreak' ? 'bg-white/80 text-[#db8b44] shadow-sm' : 'text-[#4A2C2A]/70 hover:bg-white/30'}`}
                    style={{ pointerEvents: 'auto' }}
                  >Long</button>
                </div>
              </div>
              
              {/* Timer Display */}
              <div className="text-center mb-6 flex-1 flex flex-col justify-center items-center">
                <div className="text-7xl font-sans font-bold mb-1" style={{ color: '#4A2C2A' }}>
                  {formatTime(timeLeft)}
                </div>
                {size.height >= 340 && (
                  <div className="text-lg font-medium tracking-wider" style={{ color: '#db8b44' }}>
                    {mode === 'pomodoro' && 'FOCUS'}
                    {mode === 'shortBreak' && 'SHORT BREAK'}
                    {mode === 'longBreak' && 'LONG BREAK'}
                  </div>
                )}
              </div>
              
              {/* Control Buttons */}
              <div className="flex gap-4 justify-center items-center mb-4">
                <button
                  onClick={e => { e.stopPropagation(); resetTimer(); }}
                  className="w-12 h-12 flex items-center justify-center rounded-full font-bold text-lg bg-black/10 text-[#4A2C2A]/80 hover:bg-black/20 transition-colors shadow-sm"
                  style={{ pointerEvents: 'auto' }}
                  title="Reset Timer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                </button>
                
                {!isRunning ? (
                  <button
                    onClick={e => { e.stopPropagation(); startTimer(); }}
                    className="w-24 h-24 flex items-center justify-center rounded-full font-bold text-2xl bg-[#db8b44] text-white hover:bg-[#c57a3d] transition-all duration-300 shadow-lg transform hover:scale-105"
                    style={{ pointerEvents: 'auto' }}
                  >START</button>
                ) : (
                  <button
                    onClick={e => { e.stopPropagation(); pauseTimer(); }}
                    className="w-24 h-24 flex items-center justify-center rounded-full font-bold text-2xl bg-[#db8b44] text-white hover:bg-[#c57a3d] transition-all duration-300 shadow-lg transform hover:scale-105"
                    style={{ pointerEvents: 'auto' }}
                  >PAUSE</button>
                )}
    
                <button
                  onClick={e => { e.stopPropagation(); resetSessions(); }}
                  className="w-12 h-12 flex items-center justify-center rounded-full font-bold text-lg bg-black/10 text-[#4A2C2A]/80 hover:bg-black/20 transition-colors shadow-sm"
                  style={{ pointerEvents: 'auto' }}
                  title="Reset all sessions"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v6h6"/><path d="M21 12A9 9 0 0 0 6 5.3L3 8"/><path d="M21 22v-6h-6"/><path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"/></svg>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
} 