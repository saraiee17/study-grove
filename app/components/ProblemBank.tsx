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
        setPosition({
          x: e.clientX - rel.x,
          y: e.clientY - rel.y,
        });
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
          newSize.height = Math.max(320, e.clientY - position.y);
        }
        if (resizeDirection.includes('n')) {
          const newHeight = Math.max(320, position.y + size.height - e.clientY);
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

  if (!isOpen) return null;

  return (
    <div
      ref={problemBankRef}
      className="fixed z-50 rounded-xl shadow-lg select-none cursor-move"
      style={{ 
        left: position.x, 
        top: position.y, 
        width: size.width, 
        height: size.height,
        background: '#F8EBD9', 
        border: '2px solid #db8b44',
        minWidth: '240px',
        minHeight: '320px'
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

      {/* Content Container */}
      <div className="p-4 h-full flex flex-col">
        {/* Header with close and settings buttons */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={(e) => { e.stopPropagation(); setShowSettings(true); }}
            className="text-[#4A2C2A] hover:text-[#db8b44] transition-colors"
            style={{ pointerEvents: 'auto' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5zm7.43-2.53a7.77 7.77 0 0 0 .07-.97 8.55 8.55 0 0 0-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65c-.04-.24-.25-.42-.5-.42h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11l-.07 1 .07 1-2.11 1.63c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.31.61.22l2.49-1c.52.39 1.06.73 1.69.98l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.25 1.17-.59 1.69-.98l2.49 1c.22.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64z" 
                fill="currentColor"/>
            </svg>
          </button>
          <div className="text-xl font-bold text-[#4A2C2A]">Problem Bank</div>
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="text-[#4A2C2A] hover:text-[#db8b44] text-xl font-bold"
            style={{ pointerEvents: 'auto' }}
          >
            ×
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className="flex justify-center mb-4">
          <div className="flex bg-[#4A2C2A] rounded-lg p-1">
            <button
              onClick={(e) => { e.stopPropagation(); setViewMode('daily'); }}
              className={`px-3 py-1 rounded text-sm font-bold transition-colors ${viewMode === 'daily' ? 'bg-[#db8b44] text-white' : 'text-[#F8EBD9] hover:text-[#db8b44]'}`}
              style={{ pointerEvents: 'auto' }}
            >
              Daily
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setViewMode('longTerm'); }}
              className={`px-3 py-1 rounded text-sm font-bold transition-colors ${viewMode === 'longTerm' ? 'bg-[#db8b44] text-white' : 'text-[#F8EBD9] hover:text-[#db8b44]'}`}
              style={{ pointerEvents: 'auto' }}
            >
              Long Term
            </button>
          </div>
        </div>

        {/* Progress Circle */}
        <div className="relative w-40 h-40 mx-auto mb-4 flex-shrink-0" style={{ minWidth: '160px', minHeight: '160px' }}>
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="12"
            />
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="#db8b44"
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-[#4A2C2A]">{currentCount}</div>
            <div className="text-sm text-[#4A2C2A] opacity-75">
              {viewMode === 'daily' ? 'Today' : 'Total'} Solved
            </div>
            <div className="text-sm text-[#db8b44]">
              Goal: {currentGoal}
            </div>
          </div>
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <div className="absolute inset-0 flex items-center justify-center z-50">
            <div 
              className="bg-[#F8EBD9] p-6 rounded-lg shadow-lg min-w-[300px] max-w-[400px]" 
              onClick={e => e.stopPropagation()}
              style={{ pointerEvents: 'auto' }}
            >
              <div className="text-lg font-bold text-[#4A2C2A] mb-4">Settings</div>
           
              
              {/* Daily Goal */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#4A2C2A] mb-2">
                  Daily Goal
                </label>
                <input
                  type="number"
                  min="1"
                  value={dailyGoal}
                  onChange={(e) => {
                    const value = e.target.value;
                    console.log('Daily goal input changed:', value);
                    if (value === '') {
                      setDailyGoal(1);
                    } else {
                      const numValue = parseInt(value);
                      if (!isNaN(numValue) && numValue > 0) {
                        setDailyGoal(numValue);
                        console.log('Setting daily goal to:', numValue);
                      }
                    }
                  }}
                  className="w-full px-3 py-2 border-2 border-[#db8b44] rounded text-center focus:outline-none focus:border-[#4A2C2A] bg-white"
                  style={{ pointerEvents: 'auto' }}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                />
              </div>

              {/* Long Term Goal */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#4A2C2A] mb-2">
                  Long Term Goal
                </label>
                <input
                  type="number"
                  min="1"
                  value={longTermGoal}
                  onChange={(e) => {
                    const value = e.target.value;
                    console.log('Long term goal input changed:', value);
                    if (value === '') {
                      setLongTermGoal(1);
                    } else {
                      const numValue = parseInt(value);
                      if (!isNaN(numValue) && numValue > 0) {
                        setLongTermGoal(numValue);
                        console.log('Setting long term goal to:', numValue);
                      }
                    }
                  }}
                  className="w-full px-3 py-2 border-2 border-[#db8b44] rounded text-center focus:outline-none focus:border-[#4A2C2A] bg-white"
                  style={{ pointerEvents: 'auto' }}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                />
              </div>

              {/* Close button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 bg-[#db8b44] text-white rounded hover:bg-[#4A2C2A] transition-colors"
                  style={{ pointerEvents: 'auto' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Problem Categories */}
        <div className="flex justify-between mb-4 text-sm">
          <div className="text-center">
            <div className="font-bold text-[#4A2C2A]">Easy</div>
            <div className="text-[#db8b44]">{categories.easy}</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-[#4A2C2A]">Medium</div>
            <div className="text-[#db8b44]">{categories.medium}</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-[#4A2C2A]">Hard</div>
            <div className="text-[#db8b44]">{categories.hard}</div>
          </div>
        </div>

        {/* Add Problem Buttons */}
        {size.width > 280 && size.height > 400 && (
          <div className="flex justify-center gap-1 mb-4">
            <button
              onClick={(e) => { e.stopPropagation(); handleAddProblem('easy'); }}
              className="flex-1 px-3 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
              style={{ pointerEvents: 'auto' }}
            >
              + Easy
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleAddProblem('medium'); }}
              className="flex-1 px-3 py-2 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 transition-colors"
              style={{ pointerEvents: 'auto' }}
            >
              + Medium
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleAddProblem('hard'); }}
              className="flex-1 px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
              style={{ pointerEvents: 'auto' }}
            >
              + Hard
            </button>
          </div>
        )}

        {/* Clear Button */}
        {size.width > 280 && size.height > 400 && (
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
              className="px-4 py-2 bg-[#4A2C2A] text-white rounded-lg hover:bg-[#db8b44] transition-colors"
              style={{ pointerEvents: 'auto' }}
            >
              Clear {viewMode === 'daily' ? 'Daily' : 'Long Term'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 