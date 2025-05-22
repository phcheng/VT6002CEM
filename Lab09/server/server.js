const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid'); // For generating unique IDs
const { db } = require('./firebase'); // Import Firestore database instance from firebase.js
const { collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc } = require("firebase/firestore");

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// Get all tasks
app.get('/tasks', async (req, res) => {
  try {
    const tasksCollection = collection(db, 'tasks');
    const tasksSnapshot = await getDocs(tasksCollection);
    const tasks = tasksSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).send("Failed to fetch tasks.");
  }
});

// Get a specific task by ID
app.get('/tasks/:id', async (req, res) => {
  try {
    const taskRef = doc(db, 'tasks', req.params.id);
    const taskDoc = await getDoc(taskRef);

    if (taskDoc.exists()) {
      res.json({ id: taskDoc.id, ...taskDoc.data() });
    } else {
      res.status(404).send('Task not found');
    }
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).send("Failed to fetch task.");
  }
});

// Create a new task
app.post('/tasks', async (req, res) => {
  const { title, description, user } = req.body;
  const newTask = {
    title,
    description,
    user: user || "anonymous",
    createdAt: new Date().toISOString(),
    comments: [],
    commentCount: 0,
  };

  try {
    const tasksCollection = collection(db, 'tasks');
    const taskRef = await addDoc(tasksCollection, newTask);
    res.status(201).json({ id: taskRef.id, ...newTask });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).send("Failed to create task.");
  }
});

// Update a task by ID
app.put('/tasks/:id', async (req, res) => {
  try {
    const taskRef = doc(db, 'tasks', req.params.id);
    const taskDoc = await getDoc(taskRef);

    if (taskDoc.exists()) {
      await updateDoc(taskRef, req.body);
      res.json({ id: req.params.id, ...req.body });
    } else {
      res.status(404).send('Task not found');
    }
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).send("Failed to update task.");
  }
});

// Delete a task by ID
app.delete('/tasks/:id', async (req, res) => {
  try {
    const taskRef = doc(db, 'tasks', req.params.id);
    const taskDoc = await getDoc(taskRef);

    if (taskDoc.exists()) {
      await deleteDoc(taskRef);
      res.json({ id: req.params.id });
    } else {
      res.status(404).send('Task not found');
    }
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).send("Failed to delete task.");
  }
});

// Get comments for a specific task
app.get('/tasks/:id/comments', async (req, res) => {
  try {
    const taskRef = doc(db, 'tasks', req.params.id);
    const taskDoc = await getDoc(taskRef);

    if (taskDoc.exists()) {
      res.json(taskDoc.data().comments || []);
    } else {
      res.status(404).send('Task not found');
    }
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).send("Failed to fetch comments.");
  }
});

// Add a comment to a specific task
app.post('/tasks/:id/comments', async (req, res) => {
  const { title, user } = req.body;
  const newComment = {
    id: uuidv4(),
    title,
    user: user || "anonymous",
    createdAt: new Date().toISOString(),
  };

  try {
    const taskRef = doc(db, 'tasks', req.params.id);
    const taskDoc = await getDoc(taskRef);
    if (taskDoc.exists()) {
      const taskData = taskDoc.data();
      const updatedComments = [...(taskData.comments || []), newComment];
      await updateDoc(taskRef, {
        comments: updatedComments,
        commentCount: (taskData.commentCount || 0) + 1,
      });

      res.status(201).json(newComment);
    } else {
      res.status(404).send('Task not found');
    }
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).send("Failed to add comment.");
  }
});

// Delete a comment from a specific task
app.delete('/tasks/:taskId/comments/:commentId', async (req, res) => {
  try {
    const taskRef = doc(db, 'tasks', req.params.taskId);
    const taskDoc = await getDoc(taskRef);

    if (taskDoc.exists()) {
      const taskData = taskDoc.data();
      const updatedComments = (taskData.comments || []).filter(
        (comment) => comment.id !== req.params.commentId
      );

      if (updatedComments.length < (taskData.comments || []).length) {
        await updateDoc(taskRef, {
          comments: updatedComments,
          commentCount: updatedComments.length,
        });

        res.json({ id: req.params.commentId });
      } else {
        res.status(404).send('Comment not found');
      }
    } else {
      res.status(404).send('Task not found');
    }
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).send("Failed to delete comment.");
  }
});

// Add this login endpoint to your existing Express server
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    // Fetch user data from Firestore
    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    const user = usersSnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .find((user) => user.email === email);

    if (!user) {
      // Create a new account if the user does not exist
      const newUser = { email, password, createdAt: new Date().toISOString() };
      const newUserRef = await addDoc(usersCollection, newUser);

      return res.status(201).json({
        message: 'Account created and login successful!',
        user: newUser.email
      });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Send success response
    res.json({ message: 'Login successful', user: user.email });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});