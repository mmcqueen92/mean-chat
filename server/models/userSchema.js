const mongoose = require("mongoose");
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
    required: [true, "The password field is required"],
  },
});

UserSchema.methods.comparePassword = function (candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) return callback(err);
    callback(null, isMatch);
  });
};

const User = mongoose.model('user', UserSchema);

module.exports = User;