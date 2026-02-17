import InfluencerNote from "../models/influencerNoteModel.js";

export const createInfluencerNote = async (req, res) => {
  try {
    const { title, content, category, tags, priority, status, isPrivate } = req.body;

    const newNote = await InfluencerNote.create({
      title,
      content,
      category,
      tags: tags ? tags.split(",").map(tag => tag.trim()) : [],
      priority,
      status,
      isPrivate,
      author: req.user._id
    });

    await newNote.populate("author", "firstName lastName email imageUrl");

    res.status(201).json({ success: true, data: newNote, message: "Note created successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getInfluencerNotes = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      search,
      category,
      status,
      priority,
      isFavorite,
      sortBy = "updatedAt",
      sortOrder = "desc"
    } = req.query;

    let query = { author: userId };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } }
      ];
    }

    if (category && category !== "all") query.category = category;
    if (status && status !== "all") query.status = status;
    if (priority && priority !== "all") query.priority = priority;
    if (isFavorite === "true") query.isFavorite = true;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    const notes = await InfluencerNote.find(query)
      .populate("author", "firstName lastName email imageUrl")
      .sort(sortOptions);

    res.status(200).json({ success: true, count: notes.length, data: notes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getInfluencerNoteById = async (req, res) => {
  try {
    const note = await InfluencerNote.findOne({ _id: req.params.id, author: req.user._id })
      .populate("author", "firstName lastName");

    if (!note) {
      return res.status(404).json({ success: false, message: "Note not found" });
    }

    res.status(200).json({ success: true, data: note });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateInfluencerNote = async (req, res) => {
  try {
    const { id } = req.params;
    let { tags } = req.body;

    if (tags && typeof tags === 'string') {
      req.body.tags = tags.split(",").map(tag => tag.trim());
    }

    const note = await InfluencerNote.findOneAndUpdate(
      { _id: id, author: req.user._id },
      req.body,
      { new: true, runValidators: true }
    ).populate("author", "firstName lastName");

    if (!note) {
      return res.status(404).json({ success: false, message: "Note not found or unauthorized" });
    }

    res.status(200).json({ success: true, data: note, message: "Note updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteInfluencerNote = async (req, res) => {
  try {
    const note = await InfluencerNote.findOneAndDelete({ _id: req.params.id, author: req.user._id });

    if (!note) {
      return res.status(404).json({ success: false, message: "Note not found or unauthorized" });
    }

    res.status(200).json({ success: true, message: "Note deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleInfluencerNoteFavorite = async (req, res) => {
  try {
    const note = await InfluencerNote.findOne({ _id: req.params.id, author: req.user._id });

    if (!note) {
      return res.status(404).json({ success: false, message: "Note not found" });
    }

    note.isFavorite = !note.isFavorite;
    await note.save();

    res.status(200).json({ success: true, data: note, message: "Favorite status updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};