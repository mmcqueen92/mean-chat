const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: {
    type: String,
    required: [true, "The name field is required"],
  },
  email: {
    type: String,
    required: [true, "The email field is required"],
    unique: true,
  },
  hashedPassword: {
    type: String,
    required: [true, "The hashedPassword field is required"],
  },
  chatrooms: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "chatRoom",
      },
    ],
    default: [],
  },
  contacts: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    default: [],
  }
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    const isMatch = await bcrypt.compare(
      candidatePassword,
      this.hashedPassword
    );
    return isMatch;
  } catch (err) {
    throw err;
  }
};

const User = mongoose.model("user", UserSchema);

module.exports = User;
