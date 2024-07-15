import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../Css/BlogChatbot.css';

const BlogChatbot = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        setMessages([{ text: "Hello! How can I help you with the blog today?", user: false }]);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { text: input, user: true };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const token = localStorage.getItem("authToken");
            if (!token) {
                throw new Error("Authentication token is missing");
            }

            const { data } = await axios.post('/story/chatbot', 
                { query: input },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const botMessage = { text: data.response, user: false };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {

            if (error.response && error.response.status === 401) {
                localStorage.removeItem("authToken");
                navigate('/login');
            } else {
                setMessages(prev => [...prev, { text: "I'm having trouble responding right now. Please try again later.", user: false }]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`chatbot-container ${isOpen ? 'open' : ''}`}>
            <button className="chatbot-toggle" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? 'Close Chat' : 'Open Chat'}
            </button>
            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.user ? 'user' : 'bot'}`}>
                                {msg.text}
                            </div>
                        ))}
                    </div>
                    <form onSubmit={handleSubmit} className="chatbot-input-form">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about the blog..."
                        />
                        <button type="submit" disabled={isLoading}>
                            {isLoading ? 'Sending...' : 'Send'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default BlogChatbot;

