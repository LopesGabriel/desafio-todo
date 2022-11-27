const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  if (username === undefined)
    return response.status(400).json({ error: 'Username header must be sent' });

  const user = users.find(user => user.username === username);

  if (!user)
    return response.status(401).json({ error: 'Invalid credentials' });

  request.user = user;
  next();
}

app.post('/users', (request, response) => {
  const { username, name } = request.body;
  const hasUsername = users.some(user => user.username === username);

  if (hasUsername)
    return response.status(400).json({ error: "Username already in use" });

  const newUser = { id: uuidv4(), username, name, todos: [] };
  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  return response.json(request.user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user, body: { title, deadline } } = request;

  const created_at = new Date();
  const todo = { id: uuidv4(), title, deadline: new Date(deadline), done: false, created_at };
  user.todos.push(todo);

  return response.status(201).json({ ...todo, deadline: todo.deadline.toISOString() });
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user, body: { title, deadline }, params: { id } } = request;

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo)
    return response.status(404).json({ error: "Todo not found" });

  if (title) todo.title = title;
  if (deadline) todo.deadline = new Date(deadline);

  return response.json({ ...todo, deadline: todo.deadline.toISOString() });
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user, params: { id } } = request;

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo)
    return response.status(404).json({ error: "Todo not found" });

  todo.done = !todo.done;

  return response.json({ ...todo, deadline: todo.deadline.toISOString() });
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user, params: { id } } = request;

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo)
    return response.status(404).json({ error: "Todo not found" });

  user.todos = user.todos.filter(todo => todo.id !== id);

  return response.status(204).send();
});

module.exports = app;