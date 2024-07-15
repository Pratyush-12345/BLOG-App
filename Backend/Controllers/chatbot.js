const axios = require('axios');
const Story = require('../Models/story');
const { SummarizerManager } = require('node-summarizer');

const stripHtmlTags = (html) => {
    return html.replace(/<[^>]*>/g, '');
};

const summarizeText = (text) => {
    const cleanText = stripHtmlTags(text);
    const sentences = cleanText.split('.');
    return sentences.slice(0, 3).join('. ') + '.';
};

const processChatbotQuery = async (req, res) => {
    const { storyId } = req.body;

    try {
        const story = await Story.findById(storyId);
        if (!story) {
            return res.status(404).json({ error: 'Story not found' });
        }

        const summary = await summarizeText(story.content);

        res.json({ 
            title: story.title,
            summary: summary
        });
    } catch (error) {
        console.error('Chatbot Error:', error);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
};

module.exports = { processChatbotQuery };

