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
  const [size, setSize] = useState({ width: 280, height: 320 }); // Increased size for settings
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

  // Drag and resize logic
  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (dragging) {
        setPosition({
          x: e.clientX - rel.x,
          y: e.clientY - rel.y,
        });
      } else if (resizing) {
        const newSize = { ...size };
        const newPosition = { ...position };
        
        if (resizeDirection.includes('e')) {
          newSize.width = Math.max(280, e.clientX - position.x);
        }
        if (resizeDirection.includes('w')) {
          const newWidth = Math.max(280, position.x + size.width - e.clientX);
          newSize.width = newWidth;
          newPosition.x = e.clientX;
        }
        if (resizeDirection.includes('s')) {
          newSize.height = Math.max(260, e.clientY - position.y);
        }
        if (resizeDirection.includes('n')) {
          const newHeight = Math.max(260, position.y + size.height - e.clientY);
          newSize.height = newHeight;
          newPosition.y = e.clientY;
        }
        
        setSize(newSize);
        setPosition(newPosition);
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
        className="fixed z-50 rounded-xl shadow-lg p-3 select-none cursor-move"
        style={{ 
          left: position.x, 
          top: position.y, 
          width: size.width, 
          height: size.height,
          background: '#F8EBD9', 
          border: '2px solid #db8b44',
          minWidth: '280px',
          minHeight: '260px'
        }}
        onMouseDown={onDragStart}
      >
        {/* Resize handles */}
        <div 
          className="absolute top-0 left-0 w-8 h-8 cursor-nw-resize z-40"
          onMouseDown={(e) => onResizeStart(e, 'nw')}
        />
        <div 
          className="absolute top-0 right-0 w-8 h-8 cursor-ne-resize z-40"
          onMouseDown={(e) => onResizeStart(e, 'ne')}
        />
        <div 
          className="absolute bottom-0 left-0 w-8 h-8 cursor-sw-resize z-40"
          onMouseDown={(e) => onResizeStart(e, 'sw')}
        />
        <div 
          className="absolute bottom-0 right-0 w-8 h-8 cursor-se-resize z-40"
          onMouseDown={(e) => onResizeStart(e, 'se')}
        />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col">
          {/* Header with close and settings */}
          <div className="flex justify-between items-center mb-3">
            <button
              onClick={e => { e.stopPropagation(); setShowSettings(!showSettings); }}
              className="w-8 h-8 flex items-center justify-center text-[#4A2C2A] hover:text-[#db8b44] text-lg font-bold bg-[#F8EBD9] rounded-full hover:bg-[#db8b44] hover:text-white transition-colors z-20 border border-[#db8b44] border-opacity-30"
              style={{ pointerEvents: 'auto' }}
              title="Settings"
            >⚙</button>
            
            <div className="flex items-center gap-2">
              <img src={clockIcon} alt="clock" className="w-8 h-8" />
              <span className="text-lg font-bold text-[#4A2C2A]">Pomodoro Timer</span>
            </div>
            
            <button
              onClick={e => { e.stopPropagation(); onClose(); }}
              className="w-8 h-8 flex items-center justify-center text-[#4A2C2A] hover:text-[#db8b44] text-lg font-bold bg-[#F8EBD9] rounded-full hover:bg-[#db8b44] hover:text-white transition-colors z-20"
              style={{ pointerEvents: 'auto' }}
            >×</button>
          </div>
          
          {/* Session Progress */}
          <div className="text-center mb-4 p-3 bg-white/50 rounded-lg border border-[#db8b44] border-opacity-30">
            <div className="text-sm font-bold text-[#4A2C2A] mb-1">
              Session {sessionCount + 1} • {completedPomodoros}/{targetSessions} completed
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-[#db8b44] h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completedPomodoros / targetSessions) * 100}%` }}
              ></div>
            </div>
          </div>
          
          {/* Settings Panel */}
          {showSettings && (
            <div className="mb-4 p-4 rounded-lg bg-white/80 border border-[#db8b44] border-opacity-30">
              <div className="text-sm font-bold text-[#4A2C2A] mb-3 text-center">Timer Settings</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs font-bold mb-1" style={{ color: '#4A2C2A' }}>
                    Work (min)
                  </div>
                  <input
                    type="number"
                    value={customTimeSettings.pomodoro}
                    onChange={(e) => handleTimeSettingChange('pomodoro', e.target.value)}
                    className="w-full px-2 py-1 text-sm rounded border-2 border-[#db8b44] bg-white focus:outline-none focus:border-[#4A2C2A]"
                    min="1"
                    max="999"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                  />
                </div>
                
                <div>
                  <div className="text-xs font-bold mb-1" style={{ color: '#4A2C2A' }}>
                    Short Break (min)
                  </div>
                  <input
                    type="number"
                    value={customTimeSettings.shortBreak}
                    onChange={(e) => handleTimeSettingChange('shortBreak', e.target.value)}
                    className="w-full px-2 py-1 text-sm rounded border-2 border-[#db8b44] bg-white focus:outline-none focus:border-[#4A2C2A]"
                    min="0"
                    max="999"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                  />
                </div>
                
                <div>
                  <div className="text-xs font-bold mb-1" style={{ color: '#4A2C2A' }}>
                    Long Break (min)
                  </div>
                  <input
                    type="number"
                    value={customTimeSettings.longBreak}
                    onChange={(e) => handleTimeSettingChange('longBreak', e.target.value)}
                    className="w-full px-2 py-1 text-sm rounded border-2 border-[#db8b44] bg-white focus:outline-none focus:border-[#4A2C2A]"
                    min="0"
                    max="999"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                  />
                </div>
                
                <div>
                  <div className="text-xs font-bold mb-1" style={{ color: '#4A2C2A' }}>
                    Sessions
                  </div>
                  <input
                    type="number"
                    value={targetSessions}
                    onChange={(e) => handleTargetSessionsChange(e.target.value)}
                    className="w-full px-2 py-1 text-sm rounded border-2 border-[#db8b44] bg-white focus:outline-none focus:border-[#4A2C2A]"
                    min="1"
                    max="99"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
              
              <div className="mt-3 flex justify-center">
                <button
                  onClick={e => { e.stopPropagation(); setAutoProgress(!autoProgress); }}
                  className={`px-4 py-2 rounded text-sm font-bold transition-colors ${autoProgress ? 'bg-[#db8b44] text-white' : 'bg-[#4A2C2A] text-[#F8EBD9] hover:bg-[#db8b44] hover:text-white'}`}
                  style={{ pointerEvents: 'auto' }}
                  title="Auto-progress to next session"
                >
                  {autoProgress ? '✓ Auto Progress' : '✗ Manual Progress'}
                </button>
              </div>
            </div>
          )}
          
          {/* Mode Selection */}
          <div className="flex justify-center mb-4">
            <div className="flex bg-[#4A2C2A] rounded-lg p-1">
              <button
                onClick={e => { e.stopPropagation(); switchMode('pomodoro'); }}
                className={`px-4 py-2 rounded text-sm font-bold transition-colors ${mode === 'pomodoro' ? 'bg-[#db8b44] text-white' : 'text-[#F8EBD9] hover:text-[#db8b44]'}`}
                style={{ pointerEvents: 'auto' }}
              >Focus</button>
              <button
                onClick={e => { e.stopPropagation(); switchMode('shortBreak'); }}
                className={`px-4 py-2 rounded text-sm font-bold transition-colors ${mode === 'shortBreak' ? 'bg-[#db8b44] text-white' : 'text-[#F8EBD9] hover:text-[#db8b44]'}`}
                style={{ pointerEvents: 'auto' }}
              >Short</button>
              <button
                onClick={e => { e.stopPropagation(); switchMode('longBreak'); }}
                className={`px-4 py-2 rounded text-sm font-bold transition-colors ${mode === 'longBreak' ? 'bg-[#db8b44] text-white' : 'text-[#F8EBD9] hover:text-[#db8b44]'}`}
                style={{ pointerEvents: 'auto' }}
              >Long</button>
            </div>
          </div>
          
          {/* Timer Display */}
          <div className="text-center mb-6 flex-1 flex flex-col justify-center">
            <div className="text-5xl font-mono font-bold mb-2" style={{ color: '#4A2C2A' }}>
              {formatTime(timeLeft)}
            </div>
            <div className="text-lg font-semibold" style={{ color: '#db8b44' }}>
              {mode === 'pomodoro' && 'Focus Time'}
              {mode === 'shortBreak' && 'Short Break'}
              {mode === 'longBreak' && 'Long Break'}
            </div>
          </div>
          
          {/* Control Buttons */}
          <div className="flex gap-3 justify-center mb-4">
            {!isRunning ? (
              <button
                onClick={e => { e.stopPropagation(); startTimer(); }}
                className="px-6 py-3 rounded-lg font-bold text-base bg-[#db8b44] text-white hover:bg-[#4A2C2A] hover:text-[#F8EBD9] transition-colors shadow-md"
                style={{ pointerEvents: 'auto' }}
              >Start</button>
            ) : (
              <button
                onClick={e => { e.stopPropagation(); pauseTimer(); }}
                className="px-6 py-3 rounded-lg font-bold text-base bg-[#db8b44] text-white hover:bg-[#4A2C2A] hover:text-[#F8EBD9] transition-colors shadow-md"
                style={{ pointerEvents: 'auto' }}
              >Pause</button>
            )}
            <button
              onClick={e => { e.stopPropagation(); resetTimer(); }}
              className="px-6 py-3 rounded-lg font-bold text-base bg-[#4A2C2A] text-[#F8EBD9] hover:bg-[#db8b44] hover:text-white transition-colors shadow-md"
              style={{ pointerEvents: 'auto' }}
            >Reset</button>
          </div>
          
          {/* Reset All Button */}
          <div className="flex justify-center">
            <button
              onClick={e => { e.stopPropagation(); resetSessions(); }}
              className="px-4 py-2 rounded-lg font-bold text-sm bg-gray-500 text-white hover:bg-gray-600 transition-colors"
              style={{ pointerEvents: 'auto' }}
              title="Reset all sessions"
            >Reset All Sessions</button>
          </div>
        </div>
      </div>
    </>
  );
} 