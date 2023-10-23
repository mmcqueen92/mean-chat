const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const User = require("./models/userSchema");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(bodyParser.json());
app.use(cors());

// connect to DB
mongoose
  .connect(process.env.ATLAS_URI, { useNewUrlParser: true })
  .then(() => console.log(`Database connected successfully`))
  .catch((err) => console.log(err));

mongoose.Promise = global.Promise;

// websocket setup
io.on("connection", (socket) => {
  console.log("A user connected");

  // Handle messages, room joining, etc.

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  const payload = { userId: user.id };
  const secret = "your-secret-key";
  const options = { expiresIn: "24h" };

  return jwt.sign(payload, secret, options);
};

const verifyToken = (token) => {
  const secret = "your-secret-key";

  try {
    const decoded = jwt.verify(token, secret);
    return decoded.userId;
  } catch (err) {
    return null;
  }
};

app.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  // Hash password before saving
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ error: "Error hashing password" });
    }

    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    user.save((err, user) => {
      if (err) {
        return res.status(400).json({ error: "Error registering user" });
      }

      const token = generateToken(user);
      res.json({ token });
    });
  });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email }, (err, user) => {
    if (err) {
      return res.status(500).json({ error: "Error finding user" });
    }

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Verify the password
    user.comparePassword(password, (err, isMatch) => {
      if (err || !isMatch) {
        return res.status(401).json({ error: "Incorrect password" });
      }

      // Generate a JWT token and send it back to the client
      const token = generateToken(user);
      res.json({ token });
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
