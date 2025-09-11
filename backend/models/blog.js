const mongoose = require('mongoose');

const blogSchema = mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: {
    type: Number,
    default: 0, // the default option guarantees that certain fields always have a value, even if not explicity provided during creation
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  comments: [
    {
      text: { type: String, required: true },
      date: { type: Date, default: Date.now }
    }
  ]
});

// Automatically enforce a max of 10 comments
blogSchema.pre('save', function (next) {
  if (this.comments.length > 10) {
    // Keep only the newest 10 comments, delete the oldest
    this.comments = this.comments.slice(-10);
  }
  next();
});

blogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model('Blog', blogSchema);