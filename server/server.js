const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const User = require("./models/userSchema");
const Message = require("./models/messageSchema");
const ChatRoom = require("./models/chatRoomSchema");
const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const SECRET_KEY = process.env.TOKEN_SECRET_KEY;
const PORT = process.env.PORT;

const app = express();
app.use(cors());
app.use(bodyParser.json());
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"],
  },
});

// connect to DB
mongoose
  .connect(process.env.ATLAS_URI, { useNewUrlParser: true })
  .then(() => console.log(`Database connected successfully`))
  .catch((err) => console.log(err));

mongoose.Promise = global.Promise;

// track online users
const userSockets = {};

// socket connection
io.on("connection", async (socket) => {
  console.log("A user connected");
  let userId;
  // Handle token verification and user data retrieval
  try {
    userId = await verifyToken(socket.handshake.auth.token); // Extract the user ID from the token
    if (userId) {
      // add user to room identified by userId
      socket.join(userId);
      // add user to userSockets to track online users
      userSockets[userId] = socket;
      const userData = await getUserData(userId);
      // emit data to connected client
      socket.emit("initial-data", userData);
    } else {
      // Handle authentication error
      socket.emit("authentication-error", "Authentication failed");
    }
  } catch (error) {
    console.error("Socket connection error:", error);
    // handle errors
  }

  socket.on("disconnect", () => {
    delete userSockets[userId];
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
const verifyToken = (userToken) => {
  return new Promise((resolve, reject) => {
    jwt.verify(userToken, SECRET_KEY, (err, decoded) => {
      if (err) {
        console.error("Token verification error:", err);
        reject(err); // Token verification error
      } else {
        resolve(decoded.userId); // Successfully verified, resolve with the user ID
      }
    });
  });
};

const getUserData = async (userId) => {
  try {
    const userData = await User.findById(userId)
      .populate({
        path: "chatrooms",
        populate: [
          {
            path: "messages",
          },
          {
            path: "participants",
          },
        ],
      })
      .populate("contacts")
      .exec();
    return userData;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

// auth middleware
const requireAuth = async (req, res, next) => {
  const token = req.headers.authorization;

  const userId = await verifyToken(token);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // attach userId for future use
  req.userId = userId;
  next();
};

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user with the hashed password
    const user = new User({
      name,
      email,
      hashedPassword,
    });

    // Save the user to the database
    await user.save();

    // Generate and send the token
    const token = generateToken(user);
    res.json({ token });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Error registering user" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).exec();

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    const token = generateToken(user);
    res.json({ token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Error during login" });
  }
});

app.post("/add-contact", async (req, res, next) => {
  try {
    const currentUserId = await verifyToken(req.headers.authorization); // The authenticated user's ID
    if (!currentUserId) {
      return res.status(404).json({ error: "Authorization error" });
    }
    const { newContactEmail } = req.body;

    // Validate request body
    if (!newContactEmail) {
      return res.status(400).json({ error: "New contact email is required" });
    }

    // Find the user with the provided email
    const newContactUser = await User.findOne({ email: newContactEmail });

    // Check if the user exists
    if (!newContactUser) {
      return res.status(404).json({ error: "User with that email not found" });
    }

    // Add the new contact to the user's contacts list
    const currentUser = await User.findById(currentUserId);
    currentUser.contacts.push(newContactUser._id);

    // Save the updated users
    await currentUser.save();

    res.json({
      message: "Contact added successfully",
      newContact: newContactUser,
    });
  } catch (error) {
    console.error("Error adding contact:", error);
    res.status(500).json({ error: "Error adding contact" });
  }
});

app.post("/delete-contact", async (req, res, next) => {
  try {
    const currentUserId = await verifyToken(req.headers.authorization); // The authenticated user's ID
    if (!currentUserId) {
      return res.status(404).json({ error: "Authorization error" });
    }
    const { contactId } = req.body;

    // Validate request body
    if (!contactId) {
      return res.status(400).json({ error: "Contact ID is required" });
    }

    // Find the user and remove the contact from the contacts list
    const currentUser = await User.findById(currentUserId);
    currentUser.contacts.pull(contactId);

    // Save the updated user
    await currentUser.save();

    res.json({
      message: "Contact deleted successfully",
      deletedContactId: contactId,
    });
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).json({ error: "Error deleting contact" });
  }
});

app.post("/create-chat", async (req, res, next) => {
  const { participants } = req.body;

  try {
    // Create a new chatroom with the provided participants
    const chatRoom = new ChatRoom({
      participants,
    });

    // Save the chatroom to the database
    const savedChatRoom = await chatRoom.save();

    const populatedChatRoom = await ChatRoom.findById(savedChatRoom._id)
      .populate("participants")
      .exec();

    for (const participantId of participants) {
      // Find the participant user
      const user = await User.findById(participantId);

      if (user) {
        // Add the chatroom's _id to the user's chatrooms array
        user.chatrooms.push(savedChatRoom._id);
        await user.save();
      }
    }

    res.json(populatedChatRoom);
  } catch (error) {
    console.error("Error creating chat room:", error);
    res.status(500).json({ error: "Error creating chat room" });
  }
});

app.post("/create-group-chat", requireAuth, async (req, res, next) => {
  const userId = req.userId;
  const { participants, chatName } = req.body;

  try {
    participants.push(userId);
    const chatRoom = new ChatRoom({
      admins: [userId],
      participants,
      name: chatName,
    });

    const savedChatRoom = await chatRoom.save();

    const populatedChatRoom = await ChatRoom.findById(savedChatRoom._id)
      .populate("participants")
      .exec();

    for (const participantId of participants) {
      // Find the participant user
      const user = await User.findById(participantId);

      if (user) {
        // Add the chatroom's _id to the user's chatrooms array
        user.chatrooms.push(savedChatRoom._id);
        await user.save();
      }
    }
    res.json(populatedChatRoom);
  } catch (error) {
    console.error("Error creating group chat: ", error);
    res.status(500).json({ error: "Error creating group chat" });
  }
});

app.post("/promote-to-admin", requireAuth, async (req, res, next) => {
  try {
    const userId = req.userId;
    const { chatRoomId, chatMemberId } = req.body;

    const chatRoom = await ChatRoom.findById(chatRoomId);

    if (!chatRoom) {
      return res.status(404).json({ error: "Chat room not found" });
    }

    if (!chatRoom.admins.includes(userId)) {
      return res.status(401).json({
        error: "Unauthorized - You are not the owner of this chat room",
      });
    }

    chatRoom.admins.push(chatMemberId);
    await chatRoom.save();
    res.json(chatRoom);

  } catch(error) {
    console.error("Error promoting to admin: ", error);
    res.status(500).json({ error: "Error promoting to admin" });
  }
})

app.post("/delete-chatroom", requireAuth, async (req, res, next) => {
  try {
    const userId = req.userId;
    const { chatRoomId } = req.body;

    // Find the chat room
    const chatRoom = await ChatRoom.findById(chatRoomId);

    // Check if the chat room exists
    if (!chatRoom) {
      return res.status(404).json({ error: "Chat room not found" });
    }

    // Check if the user is the owner of the chat room
    if (!chatRoom.admins.includes(userId)) {
      return res.status(401).json({
        error: "Unauthorized - You are not the owner of this chat room",
      });
    }

    // If the user is the owner, delete the chat room
    await ChatRoom.deleteOne({ _id: chatRoomId });

    res.json({ message: "Chat room deleted successfully", chatRoomId });
  } catch (error) {
    console.error("Error deleting chat room:", error);
    res.status(500).json({ error: "Error deleting chat room" });
  }
});

app.post("/messages/new", async (req, res, next) => {
  const { text, sender, chatRoom } = req.body;
  try {
    // create new message
    const newMessage = new Message({
      text,
      sender,
      chatRoom,
    });

    // save new message to db
    await newMessage.save();

    // add message id to corresponding chatroom's message array
    const chatroom = await ChatRoom.findById(chatRoom);
    chatroom.messages.push(newMessage._id);
    await chatroom.save();

    // get chatroom's participants
    const participants = chatroom.participants;

    // emit the message to the chatroom's participants
    participants.forEach(async (participantId) => {
      const participantSocket = userSockets[participantId];
      if (participantSocket) {
        participantSocket.emit("message", newMessage); // Emit the message to the user's socket
      }
    });

    res.json({ message: "Message sent successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error sending the message" });
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
