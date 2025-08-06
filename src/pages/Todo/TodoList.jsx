import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useDatabase } from '../../hooks/useDatabase';
import TodoItem from './TodoItem';
import TodoModal from './TodoModal';
import './TodoList.scss';

const PageHeader = ({ title }) => (
  <header className="page-header">
    <Link to="/" className="back-btn" aria-label="Go back to Dashboard">
      ‹
    </Link>
    <h1 className="page-title">{title}</h1>
  </header>
);

const TodoList = () => {
  const { isDbReady, getTodos, addTodo, toggleTodoCompletion, deleteTodo, updateTodoText } = useDatabase();
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);

  const fetchTodos = useCallback(async () => {
    if (isDbReady) {
      const data = await getTodos();
      setTodos(data);
    }
  }, [isDbReady, getTodos]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleAddTodo = async (text) => {
    await addTodo(text);
    fetchTodos();
    setIsModalOpen(false);
  };
  
  const handleUpdateTodo = async (id, text) => {
    await updateTodoText(id, text);
    fetchTodos();
    setIsModalOpen(false);
    setEditingTodo(null);
  }

  const handleToggle = async (id, completed) => {
    await toggleTodoCompletion(id, completed);
    fetchTodos();
  };

  const handleDelete = async (id) => {
    await deleteTodo(id);
    fetchTodos();
  };
  
  const openEditModal = (todo) => {
    setEditingTodo(todo);
    setIsModalOpen(true);
  }
  
  const openAddModal = () => {
    setEditingTodo(null);
    setIsModalOpen(true);
  }
  
  const closeModal = () => {
      setIsModalOpen(false);
      setEditingTodo(null);
  }

  const filteredTodos = todos.filter(todo => {
    if (filter === 'Active') return !todo.is_completed;
    if (filter === 'Completed') return todo.is_completed;
    return true;
  });

  return (
    <div className="todo-list-page">
      <PageHeader title="to-do list" />

      <div className="pivot-control">
        {['All', 'Active', 'Completed'].map(f => (
          <button key={f} className={`pivot-item ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
      </div>

      {isWeb && (
        <div style={{ 
          background: 'var(--surface-color)', 
          padding: '12px', 
          marginBottom: '16px',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)'
        }}>
          <p>📝 Running in web mode - todos are stored in your browser and won't sync across devices.</p>
        </div>
      )}
      
      {!isDbReady && Capacitor.getPlatform() !== 'web' && <p className="loading-db">Initializing Database...</p>}

      <div className="todos-container">
        {filteredTodos.map(todo => (
          <TodoItem 
            key={todo.id} 
            todo={todo} 
            onToggle={handleToggle} 
            onDelete={handleDelete}
            onEdit={openEditModal}
          />
        ))}
      </div>

      <button className="add-todo-btn" onClick={openAddModal}>
        +
      </button>

      {isModalOpen && (
        <TodoModal 
          onClose={closeModal}
          onSave={editingTodo ? (text) => handleUpdateTodo(editingTodo.id, text) : handleAddTodo}
          existingText={editingTodo ? editingTodo.text : ''}
        />
      )}
    </div>
  );
};

export default TodoList;