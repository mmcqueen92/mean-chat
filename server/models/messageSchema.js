const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  text: String, // content
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // user who sent the message
  },
  chatRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ChatRoom", // chat room where the message was sent
  },
  timestamp: {
    type: Date,
    default: Date.now, // The timestamp of the message
  },
});

const Message = mongoose.model('message', MessageSchema)

module.exports = Message;
