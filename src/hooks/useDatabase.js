// import { useEffect, useState, useRef } from "react";
// import { Capacitor } from "@capacitor/core";
// import { CapacitorSQLite, SQLiteConnection } from "@capacitor-community/sqlite";

// const DB_NAME = "utility_suite_db";

// export const useDatabase = () => {
//   const db = useRef(null);
//   const sqlite = useRef(null);
//   const [isDbReady, setIsDbReady] = useState(false);

//   useEffect(() => {
//     const initializeDatabase = async () => {
//       try {
//         if (Capacitor.getPlatform() !== "web") {
//           sqlite.current = new SQLiteConnection(CapacitorSQLite);
//           const ret = await sqlite.current.checkConnectionsConsistency();
//           const isConn = (await sqlite.current.isConnection(DB_NAME, false))
//             .result;
//           if (ret.result && isConn) {
//             db.current = await sqlite.current.retrieveConnection(
//               DB_NAME,
//               false
//             );
//           } else {
//             db.current = await sqlite.current.createConnection(
//               DB_NAME,
//               false,
//               "no-encryption",
//               1,
//               false
//             );
//           }
//           await db.current.open();
//           await setupSchema();
//           setIsDbReady(true);
//         } else {
//           console.warn(
//             "SQLite is not available on the web platform. To-Do list will not be persistent."
//           );
//         }
//       } catch (e) {
//         console.error("Error initializing database", e);
//       }
//     };

//     const setupSchema = async () => {
//       const schema = `
//     CREATE TABLE IF NOT EXISTS todos (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       text TEXT NOT NULL,
//       is_completed INTEGER NOT NULL DEFAULT 0
//     );
    
//     CREATE TABLE IF NOT EXISTS app_settings (
//       key TEXT PRIMARY KEY,
//       value TEXT NOT NULL,
//       created_at INTEGER DEFAULT (strftime('%s', 'now')),
//       updated_at INTEGER DEFAULT (strftime('%s', 'now'))
//     );
//   `;
//       await db.current.execute(schema);
//     };

//     initializeDatabase();

//     return () => {
//       // Cleanup on unmount
//       if (sqlite.current && db.current) {
//         sqlite.current.closeConnection(DB_NAME, false);
//       }
//     };
//   }, []);

//   const getTodos = async () => {
//     if (!isDbReady) return [];
//     const result = await db.current.query(
//       "SELECT * FROM todos ORDER BY id DESC"
//     );
//     return result.values || [];
//   };

//   const addTodo = async (text) => {
//     if (!isDbReady) return;
//     const query = "INSERT INTO todos (text, is_completed) VALUES (?, 0)";
//     await db.current.run(query, [text]);
//   };

//   const toggleTodoCompletion = async (id, is_completed) => {
//     if (!isDbReady) return;
//     const query = "UPDATE todos SET is_completed = ? WHERE id = ?";
//     await db.current.run(query, [is_completed ? 1 : 0, id]);
//   };

//   const deleteTodo = async (id) => {
//     if (!isDbReady) return;
//     const query = "DELETE FROM todos WHERE id = ?";
//     await db.current.run(query, [id]);
//   };

//   const updateTodoText = async (id, text) => {
//     if (!isDbReady) return;
//     const query = "UPDATE todos SET text = ? WHERE id = ?";
//     await db.current.run(query, [text]);
//   };

//   const getApiKey = async () => {
//     if (!isDbReady) return null;
//     const result = await db.current.query(
//       "SELECT value FROM app_settings WHERE key = ?",
//       ["exchangerate_api_key"]
//     );
//     return result.values?.[0]?.value || null;
//   };

//   const setApiKey = async (apiKey) => {
//     if (!isDbReady) return;
//     const query = `
//     INSERT OR REPLACE INTO app_settings (key, value, updated_at) 
//     VALUES (?, ?, strftime('%s', 'now'))
//   `;
//     await db.current.run(query, ["exchangerate_api_key", apiKey]);
//   };

//   const clearApiKey = async () => {
//     if (!isDbReady) return;
//     await db.current.run("DELETE FROM app_settings WHERE key = ?", [
//       "exchangerate_api_key",
//     ]);
//   };

//   return {
//     isDbReady,
//     getTodos,
//     addTodo,
//     toggleTodoCompletion,
//     deleteTodo,
//     updateTodoText,
//     getApiKey,
//     setApiKey,
//     clearApiKey,
//   };
// };
// hooks/useDatabase.js
import { useEffect, useState, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { CapacitorSQLite, SQLiteConnection } from "@capacitor-community/sqlite";

const DB_NAME = "utility_suite_db";

export const useDatabase = () => {
  const db = useRef(null);
  const sqlite = useRef(null);
  const [isDbReady, setIsDbReady] = useState(false);
  const [isWeb, setIsWeb] = useState(false);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        if (Capacitor.getPlatform() === "web") {
          // Web platform - use localStorage fallback
          console.warn("Running on web - using localStorage instead of SQLite");
          setIsWeb(true);
          setIsDbReady(true);
        } else {
          // Mobile platform - use SQLite
          sqlite.current = new SQLiteConnection(CapacitorSQLite);
          const ret = await sqlite.current.checkConnectionsConsistency();
          const isConn = (await sqlite.current.isConnection(DB_NAME, false)).result;
          
          if (ret.result && isConn) {
            db.current = await sqlite.current.retrieveConnection(DB_NAME, false);
          } else {
            db.current = await sqlite.current.createConnection(
              DB_NAME,
              false,
              "no-encryption",
              1,
              false
            );
          }
          await db.current.open();
          await setupSchema();
          setIsDbReady(true);
        }
      } catch (e) {
        console.error("Error initializing database", e);
        // Fallback to web mode if SQLite fails
        setIsWeb(true);
        setIsDbReady(true);
      }
    };

    const setupSchema = async () => {
      const schema = `
        CREATE TABLE IF NOT EXISTS todos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          text TEXT NOT NULL,
          is_completed INTEGER NOT NULL DEFAULT 0
        );
        
        CREATE TABLE IF NOT EXISTS app_settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          created_at INTEGER DEFAULT (strftime('%s', 'now')),
          updated_at INTEGER DEFAULT (strftime('%s', 'now'))
        );
      `;
      await db.current.execute(schema);
    };

    initializeDatabase();

    return () => {
      if (sqlite.current && db.current) {
        sqlite.current.closeConnection(DB_NAME, false);
      }
    };
  }, []);

  // Web localStorage fallback functions
  const webGetTodos = () => {
    try {
      const todos = localStorage.getItem('todos');
      return todos ? JSON.parse(todos) : [];
    } catch (error) {
      console.error('Error getting todos from localStorage:', error);
      return [];
    }
  };

  const webSaveTodos = (todos) => {
    try {
      localStorage.setItem('todos', JSON.stringify(todos));
    } catch (error) {
      console.error('Error saving todos to localStorage:', error);
    }
  };

  const webGetApiKey = () => {
    return localStorage.getItem('exchangerate_api_key');
  };

  const webSetApiKey = (key) => {
    localStorage.setItem('exchangerate_api_key', key);
  };

  const webClearApiKey = () => {
    localStorage.removeItem('exchangerate_api_key');
  };

  // Unified API functions
  const getTodos = async () => {
    if (!isDbReady) return [];
    
    if (isWeb) {
      return webGetTodos();
    } else {
      const result = await db.current.query("SELECT * FROM todos ORDER BY id DESC");
      return result.values || [];
    }
  };

  const addTodo = async (text) => {
    if (!isDbReady) return;
    
    if (isWeb) {
      const todos = webGetTodos();
      const newTodo = {
        id: Date.now(), // Simple ID for web
        text,
        is_completed: 0
      };
      todos.unshift(newTodo);
      webSaveTodos(todos);
    } else {
      const query = "INSERT INTO todos (text, is_completed) VALUES (?, 0)";
      await db.current.run(query, [text]);
    }
  };

  const toggleTodoCompletion = async (id, is_completed) => {
    if (!isDbReady) return;
    
    if (isWeb) {
      const todos = webGetTodos();
      const todoIndex = todos.findIndex(todo => todo.id === id);
      if (todoIndex !== -1) {
        todos[todoIndex].is_completed = is_completed ? 1 : 0;
        webSaveTodos(todos);
      }
    } else {
      const query = "UPDATE todos SET is_completed = ? WHERE id = ?";
      await db.current.run(query, [is_completed ? 1 : 0, id]);
    }
  };

  const deleteTodo = async (id) => {
    if (!isDbReady) return;
    
    if (isWeb) {
      const todos = webGetTodos();
      const filteredTodos = todos.filter(todo => todo.id !== id);
      webSaveTodos(filteredTodos);
    } else {
      const query = "DELETE FROM todos WHERE id = ?";
      await db.current.run(query, [id]);
    }
  };

  const updateTodoText = async (id, text) => {
    if (!isDbReady) return;
    
    if (isWeb) {
      const todos = webGetTodos();
      const todoIndex = todos.findIndex(todo => todo.id === id);
      if (todoIndex !== -1) {
        todos[todoIndex].text = text;
        webSaveTodos(todos);
      }
    } else {
      const query = "UPDATE todos SET text = ? WHERE id = ?";
      await db.current.run(query, [text, id]);
    }
  };

  const getApiKey = async () => {
    if (!isDbReady) return null;
    
    if (isWeb) {
      return webGetApiKey();
    } else {
      const result = await db.current.query(
        "SELECT value FROM app_settings WHERE key = ?",
        ["exchangerate_api_key"]
      );
      return result.values?.[0]?.value || null;
    }
  };

  const setApiKey = async (apiKey) => {
    if (!isDbReady) return;
    
    if (isWeb) {
      webSetApiKey(apiKey);
    } else {
      const query = `
        INSERT OR REPLACE INTO app_settings (key, value, updated_at) 
        VALUES (?, ?, strftime('%s', 'now'))
      `;
      await db.current.run(query, ["exchangerate_api_key", apiKey]);
    }
  };

  const clearApiKey = async () => {
    if (!isDbReady) return;
    
    if (isWeb) {
      webClearApiKey();
    } else {
      await db.current.run("DELETE FROM app_settings WHERE key = ?", [
        "exchangerate_api_key",
      ]);
    }
  };

  return {
    isDbReady,
    isWeb, // Export this so components know which mode we're in
    getTodos,
    addTodo,
    toggleTodoCompletion,
    deleteTodo,
    updateTodoText,
    getApiKey,
    setApiKey,
    clearApiKey,
  };
};