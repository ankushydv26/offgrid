const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Node Schema
const NodeSchema = new mongoose.Schema({
    text: String,
    meaning: String,
    relatedSentences: [String],
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Node' }]
});
const NodeModel = mongoose.model('Node', NodeSchema);

// Create Node
app.post('/nodes', async (req, res) => {
    try {
        const { text, meaning, relatedSentences, parentId } = req.body;
        const newNode = new NodeModel({ text, meaning, relatedSentences });

        if (parentId) {
            const parent = await NodeModel.findById(parentId);
            parent.children.push(newNode._id);
            await parent.save();
        }

        await newNode.save();
        res.json(newNode);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get All Nodes
app.get('/nodes', async (req, res) => {
    try {
        const nodes = await NodeModel.find().populate('children');
        res.json(nodes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a Specific Node by ID
app.get('/nodes/:id', async (req, res) => {
    try {
        const node = await NodeModel.findById(req.params.id).populate('children');
        res.json(node);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// AI Query Route using Gemini

app.post('/ai-query', async (req, res) => {
    try {
        const { question } = req.body;

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                contents: [{ parts: [{ text: question }] }]
            },
            { headers: { 'Content-Type': 'application/json' } }
        );

        // Extracting the AI response text
        const aiAnswer = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No AI response received.";

        res.json({ answer: aiAnswer });

    } catch (err) {
        console.error("❌ AI Query Error:", err.response?.data || err.message);
        res.status(500).json({ error: "AI request failed. Check API key & request format." });
    }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
