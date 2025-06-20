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
          newSize.height = Math.max(400, e.clientY - position.y);
        }
        if (resizeDirection.includes('n')) {
          const newHeight = Math.max(400, position.y + size.height - e.clientY);
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
      className="fixed z-50 rounded-xl shadow-lg select-none cursor-move"
      style={{ 
        left: position.x, 
        top: position.y, 
        width: size.width, 
        height: size.height,
        background: '#F8EBD9', 
        border: '2px solid #db8b44',
        minWidth: '280px',
        minHeight: '400px'
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
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-xl font-bold text-[#4A2C2A]">To-Do List</div>
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="text-[#4A2C2A] hover:text-[#db8b44] text-xl font-bold"
            style={{ pointerEvents: 'auto' }}
          >
            ×
          </button>
        </div>

        {/* Progress indicator */}
        <div className="mb-4 p-3 bg-white/50 rounded-lg border border-[#db8b44] border-opacity-30">
          <div className="text-sm font-bold text-[#4A2C2A] mb-2 text-center">
            {completedCount} of {totalCount} completed
          </div>
          {totalCount > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-[#db8b44] h-3 rounded-full transition-all duration-300"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              ></div>
            </div>
          )}
        </div>

        {/* Filter buttons */}
        <div className="flex justify-center mb-4">
          <div className="flex bg-[#4A2C2A] rounded-lg p-1">
            <button
              onClick={(e) => { e.stopPropagation(); setFilter('all'); }}
              className={`px-4 py-2 rounded text-sm font-bold transition-colors ${filter === 'all' ? 'bg-[#db8b44] text-white' : 'text-[#F8EBD9] hover:text-[#db8b44]'}`}
              style={{ pointerEvents: 'auto' }}
            >
              All ({totalCount})
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setFilter('active'); }}
              className={`px-4 py-2 rounded text-sm font-bold transition-colors ${filter === 'active' ? 'bg-[#db8b44] text-white' : 'text-[#F8EBD9] hover:text-[#db8b44]'}`}
              style={{ pointerEvents: 'auto' }}
            >
              Active ({totalCount - completedCount})
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setFilter('completed'); }}
              className={`px-4 py-2 rounded text-sm font-bold transition-colors ${filter === 'completed' ? 'bg-[#db8b44] text-white' : 'text-[#F8EBD9] hover:text-[#db8b44]'}`}
              style={{ pointerEvents: 'auto' }}
            >
              Done ({completedCount})
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
            className="flex-1 px-3 py-2 border-2 border-[#db8b44] rounded-lg focus:outline-none focus:border-[#4A2C2A] bg-white"
            style={{ pointerEvents: 'auto' }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          />
          <button
            onClick={(e) => { e.stopPropagation(); addTodo(); }}
            className="px-4 py-2 bg-[#db8b44] text-white rounded-lg hover:bg-[#4A2C2A] transition-colors font-bold"
            style={{ pointerEvents: 'auto' }}
          >
            Add
          </button>
        </div>

        {/* Todo list */}
        <div className="flex-1 overflow-y-auto mb-4">
          {filteredTodos.length === 0 ? (
            <div className="text-center text-[#4A2C2A] opacity-75 py-8">
              {filter === 'all' ? 'No tasks yet' : 
               filter === 'active' ? 'No active tasks' : 'No completed tasks'}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTodos.map(todo => (
                <div
                  key={todo.id}
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                    todo.completed 
                      ? 'bg-gray-100 border-gray-300' 
                      : 'bg-white border-[#db8b44]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    className="w-5 h-5 text-[#db8b44] rounded focus:ring-[#db8b44]"
                    style={{ pointerEvents: 'auto' }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span
                    className={`flex-1 text-sm font-medium ${
                      todo.completed 
                        ? 'line-through text-gray-500' 
                        : 'text-[#4A2C2A]'
                    }`}
                  >
                    {todo.text}
                  </span>
                  
                  {/* Priority indicators */}
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); setPriority(todo.id, 'low'); }}
                      className={`w-4 h-4 rounded-full transition-colors border-2 ${
                        todo.priority === 'low' ? 'bg-green-500 border-green-600' : 'bg-gray-200 border-gray-300 hover:bg-green-200'
                      }`}
                      style={{ pointerEvents: 'auto' }}
                      title="Low priority"
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); setPriority(todo.id, 'medium'); }}
                      className={`w-4 h-4 rounded-full transition-colors border-2 ${
                        todo.priority === 'medium' ? 'bg-yellow-500 border-yellow-600' : 'bg-gray-200 border-gray-300 hover:bg-yellow-200'
                      }`}
                      style={{ pointerEvents: 'auto' }}
                      title="Medium priority"
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); setPriority(todo.id, 'high'); }}
                      className={`w-4 h-4 rounded-full transition-colors border-2 ${
                        todo.priority === 'high' ? 'bg-red-500 border-red-600' : 'bg-gray-200 border-gray-300 hover:bg-red-200'
                      }`}
                      style={{ pointerEvents: 'auto' }}
                      title="High priority"
                    />
                  </div>
                  
                  {/* Delete button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteTodo(todo.id); }}
                    className="w-6 h-6 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-100 rounded transition-colors"
                    style={{ pointerEvents: 'auto' }}
                    title="Delete task"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Clear completed button */}
        {completedCount > 0 && (
          <div className="flex justify-center">
            <button
              onClick={(e) => { e.stopPropagation(); clearCompleted(); }}
              className="px-4 py-2 bg-[#4A2C2A] text-white rounded-lg hover:bg-[#db8b44] transition-colors text-sm font-bold"
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