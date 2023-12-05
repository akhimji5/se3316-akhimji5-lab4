const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ListSchema = new Schema({
  listName: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  superheroes: {
    type: [Number],
    default: []
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    ref: 'User'
  },
  userName: {
    type: String,
    required: true 
  },
  reviews: [{
    reviewerName: String,
    comment: String,
    rating: Number,
    hidden: { type: Boolean, default: false },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

const List = mongoose.model('List', ListSchema);

module.exports = List;