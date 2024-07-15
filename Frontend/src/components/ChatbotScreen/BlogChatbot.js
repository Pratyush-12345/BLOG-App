import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../Css/BlogChatbot.css';

const BlogChatbot = () => {
    const [messages, setMessages] = useState([]);
    const [selectedStory, setSelectedStory] = useState('');
    const [stories, setStories] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            navigate('/login');
        } else {
            fetchStories();
        }
    }, [navigate]);

    const fetchStories = async () => {
        try {
            const { data } = await axios.get('/story/getAllStories');
            setStories(data.data);
        } catch (error) {
            console.error('Error fetching stories:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedStory) return;

        setIsLoading(true);

        try {
            const token = localStorage.getItem("authToken");
            if (!token) {
                throw new Error("Authentication token is missing");
            }

            const { data } = await axios.post('/story/chatbot', 
                { storyId: selectedStory },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const botMessage = { 
                title: data.title,
                summary: data.summary, 
                user: false 
            };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                localStorage.removeItem("authToken");
                navigate('/login');
            } else {
                setMessages(prev => [...prev, { text: "I'm having trouble summarizing right now. Please try again later.", user: false }]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`chatbot-container ${isOpen ? 'open' : ''}`}>
            <button className="chatbot-toggle" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? 'Close Summarizer' : 'Open Summarizer'}
            </button>
            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.user ? 'user' : 'bot'}`}>
                                {msg.title && <h4>{msg.title}</h4>}
                                {msg.summary}
                            </div>
                        ))}
                    </div>
                    <form onSubmit={handleSubmit} className="chatbot-input-form">
                        <select 
                            value={selectedStory} 
                            onChange={(e) => setSelectedStory(e.target.value)}
                        >
                            <option value="">Select a story to summarize</option>
                            {stories.map(story => (
                                <option key={story._id} value={story._id}>{story.title}</option>
                            ))}
                        </select>
                        <button type="submit" disabled={isLoading || !selectedStory}>
                            {isLoading ? 'Summarizing...' : 'Summarize'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default BlogChatbot;


