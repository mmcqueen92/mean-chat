const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("./models/userSchema");
const Message = require("./models/messageSchema");
const ChatRoom = require("./models/chatRoomSchema");

router.post("/new-message", (req, res) => {
  // get message data from request body
  const { text, sender, chatRoom } = req.body;

  // check if sender and chat room exist
  User.findById(sender, (err, senderUser) => {
    if (err || !senderUser) {
      return res.status(400).json({ error: "Sender not found" });
    }

    ChatRoom.findById(chatRoom, (err, chatRoomDoc) => {
      if (err || !chatRoomDoc) {
        return res.status(400).json({ error: "Chat room not found" });
      }

      // create and save new message
      const newMessage = new Message({
        text,
        sender,
        chatRoom,
      });

      newMessage.save((err, savedMessage) => {
        if (err) {
          return res.status(500).json({ error: "Error saving message" });
        }

        // update chat room's messages array
        ChatRoom.findByIdAndUpdate(
          chatRoom,
          { $push: { messages: savedMessage._id } },
          (err) => {
            if (err) {
              return res
                .status(500)
                .json({ error: "Error updating chat room" });
            }

            // Message created and associated with the chat room
            res.status(201).json({ message: "Message created" });
          }
        );
      });
    });
  });
});

module.exports = router;
