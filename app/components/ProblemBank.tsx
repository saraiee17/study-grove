import { useState, useRef, useEffect } from 'react';

interface ProblemBankProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProblemBank({ isOpen, onClose }: ProblemBankProps) {
  const [problemCount, setProblemCount] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(50);
  const [longTermGoal, setLongTermGoal] = useState(1000);
  const [longTermCount, setLongTermCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [viewMode, setViewMode] = useState<'daily' | 'longTerm'>('daily');
  const [categories, setCategories] = useState({
    easy: 0,
    medium: 0,
    hard: 0
  });

  // Position and size state
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [size, setSize] = useState({ width: 320, height: 480 });
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string>('');
  const [rel, setRel] = useState({ x: 0, y: 0 });
  
  const problemBankRef = useRef<HTMLDivElement>(null);

  // Calculate progress percentage based on current view mode
  const currentCount = viewMode === 'daily' ? problemCount : longTermCount;
  const currentGoal = viewMode === 'daily' ? dailyGoal : longTermGoal;
  const progress = Math.min((currentCount / currentGoal) * 100, 100);
  
  // Calculate the circle's circumference
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Drag and resize logic
  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (dragging) {
        setPosition(clampPosition({ x: e.clientX - rel.x, y: e.clientY - rel.y }, size));
      } else if (resizing) {
        const newSize = { ...size };
        const newPosition = { ...position };
        
        if (resizeDirection.includes('e')) {
          newSize.width = Math.max(220, e.clientX - position.x);
        }
        if (resizeDirection.includes('w')) {
          const newWidth = Math.max(220, position.x + size.width - e.clientX);
          newSize.width = newWidth;
          newPosition.x = e.clientX;
        }
        if (resizeDirection.includes('s')) {
          newSize.height = Math.max(360, e.clientY - position.y);
        }
        if (resizeDirection.includes('n')) {
          const newHeight = Math.max(360, position.y + size.height - e.clientY);
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
    }
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragging, resizing, resizeDirection, rel, size, position]);

  const onDragStart = (e: React.MouseEvent) => {
    if (!problemBankRef.current) return;
    setDragging(true);
    const rect = problemBankRef.current.getBoundingClientRect();
    setRel({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    e.preventDefault();
  };

  const onResizeStart = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    setResizing(true);
    setResizeDirection(direction);
    e.preventDefault();
  };

  const handleAddProblem = (difficulty: 'easy' | 'medium' | 'hard') => {
    setProblemCount(prev => prev + 1);
    setLongTermCount(prev => prev + 1);
    setCategories(prev => ({
      ...prev,
      [difficulty]: prev[difficulty] + 1
    }));
  };

  const handleRemoveProblem = (difficulty: 'easy' | 'medium' | 'hard') => {
    setCategories(prev => ({
      ...prev,
      [difficulty]: Math.max(0, prev[difficulty] - 1)
    }));
    setProblemCount(prev => Math.max(0, prev - 1));
    setLongTermCount(prev => Math.max(0, prev - 1));
  };

  const handleClear = () => {
    setProblemCount(0);
    setCategories({
      easy: 0,
      medium: 0,
      hard: 0
    });
  };

  const handleClearLongTerm = () => {
    setLongTermCount(0);
  };

  const handleGoalUpdate = (type: 'daily' | 'longTerm', value: number) => {
    console.log('handleGoalUpdate called:', type, value);
    if (type === 'daily') {
      setDailyGoal(Math.max(1, value));
    } else {
      setLongTermGoal(Math.max(1, value));
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('studygrove-problem-bank');
    if (saved) {
      const data = JSON.parse(saved);
      setProblemCount(data.problemCount ?? 0);
      setDailyGoal(data.dailyGoal ?? 50);
      setLongTermGoal(data.longTermGoal ?? 1000);
      setLongTermCount(data.longTermCount ?? 0);
      setCategories(data.categories ?? { easy: 0, medium: 0, hard: 0 });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('studygrove-problem-bank', JSON.stringify({
      problemCount,
      dailyGoal,
      longTermGoal,
      longTermCount,
      categories
    }));
  }, [problemCount, dailyGoal, longTermGoal, longTermCount, categories]);

  function clampPosition(pos: {x: number, y: number}, size: {width: number, height: number}) {
    const maxX = window.innerWidth - size.width;
    const maxY = window.innerHeight - size.height;
    return {
      x: Math.max(0, Math.min(pos.x, maxX)),
      y: Math.max(0, Math.min(pos.y, maxY)),
    };
  }

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

  if (!isOpen) return null;

  return (
    <div
      ref={problemBankRef}
      className="fixed z-50 rounded-2xl shadow-2xl select-none cursor-move bg-white/30 backdrop-blur-md border border-white/20"
      style={{ 
        left: position.x, 
        top: position.y, 
        width: size.width, 
        height: size.height,
        minWidth: '220px',
        minHeight: '360px',
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

      {/* Content Container */}
      <div className="p-5 h-full flex flex-col">
        {/* Header with close and settings buttons */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={(e) => { e.stopPropagation(); setShowSettings(true); }}
            className="w-8 h-8 flex items-center justify-center text-xl text-[#4A2C2A]/70 hover:text-[#db8b44] hover:bg-black/10 rounded-full transition-colors z-20"
            style={{ pointerEvents: 'auto' }}
            title="Settings"
          >
            ⚙️
          </button>
          <span className="text-xl font-semibold">Problem Bank</span>
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="w-8 h-8 flex items-center justify-center text-2xl text-[#4A2C2A]/70 hover:text-[#db8b44] hover:bg-black/10 rounded-full transition-colors z-20"
            style={{ pointerEvents: 'auto' }}
          >
            ×
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className="flex justify-center mb-4">
           <div className="flex bg-black/10 rounded-full p-1">
            <button
              onClick={(e) => { e.stopPropagation(); setViewMode('daily'); }}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${viewMode === 'daily' ? 'bg-white/80 text-[#db8b44] shadow-sm' : 'text-[#4A2C2A]/70 hover:bg-white/30'}`}
              style={{ pointerEvents: 'auto' }}
            >
              Daily
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setViewMode('longTerm'); }}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${viewMode === 'longTerm' ? 'bg-white/80 text-[#db8b44] shadow-sm' : 'text-[#4A2C2A]/70 hover:bg-white/30'}`}
              style={{ pointerEvents: 'auto' }}
            >
              Long Term
            </button>
          </div>
        </div>

        {/* Progress Circle */}
        <div className="relative w-48 h-48 mx-auto my-4 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="rgba(0,0,0,0.1)"
              strokeWidth="16"
            />
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="#db8b44"
              strokeWidth="16"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <div className="text-4xl font-bold">{currentCount}</div>
            <div className="text-sm font-medium opacity-75 -mt-1">
              {viewMode === 'daily' ? 'Today' : 'Total'} Solved
            </div>
            <div className="text-xs font-bold text-[#db8b44] mt-2">
              GOAL: {currentGoal}
            </div>
          </div>
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/20 backdrop-blur-sm" onClick={() => setShowSettings(false)}>
            <div 
              className="bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-lg w-[300px]" 
              onClick={e => e.stopPropagation()}
              style={{ pointerEvents: 'auto' }}
            >
              <div className="text-lg font-bold text-center mb-4">Settings</div>
              {/* Daily Goal */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Daily Goal
                </label>
                <input
                  type="number"
                  min="1"
                  value={dailyGoal}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      setDailyGoal(1);
                    } else {
                      const numValue = parseInt(value);
                      if (!isNaN(numValue) && numValue > 0) {
                        setDailyGoal(numValue);
                      }
                    }
                  }}
                  className="w-full px-3 py-2 border-none rounded-md text-center focus:outline-none focus:ring-2 focus:ring-[#db8b44] bg-black/10"
                  style={{ pointerEvents: 'auto' }}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                />
              </div>
              {/* Long Term Goal */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Long Term Goal
                </label>
                <input
                  type="number"
                  min="1"
                  value={longTermGoal}
                  onChange={(e) => {
                    const value = e.target.value;
                     if (value === '') {
                      setLongTermGoal(1);
                    } else {
                      const numValue = parseInt(value);
                      if (!isNaN(numValue) && numValue > 0) {
                        setLongTermGoal(numValue);
                      }
                    }
                  }}
                  className="w-full px-3 py-2 border-none rounded-md text-center focus:outline-none focus:ring-2 focus:ring-[#db8b44] bg-black/10"
                  style={{ pointerEvents: 'auto' }}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                />
              </div>
              {/* Remove Problems Section */}
              <div className="mb-4">
                <div className="block text-sm font-medium mb-2 text-center">Remove Problems</div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-green-700 font-bold">Easy</span>
                  <span>{categories.easy}</span>
                  <button
                    onClick={() => handleRemoveProblem('easy')}
                    className="px-2 py-1 bg-green-500/10 text-green-800 rounded text-xs font-bold hover:bg-green-500/20 transition-colors"
                    style={{ pointerEvents: 'auto' }}
                    disabled={categories.easy === 0}
                  >
                    -
                  </button>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-yellow-700 font-bold">Medium</span>
                  <span>{categories.medium}</span>
                  <button
                    onClick={() => handleRemoveProblem('medium')}
                    className="px-2 py-1 bg-yellow-400/10 text-yellow-800 rounded text-xs font-bold hover:bg-yellow-400/20 transition-colors"
                    style={{ pointerEvents: 'auto' }}
                    disabled={categories.medium === 0}
                  >
                    -
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-red-700 font-bold">Hard</span>
                  <span>{categories.hard}</span>
                  <button
                    onClick={() => handleRemoveProblem('hard')}
                    className="px-2 py-1 bg-red-400/10 text-red-800 rounded text-xs font-bold hover:bg-red-400/20 transition-colors"
                    style={{ pointerEvents: 'auto' }}
                    disabled={categories.hard === 0}
                  >
                    -
                  </button>
                </div>
              </div>
              {/* Close button */}
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-5 py-2 bg-[#db8b44] text-white rounded-lg hover:bg-[#c57a3d] transition-colors font-bold shadow-md"
                  style={{ pointerEvents: 'auto' }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Problem Categories */}
        <div className="grid grid-cols-3 gap-3 text-center mb-4">
          <div>
            <div className="font-bold text-2xl" style={{color: '#34D399'}}>{categories.easy}</div>
            <div className="text-xs font-medium opacity-75">EASY</div>
          </div>
          <div>
            <div className="font-bold text-2xl" style={{color: '#FBBF24'}}>{categories.medium}</div>
            <div className="text-xs font-medium opacity-75">MEDIUM</div>
          </div>
          <div>
            <div className="font-bold text-2xl" style={{color: '#F87171'}}>{categories.hard}</div>
            <div className="text-xs font-medium opacity-75">HARD</div>
          </div>
        </div>

        {/* Add Problem Buttons */}
        <div className="flex justify-center gap-3 mb-4">
          <button
            onClick={(e) => { e.stopPropagation(); handleAddProblem('easy'); }}
            className="flex-1 py-3 bg-green-500/20 text-green-800 rounded-lg text-sm font-bold hover:bg-green-500/30 transition-colors"
            style={{ pointerEvents: 'auto' }}
          >
            + Easy
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleAddProblem('medium'); }}
            className="flex-1 py-3 bg-yellow-400/20 text-yellow-800 rounded-lg text-sm font-bold hover:bg-yellow-400/30 transition-colors"
            style={{ pointerEvents: 'auto' }}
          >
            + Medium
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleAddProblem('hard'); }}
            className="flex-1 py-3 bg-red-400/20 text-red-800 rounded-lg text-sm font-bold hover:bg-red-400/30 transition-colors"
            style={{ pointerEvents: 'auto' }}
          >
            + Hard
          </button>
        </div>

        {/* Clear Button */}
        <div className="flex justify-center mt-auto">
          <button
            onClick={(e) => { 
              e.stopPropagation(); 
              if (viewMode === 'daily') {
                handleClear();
              } else {
                handleClearLongTerm();
              }
            }}
            className="px-5 py-2 bg-black/10 text-[#4A2C2A]/80 rounded-lg hover:bg-black/20 hover:text-[#4A2C2A] transition-colors text-sm font-bold"
            style={{ pointerEvents: 'auto' }}
          >
            Clear {viewMode === 'daily' ? 'Daily Stats' : 'Long Term Stats'}
          </button>
        </div>
      </div>
    </div>
  );
} 