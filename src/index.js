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

  const todo = { id: uuidv4(), title, deadline: new Date(deadline), done: false };
  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

module.exports = app;