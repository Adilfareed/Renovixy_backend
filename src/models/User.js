const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  username: { type: String, default: 'user11' },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['user','admin'], default: 'user' },
    profilePic: {
      url: {
        type: String,
        default:
          'https://www.dreamstime.com/default-avatar-profile-icon-social-media-user-vector-image-image209162840'
      },
      public_id: {
        type: String,
        default: null
      }
    },
  phoneNumber: String,
  address: String
}, { timestamps: true });

userSchema.pre('save', async function(next){
  if(!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function(entered){
  return await bcrypt.compare(entered, this.password);
};

userSchema.methods.getSignedJwtToken = function(){
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
};

module.exports = mongoose.model('User', userSchema);
