import { model, Schema } from 'mongoose';

const noteSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Note title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    content: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        trim: true,
        default: 'General'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tags: {
        type: [String],
        default: []
    },
    isFavorite: {
        type: Boolean,
        default: false
    },
    isPrivate: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

noteSchema.index({ author: 1, category: 1, status: 1 });
noteSchema.index({ title: 'text', content: 'text', tags: 'text' });

const Note = model('Note', noteSchema);

export default Note;