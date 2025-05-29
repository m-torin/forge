import { getTodos, toggleTodoStatus, removeTodo, Todo } from './actions';
import TodoItem from './todo-item';

export default async function TodoList() {
  const { data: todos, success, error } = await getTodos();

  if (!success) {
    return (
      <div className="p-4 bg-red-100 text-red-800 rounded">
        Error loading todos: {error}
      </div>
    );
  }

  if (!todos || todos.length === 0) {
    return (
      <div className="p-4 text-gray-500 text-center border border-dashed rounded">
        No todos found. Add one above!
      </div>
    );
  }

  return (
    <ul className="divide-y">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          toggleStatus={toggleTodoStatus}
          removeTodo={removeTodo}
        />
      ))}
    </ul>
  );
}
