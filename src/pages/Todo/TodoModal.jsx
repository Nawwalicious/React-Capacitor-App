import { useState, useRef, useEffect } from 'react';

const TodoModal = ({ onClose, onSave, existingText }) => {
  const [text, setText] = useState(existingText || '');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSave = () => {
    if (text.trim()) {
      onSave(text.trim());
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{existingText ? 'edit task' : 'add task'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <input
            ref={inputRef}
            type="text"
            className="todo-input-modal"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="what do you need to do?"
          />
        </div>
        <div className="modal-footer">
          <button className="save-btn" onClick={handleSave}>Save Task</button>
        </div>
      </div>
    </div>
  );
};

export default TodoModal;