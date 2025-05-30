import { getTodos, removeTodo, type Todo, toggleTodoStatus } from './actions';
import TodoItem from './todo-item';

export default async function TodoList() {
  const { data: todos, error, success } = await getTodos();

  if (!success) {
    return <div className="p-4 bg-red-100 text-red-800 rounded">Error loading todos: {error}</div>;
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
      {todos.map((todo: Todo) => (
        <TodoItem
          key={todo.id}
          removeTodo={removeTodo}
          todo={todo}
          toggleStatus={toggleTodoStatus}
        />
      ))}
    </ul>
  );
}
