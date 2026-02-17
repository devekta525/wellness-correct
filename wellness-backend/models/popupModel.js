import { model, Schema } from "mongoose";

const fieldSchema = new Schema({
  fieldName: {
    type: String,
    trim: true
  },
  fieldType: {
    type: String,
    enum: ['Text', 'Email', 'Tel', 'Number', 'Date'],
    default: 'Text'
  },
  isRequired: {
    type: Boolean,
    default: false
  },
  _id: false
});

const popupSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  heading: {
    type: String,
    required: true,
    trim: true
  },
  subheading: {
    type: String,
    required: true,
    trim: true
  },
  delay: {
    type: Number,
    required: true,
    default: 5,
    min: 0
  },
  image: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Active', 'Inactive'],
    default: "Active",
  },
  // Button settings
  ctaButtonText: {
    type: String,
    required: true,
    trim: true
  },
  secondaryButtonText: {
    type: String,
    trim: true
  },
  buttonAction: {
    type: String,
    required: true,
    trim: true
  },
  // Badge settings
  badgeText: {
    type: String,
    trim: true
  },
  badgeVisible: {
    type: Boolean,
    default: true
  },
  showCloseIcon: {
    type: Boolean,
    default: true
  },
  // Form fields for special offer template
  fields: {
    type: [fieldSchema],
    default: []
  },
  // Color options
  backgroundColor: {
    type: String,
    default: '#ffffff'
  },
  textColor: {
    type: String,
    default: '#000000'
  },
  buttonColor: {
    type: String,
    default: '#000000'
  },
  buttonTextColor: {
    type: String,
    default: '#ffffff'
  },
  borderColor: {
    type: String,
    default: '#000000'
  },
}, { timestamps: true });

const Popup = model('Popup', popupSchema);

export default Popup;