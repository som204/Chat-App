export const tree = {
  "package.json": {
    file: {
      contents: `{
    "name": "todo-app",
    "version": "1.0.0",
    "private": true,
    
    "dependencies": {
      "lucide-react": "^0.264.0",
      "react": "^18.2.0",
      "react-dom": "^18.2.0",
      "tailwindcss": "^3.3.3"
    },
    "scripts": {
      "dev": "vite",
      "build": "vite build"
    },
    "devDependencies": {
      "@vitejs/plugin-react": "^4.0.3",
      "autoprefixer": "^10.4.14",
      "postcss": "^8.4.27",
      "vite": "^4.4.5"
    }
  }`,
    },
  },
  "vite.config.js": {
    file: {
      contents: `import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react';
  
  // https://vitejs.dev/config/
  export default defineConfig({
    plugins: [react()],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: \`@import "@/styles/globals.css";\`
        }
      }
    }
  });`,
    },
  },
  src: {
    directory: {
      "App.jsx": {
        file: {
          contents: `import { useState } from 'react';
  import { Plus } from 'lucide-react';
  
  export default function App() {
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState('');
  
    const addTodo = () => {
      if (newTodo.trim() !== '') {
        setTodos([...todos, { text: newTodo, completed: false }]);
        setNewTodo('');
      }
    };
  
    const toggleComplete = (index) => {
      const updatedTodos = [...todos];
      updatedTodos[index].completed = !updatedTodos[index].completed;
      setTodos(updatedTodos);
    };
  
    const deleteTodo = (index) => {
      const updatedTodos = todos.filter((_, i) => i !== index);
      setTodos(updatedTodos);
    };
  
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">To-Do List</h1>
        <div className="flex mb-4">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new to-do"
            className="flex-grow p-2 border border-gray-300 rounded"
          />
          <button onClick={addTodo} className="ml-2 p-2 bg-blue-500 hover:bg-blue-700 text-white rounded">
            <Plus className="h-5 w-5" />
          </button>
        </div>
        <ul className="list-disc">
          {todos.map((todo, index) => (
            <li key={index} className="flex justify-between items-center">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleComplete(index)}
                  className="mr-2"
                />
                <span className={todo.completed ? 'line-through text-gray-500' : ''}>{todo.text}</span>
              </div>
              <button onClick={() => deleteTodo(index)} className="text-red-500 hover:text-red-700">
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }`,
        },
      },
      "main.jsx": {
        file: {
          contents: `import App from './App.jsx';
  import './index.css';
  import { createRoot } from 'react-dom/client';
  import { StrictMode } from 'react';
  
  const rootElement = document.getElementById('root');
  const root = createRoot(rootElement);
  
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );`,
        },
      },
      "index.css": {
        file: {
          contents: `@tailwind base;
  @tailwind components;
  @tailwind utilities;`,
        },
      },
    },
  },
  "index.html": {
    file: {
      contents: `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <link rel="icon" type="image/svg+xml" href="/vite.svg" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Vite + React</title>
    </head>
    <body>
      <div id="root"></div>
      <script type="module" src="/src/main.jsx"></script>
    </body>
  </html>`,
    },
  },
  "postcss.config.js": {
    file: {
      contents: `// postcss.config.js
  export default {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  };`,
    },
  },
};
