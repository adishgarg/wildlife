require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const Report = require('./models/Report');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const mongoURI = "mongodb+srv://gargadi456:adish@cluster0.3k4jxw0.mongodb.net/?appName=Cluster0";
mongoose.connect(mongoURI)
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
// Get all reports
app.get('/api/reports', async (req, res) => {
    try {
        const reports = await Report.find().sort({ createdAt: -1 });
        res.json(reports);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
});

// Create a new report
app.post('/api/reports', async (req, res) => {
    try {
        const { location, latitude, longitude, type, description } = req.body;
        
        const newReport = new Report({
            location,
            latitude,
            longitude,
            type,
            description
        });
        
        const savedReport = await newReport.save();
        res.status(201).json(savedReport);
    } catch (err) {
        console.error('Error saving report:', err);
        res.status(500).json({ error: 'Failed to save report' });
    }
});

// Start Server
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}
module.exports = app;
