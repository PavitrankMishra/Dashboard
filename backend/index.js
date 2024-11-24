const express = require("express");
const path = require("path");
const app = express();
const fs = require("fs");
const port = 5000;

const cors = require("cors");
app.use(cors());

app.use(express.json());

// Route to get all the users

app.get("/", (req, res) => {
  const filePath = path.join(__dirname, "db.json");
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.log("Error reading file: " + err);
      res.status(500).send({ error: "Unable to read data file" });
    } else {
      res.setHeader("Content-Type", "application/json");
      res.send(data);
    }
  });
});

// Route to get a single user

app.get("/api/users/:id", (req, res) => {
  const filePath = path.join(__dirname, "db.json");
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.log("Error reading file: " + err);
      res.status(500).send({ error: "Unable to read file " });
    } else {
      const users = JSON.parse(data).users;
      const user = users.find((u) => u.id === parseInt(req.params.id));
      if (user) {
        res.json(user);
      } else {
        res.status(404).send({ error: "User not found" });
      }
    }
  });
});

// Route to add a new user
app.post("/api/users", (req, res) => {
  const { id, name, age, country, role, status } = req.body;

  const newUser = { id, name, age, country, role, status };
  const filePath = path.join(__dirname, "db.json");

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.log("Error reading file: " + err);
      res.status(500).send({ error: "Unable to read data file" });
      return;
    }

    let usersData;
    try {
      usersData = JSON.parse(data);
    } catch (err) {
      console.log("Error parsing JSON: " + err);
      res.status(500).send({ error: "Data corruption" });
      return;
    }

    // Update the `id` dynamically to avoid duplicates
    newUser.id =
      usersData.users.length > 0
        ? usersData.users[usersData.users.length - 1].id + 1
        : 1;

    usersData.users.push(newUser);

    fs.writeFile(filePath, JSON.stringify(usersData, null, 2), (err) => {
      if (err) {
        console.error("Error writing to file:", err);
        res.status(500).send({ error: "Unable to save user" });
        return;
      }
      console.log("New user added successfully!");
      res.status(200).send(newUser);
    });
  });
});

// Route to update an existing user by ID

app.put("/api/users/:id", (req, res) => {
  const userId = parseInt(req.params.id);
  const { name, email, age } = req.body;
  const filePath = path.join(__dirname, "db.json");

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).send({ message: "Error reading data file" });
    }

    const userData = JSON.parse(data);
    const userIndex = userData.users.findIndex((user) => user.id === userId);

    if (userIndex === -1) {
      return res.status(404).send({ message: "User not found" });
    }

    userData.users[userIndex] = {
      ...userData.users[userIndex],
      name,
      email,
      age,
    };

    fs.writeFile(filePath, JSON.stringify(userData, null, 2), (err) => {
      if (err) {
        return res.status(500).send({ message: "Error saving data" });
      }
      res.status(200).send(userData.users[userIndex]);
    });
  });
});

// Route to delete a user by ID

app.delete("/api/users/:id", (req, res) => {
  const userId = parseInt(req.params.id);
  const filePath = path.join(__dirname, "db.json");

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.log("Error reading file");
      res.status(500).send({ message: "Unable to read data file" });
      return;
    }

    let userData;
    try {
      userData = JSON.parse(data);
    } catch (error) {
      console.log("Error parsing json: " + err);
      res.status(500).send({ error: "Data corruption" });
    }

    const updatedUsers = userData.users.filter((user) => user.id !== userId);

    if (updatedUsers.length == userData.users.length) {
      res.status(400).send({ error: "User not found" });
      return;
    }

    userData.users = updatedUsers;

    fs.writeFile(filePath, JSON.stringify(userData, null, 2), (err) => {
      if (err) {
        console.error("Unable to write file: ", err);
        res.status(500).send({ error: "Unable to save updated file: " });
        return;
      }
      console.log("User deleted successfully");
      res.status(200).send({ message: "User updated successfully" });
    });
  });
});
app.get("/", (req, res) => {
  res.send({ message: "Response from server! " });
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
  console.log(`JSON Server running at http://localhost:${port}/api`);
});
