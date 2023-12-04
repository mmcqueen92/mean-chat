const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ChatRoomSchema = new Schema({
  name: String,
  admins: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    default: [],
  },
  participants: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
      lastVisit: {
        type: Date,
        default: null,
      },
    },
  ],
  messages: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "message",
      },
    ],
    default: [],
  },
  lastUpdate: {
    type: Date,
    default: Date.now,
  },
});

const ChatRoom = mongoose.model("chatRoom", ChatRoomSchema);

module.exports = ChatRoom;
