
import { model, Schema } from "mongoose";

const newsLetterSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Subscribed', 'Unsubscribed'],
    default: 'Subscribed'
  }
}, { timestamps: true });

const NewsLetter = model("NewsLetter", newsLetterSchema);

export default NewsLetter;