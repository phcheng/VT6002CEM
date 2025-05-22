const { db } = require("./firebase");
const { collection, doc, setDoc } = require("firebase/firestore");

const tasks = [
  {
    _id: "9VWpo0628Ak7ZM8JjPbG",
    createdAt: "2025-02-07T17:29:06.093+08:00",
    comments: [
      {
        title: "I'll create the repository today.",
        createdAt: "2025-02-07T17:39:19.774+08:00",
        id: "dw5e5rbj",
        user: "Bob",
      },
      {
        title: "Make sure to add the .gitignore file.",
        createdAt: "2025-02-07T17:35:49.071+08:00",
        id: "jfjwjlxi",
        user: "Alice",
      },
      {
        title: "Also, set the repository to private for now.",
        createdAt: "2025-02-07T17:31:38.142+08:00",
        id: "00mr0abd",
        user: "Alice",
      },
    ],
    description:
      "Create a new GitHub repository for the project and set up the initial structure.",
    user: "Alice",
    title: "Set up project repository",
    commentCount: 3,
  },
  {
    _id: "3TIPGpzPSVfnUzn0gymv",
    description: "Create an ER diagram for the project's database.",
    title: "Design database schema",
    comments: [
      {
        user: "Alice",
        createdAt: "2025-02-07T17:38:29.307+08:00",
        id: "ji1q04um",
        title: "I think we need tables for users, products, and orders.",
      },
      {
        title: "Don't forget to include relationships between tables.",
        id: "hblqnr2c",
        createdAt: "2025-02-07T17:28:48.497+08:00",
        user: "Alice",
      },
    ],
    user: "Charlie",
    createdAt: "2025-02-07T16:41:38.087+08:00",
    commentCount: 2,
  },
  {
    _id: "dSB50muAzQ4UqG9YfYam",
    user: "David",
    comments: [
      {
        user: "Charlie",
        createdAt: "2025-02-07T16:41:24.738+08:00",
        id: "ja3vmdv4",
        title: "I'll research the best practices for JWT.",
      },
      {
        title: "Maybe start with email and password first.",
        user: "Charlie",
        id: "hgh71uvz",
        createdAt: "2025-02-07T16:34:27.314+08:00",
      },
      {
        user: "Charlie",
        id: "9ni2siw4",
        createdAt: "2025-02-07T16:32:28.219+08:00",
        title: "Do we need social login as well?",
      },
      {
        id: "s4zgmj1h",
        createdAt: "2025-02-07T16:30:20.590+08:00",
        user: "Charlie",
        title: "I can work on this.",
      },
    ],
    title: "Implement user authentication",
    description: "Set up login and registration functionality using JWT.",
    createdAt: "2025-02-07T16:28:51.881+08:00",
    commentCount: 4,
  },
];

const insertData = async () => {
  try {
    for (const task of tasks) {
      const { _id, ...taskData } = task; // Use _id as the document ID
      await setDoc(doc(collection(db, "tasks"), _id), taskData); // Save the task data to Firestore
      console.log(`Inserted task: ${task.title}`);
    }
    console.log("All tasks inserted successfully.");
  } catch (error) {
    console.error("Error inserting tasks:", error);
  } finally {
    process.exit(0); // Shutdown the script after execution
  }
};

insertData();