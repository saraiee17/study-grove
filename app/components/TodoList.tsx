import { useState, useRef, useEffect } from 'react';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

interface TodoListProps {
  isOpen: boolean;
  onClose: () => void;
}

// Clamp position utility
function clampPosition(pos: {x: number, y: number}, size: {width: number, height: number}) {
  const maxX = window.innerWidth - size.width;
  const maxY = window.innerHeight - size.height;
  return {
    x: Math.max(0, Math.min(pos.x, maxX)),
    y: Math.max(0, Math.min(pos.y, maxY)),
  };
}

export function TodoList({ isOpen, onClose }: TodoListProps) {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  // Position and size state
  const [position, setPosition] = useState({ x: 200, y: 100 });
  const [size, setSize] = useState({ width: 320, height: 480 });
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string>('');
  const [rel, setRel] = useState({ x: 0, y: 0 });
  
  const todoListRef = useRef<HTMLDivElement>(null);

  // Load state from localStorage on initial render
  useEffect(() => {
    try {
      const saved = localStorage.getItem('studygrove-todolist');
      if (saved) {
        const data = JSON.parse(saved);
        if (data) {
          if (Array.isArray(data.todos)) {
            setTodos(data.todos);
          }
          if (['all', 'active', 'completed'].includes(data.filter)) {
            setFilter(data.filter);
          }
        }
      }
    } catch (error) {
      console.error("Failed to load todos from localStorage", error);
    }
  }, []);

  // Save state to localStorage whenever todos or filter change
  useEffect(() => {
    try {
      const dataToSave = JSON.stringify({ todos, filter });
      localStorage.setItem('studygrove-todolist', dataToSave);
    } catch (error) {
      console.error("Failed to save todos to localStorage", error);
    }
  }, [todos, filter]);

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
          newSize.height = Math.max(340, e.clientY - position.y);
        }
        if (resizeDirection.includes('n')) {
          const newHeight = Math.max(340, position.y + size.height - e.clientY);
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
    if (!todoListRef.current) return;
    setDragging(true);
    const rect = todoListRef.current.getBoundingClientRect();
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

  const addTodo = () => {
    if (newTodoText.trim()) {
      const newTodo: TodoItem = {
        id: Date.now().toString(),
        text: newTodoText.trim(),
        completed: false,
        priority: 'medium'
      };
      setTodos(prev => [...prev, newTodo]);
      setNewTodoText('');
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const setPriority = (id: string, priority: 'low' | 'medium' | 'high') => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, priority } : todo
    ));
  };

  const clearCompleted = () => {
    setTodos(prev => prev.filter(todo => !todo.completed));
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const completedCount = todos.filter(todo => todo.completed).length;
  const totalCount = todos.length;

  if (!isOpen) return null;

  return (
    <div
      ref={todoListRef}
      className="fixed z-50 rounded-2xl shadow-2xl select-none cursor-move bg-white/30 backdrop-blur-md border border-white/20"
      style={{ 
        left: position.x, 
        top: position.y, 
        width: size.width, 
        height: size.height,
        minWidth: '220px',
        minHeight: '340px',
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
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-xl font-semibold" style={{ fontFamily: 'Chewy, system-ui, sans-serif' }}>To-Do List</span>
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="w-8 h-8 flex items-center justify-center text-2xl text-[#4A2C2A]/70 hover:text-[#db8b44] hover:bg-black/10 rounded-full transition-colors z-20"
            style={{ pointerEvents: 'auto' }}
          >
            ×
          </button>
        </div>

        {/* Progress indicator */}
        <div className="mb-4">
          <div className="text-sm font-medium text-[#4A2C2A] mb-2 text-center">
            {completedCount} of {totalCount} completed
          </div>
          <div className="w-full bg-black/10 rounded-full h-2.5">
            <div 
              className="bg-[#db8b44] h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex justify-center mb-4">
          <div className="flex bg-black/10 rounded-full p-1">
             <button
              onClick={(e) => { e.stopPropagation(); setFilter('all'); }}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${filter === 'all' ? 'bg-white/80 text-[#db8b44] shadow-sm' : 'text-[#4A2C2A]/70 hover:bg-white/30'}`}
              style={{ pointerEvents: 'auto' }}
            >
              All
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setFilter('active'); }}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${filter === 'active' ? 'bg-white/80 text-[#db8b44] shadow-sm' : 'text-[#4A2C2A]/70 hover:bg-white/30'}`}
              style={{ pointerEvents: 'auto' }}
            >
              Active
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setFilter('completed'); }}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${filter === 'completed' ? 'bg-white/80 text-[#db8b44] shadow-sm' : 'text-[#4A2C2A]/70 hover:bg-white/30'}`}
              style={{ pointerEvents: 'auto' }}
            >
              Done
            </button>
          </div>
        </div>

        {/* Add new todo */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
            placeholder="Add a new task..."
            className="flex-1 px-4 py-2 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-[#db8b44] bg-black/5 text-[#4A2C2A] placeholder:text-[#4A2C2A]/50"
            style={{ pointerEvents: 'auto' }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          />
          <button
            onClick={(e) => { e.stopPropagation(); addTodo(); }}
            className="px-5 py-2 bg-[#db8b44] text-white rounded-lg hover:bg-[#c57a3d] transition-colors font-bold shadow-md"
            style={{ pointerEvents: 'auto' }}
          >
            Add
          </button>
        </div>

        {/* Todo list */}
        <div className="flex-1 overflow-y-auto -mr-2 pr-2 mb-4 space-y-2">
          {filteredTodos.length === 0 ? (
            <div className="text-center text-[#4A2C2A] opacity-60 pt-10">
              <p className="text-lg">✨</p>
              <p className="font-medium mt-2">
                {filter === 'all' ? 'Your list is clear!' : 
                 filter === 'active' ? 'No active tasks' : 'No completed tasks'}
              </p>
            </div>
          ) : (
            <>
              {filteredTodos.map(todo => (
                <div
                  key={todo.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 cursor-pointer ${
                    todo.completed 
                      ? 'bg-black/5 text-[#4A2C2A]/50' 
                      : 'bg-white/40 hover:bg-white/60'
                  }`}
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleTodo(todo.id)}
                      className="w-5 h-5 text-[#db8b44] bg-transparent border-2 border-[#4A2C2A]/30 rounded focus:ring-offset-0 focus:ring-2 focus:ring-[#db8b44] transition"
                      style={{ pointerEvents: 'auto' }}
                    />
                  </div>
                  <span
                    className={`flex-1 text-sm font-medium ${
                      todo.completed && 'line-through'
                    }`}
                  >
                    {todo.text}
                  </span>
                  
                  {/* Priority indicators */}
                  <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => setPriority(todo.id, 'high')}
                      className={`w-4 h-4 rounded-full transition-transform hover:scale-125 border-2 ${
                        todo.priority === 'high' ? 'bg-red-500 border-red-700' : 'bg-transparent border-red-500/50'
                      }`}
                      style={{ pointerEvents: 'auto' }}
                      title="High priority"
                    />
                    <button
                      onClick={() => setPriority(todo.id, 'medium')}
                      className={`w-4 h-4 rounded-full transition-transform hover:scale-125 border-2 ${
                        todo.priority === 'medium' ? 'bg-yellow-500 border-yellow-700' : 'bg-transparent border-yellow-500/50'
                      }`}
                      style={{ pointerEvents: 'auto' }}
                      title="Medium priority"
                    />
                     <button
                      onClick={() => setPriority(todo.id, 'low')}
                      className={`w-4 h-4 rounded-full transition-transform hover:scale-125 border-2 ${
                        todo.priority === 'low' ? 'bg-green-500 border-green-700' : 'bg-transparent border-green-500/50'
                      }`}
                      style={{ pointerEvents: 'auto' }}
                      title="Low priority"
                    />
                  </div>
                  
                  {/* Delete button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteTodo(todo.id); }}
                    className="w-7 h-7 flex items-center justify-center text-lg text-[#4A2C2A]/40 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                    style={{ pointerEvents: 'auto' }}
                    title="Delete task"
                  >
                    ×
                  </button>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Clear completed button */}
        {completedCount > 0 && (
          <div className="flex justify-center">
            <button
              onClick={(e) => { e.stopPropagation(); clearCompleted(); }}
              className="px-5 py-2 bg-black/10 text-[#4A2C2A]/80 rounded-lg hover:bg-black/20 hover:text-[#4A2C2A] transition-colors text-sm font-bold"
              style={{ pointerEvents: 'auto' }}
            >
              Clear Completed ({completedCount})
            </button>
          </div>
        )}
      </div>
    </div>
  );
}