const natural = require('natural');
const Story = require('../Models/story');

const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;

const processChatbotQuery = async (req, res) => {
    const { query } = req.body;

    try {
        const stories = await Story.find().select('title content');
        const tfidf = new TfIdf();

        stories.forEach((story, index) => {
            tfidf.addDocument(`${story.title} ${story.content}`);
        });

        const queryTokens = tokenizer.tokenize(query.toLowerCase());
        const results = [];

        tfidf.tfidfs(queryTokens, (i, measure) => {
            results.push({ index: i, score: measure });
        });

        results.sort((a, b) => b.score - a.score);

        let response = "Based on the blog content, here's what I found:\n\n";

        if (results.length > 0 && results[0].score > 0) {
            const topResult = stories[results[0].index];
            response += `The most relevant post is "${topResult.title}".\n`;
            response += `Here's a snippet: ${topResult.content.substring(0, 150)}...`;
        } else {
            response += "I couldn't find any directly relevant information to your query in the blog posts.";
        }

        res.json({ response });
    } catch (error) {
        console.error('Chatbot Error:', error);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
};

module.exports = { processChatbotQuery };
