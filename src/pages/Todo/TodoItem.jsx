const TodoItem = ({ todo, onToggle, onDelete, onEdit }) => {
  return (
    <div className={`todo-item ${todo.is_completed ? 'completed' : ''}`}>
      <input 
        type="checkbox" 
        checked={!!todo.is_completed} 
        onChange={() => onToggle(todo.id, !todo.is_completed)} 
        className="todo-checkbox"
      />
      <p className="todo-text" onClick={() => onEdit(todo)}>{todo.text}</p>
      <button className="delete-btn" onClick={() => onDelete(todo.id)}>×</button>
    </div>
  );
};

export default TodoItem;