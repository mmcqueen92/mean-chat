const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const User = require("./models/userSchema");
const Message = require("./models/messageSchema");
const ChatRoom = require("./models/chatRoomSchema");
const apiRouter = require("./routes/api");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const SECRET_KEY = process.env.TOKEN_SECRET_KEY;

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

// generate JWT token
const generateToken = (user) => {
  const payload = { userId: user.id };

  const options = { expiresIn: "24h" };

  return jwt.sign(payload, SECRET_KEY, options);
};

// verify JWT token
const verifyToken = (token) => {

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    return decoded.userId;
  } catch (err) {
    return null;
  }
};

// auth middleware
const requireAuth = (req, res, next) => {
  const token = req.headers.authorization;

  const userId = verifyToken(token);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // attach userId for future use
  req.userId = userId;
  next();
};

app.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  // Hash password
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

    // verify the password
    user.comparePassword(password, (err, isMatch) => {
      if (err || !isMatch) {
        return res.status(401).json({ error: "Incorrect password" });
      }

      // generate a JWT token and send back to client
      const token = generateToken(user);
      res.json({ token });
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
