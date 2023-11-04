const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ChatRoomSchema = new Schema({
  name: String, // chat room name
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  messages: {
    type: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "message",
    },
  ],
default: []},
});

const ChatRoom = mongoose.model('chatRoom', ChatRoomSchema)

module.exports = ChatRoom;