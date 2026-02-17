import mongoose from 'mongoose';
import Note from '../models/notesModel.js';
import { Parser } from 'json2csv';

const isId = (id) => mongoose.isValidObjectId(id);

export const createNote = async (req, res) => {
    try {
        const authorId = req.user._id;
        const noteData = { ...req.body, author: authorId };

        if (noteData.tags && typeof noteData.tags === 'string') {
            noteData.tags = noteData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
        }

        const newNote = await Note.create(noteData);
        const populatedNote = await Note.findById(newNote._id).populate('author', 'firstName lastName');
        
        res.status(201).json({ success: true, data: populatedNote });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const listNotes = async (req, res) => {
    try {
        const authorId = req.user._id;
        const {
            page = 1,
            limit = 10,
            category,
            status,
            priority,
            search,
            sortBy = 'updatedAt',
            sortOrder = 'desc'
        } = req.query;

        const filter = { author: authorId };
        if (category && category !== 'all') filter.category = category;
        if (status && status !== 'all') filter.status = status;
        if (priority && priority !== 'all') filter.priority = priority;

        if (search) {
            filter.$text = { $search: search };
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const notes = await Note.find(filter)
            .populate('author', 'firstName lastName')
            .sort(sortOptions)
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await Note.countDocuments(filter);

        res.json({
            success: true,
            data: notes,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getNoteById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isId(id)) return res.status(400).json({ success: false, message: 'Invalid ID' });

        const note = await Note.findOne({ _id: id, author: req.user._id })
            .populate('author', 'firstName lastName');

        if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
        res.json({ success: true, data: note });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const updateNote = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isId(id)) return res.status(400).json({ success: false, message: 'Invalid ID' });

        const updateData = { ...req.body };
        if (updateData.tags && typeof updateData.tags === 'string') {
            updateData.tags = updateData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
        }

        const updatedNote = await Note.findOneAndUpdate(
            { _id: id, author: req.user._id },
            updateData,
            { new: true, runValidators: true }
        ).populate('author', 'firstName lastName');

        if (!updatedNote) return res.status(404).json({ success: false, message: 'Note not found' });
        res.json({ success: true, data: updatedNote });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const deleteNote = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isId(id)) return res.status(400).json({ success: false, message: 'Invalid ID' });

        const deletedNote = await Note.findOneAndDelete({ _id: id, author: req.user._id });

        if (!deletedNote) return res.status(404).json({ success: false, message: 'Note not found' });
        res.json({ success: true, message: 'Note deleted successfully', id });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const toggleFavoriteNote = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isId(id)) return res.status(400).json({ success: false, message: 'Invalid ID' });

        const note = await Note.findOne({ _id: id, author: req.user._id });
        if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

        note.isFavorite = !note.isFavorite;
        await note.save();

        res.json({ success: true, data: note });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getNoteStats = async (req, res) => {
    try {
        const authorId = req.user._id;
        const [
            totalNotes,
            publishedNotes,
            favoriteNotes,
            draftNotes
        ] = await Promise.all([
            Note.countDocuments({ author: authorId }),
            Note.countDocuments({ author: authorId, status: 'published' }),
            Note.countDocuments({ author: authorId, isFavorite: true }),
            Note.countDocuments({ author: authorId, status: 'draft' })
        ]);
        
        res.json({
            success: true,
            data: {
                totalNotes,
                publishedNotes,
                favoriteNotes,
                draftNotes
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const exportNotes = async (req, res) => {
    try {
        const authorId = req.user._id;
        const notes = await Note.find({ author: authorId }).lean();

        if (notes.length === 0) {
            return res.status(404).json({ success: false, message: 'No notes to export' });
        }

        const fields = [
            { label: 'Title', value: 'title' },
            { label: 'Category', value: 'category' },
            { label: 'Status', value: 'status' },
            { label: 'Priority', value: 'priority' },
            { label: 'Favorite', value: 'isFavorite' },
            { label: 'Tags', value: row => row.tags.join(', ') },
            { label: 'Created At', value: 'createdAt' },
            { label: 'Updated At', value: 'updatedAt' },
            { label: 'Content (Plain Text)', value: row => row.content.replace(/<[^>]+>/g, '') }
        ];

        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(notes);

        res.header('Content-Type', 'text/csv');
        res.attachment(`notes-export-${new Date().toISOString()}.csv`);
        res.send(csv);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to export notes', error: error.message });
    }
};