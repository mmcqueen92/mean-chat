const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ChatRoomSchema = new Schema({
  name: String, // chat room name
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  messages: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  ],
});

const ChatRoom = mongoose.model('chatRoom', ChatRoomSchema)

module.exports = ChatRoom;