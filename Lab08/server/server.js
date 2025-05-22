const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); // For generating unique IDs

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(bodyParser.json());

// Read data from JSON file
const readData = () => {
  const rawData = fs.readFileSync(DATA_FILE);
  return JSON.parse(rawData);
};

// Load initial data into memory
let data = readData();

// Helper function to save data to the JSON file
const saveData = () => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// Get all tasks
app.get('/tasks', (req, res) => {
  setTimeout(() => {
    res.json(data);
  }, 1000); // 1 second delay
});

// Get a specific task by ID
app.get('/tasks/:id', (req, res) => {
  const task = data.find((task) => task._id === req.params.id);
  if (task) {
    res.json(task);
  } else {
    res.status(404).send('Task not found');
  }
});

// Create a new task
app.post('/tasks', (req, res) => {
  const { title, description } = req.body;

  const newTask = {
    _id: uuidv4(),
    createdAt: new Date().toISOString(),
    title,
    description,
    user: "default_user",
    comments: [],
    commentCount: 0,
  };

  data.push(newTask);
  saveData();
  res.status(201).json(newTask);
});

// Update a task by ID
app.put('/tasks/:id', (req, res) => {
  const taskIndex = data.findIndex((task) => task._id === req.params.id);
  if (taskIndex !== -1) {
    data[taskIndex] = { ...data[taskIndex], ...req.body };
    saveData();
    res.json(data[taskIndex]);
  } else {
    res.status(404).send('Task not found');
  }
});

// Delete a task by ID
app.delete('/tasks/:id', (req, res) => {
  const taskIndex = data.findIndex((task) => task._id === req.params.id);
  if (taskIndex !== -1) {
    const deletedTask = data.splice(taskIndex, 1);
    saveData();
    res.json(deletedTask[0]);
  } else {
    res.status(404).send('Task not found');
  }
});

// Get comments for a specific task
app.get('/tasks/:id/comments', (req, res) => {
  const task = data.find((task) => task._id === req.params.id);
  if (task) {
    res.json(task.comments);
  } else {
    res.status(404).send('Task not found');
  }
});

// Add a comment to a specific task
app.post('/tasks/:id/comments', (req, res) => {
  const task = data.find((task) => task._id === req.params.id);
  if (task) {
    const { title, user } = req.body;

    const newComment = {
      id: uuidv4(),
      title,
      user: user || "anonymous",
      createdAt: new Date().toISOString(),
    };

    task.comments.push(newComment);
    task.commentCount += 1;
    saveData();
    res.status(201).json(newComment);
  } else {
    res.status(404).send('Task not found');
  }
});

// Delete a comment from a specific task
app.delete('/tasks/:taskId/comments/:commentId', (req, res) => {
  const task = data.find((task) => task._id === req.params.taskId);
  if (task) {
    const commentIndex = task.comments.findIndex((comment) => comment.id === req.params.commentId);
    if (commentIndex !== -1) {
      const deletedComment = task.comments.splice(commentIndex, 1);
      task.commentCount -= 1;
      saveData();
      res.json(deletedComment[0]);
    } else {
      res.status(404).send('Comment not found');
    }
  } else {
    res.status(404).send('Task not found');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});