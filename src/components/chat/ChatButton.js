import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import '../../component-styles/ChatButton.css';

const ChatButton = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const { currentUser } = useAuth();

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        // Add user message to chat
        const userMessage = {
            text: message,
            sender: 'user',
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMessage]);
        setMessage('');
        setIsLoading(true);

        try {
            const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': process.env.REACT_APP_GEMINI_API_KEY
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: message
                        }]
                    }]
                })
            });

            const data = await response.json();
            
            if (data.candidates && data.candidates[0].content) {
                const botMessage = {
                    text: data.candidates[0].content.parts[0].text,
                    sender: 'bot',
                    timestamp: new Date().toISOString()
                };
                setMessages(prev => [...prev, botMessage]);
            }
        } catch (error) {
            console.error('Error sending message to Gemini:', error);
            const errorMessage = {
                text: "Sorry, I'm having trouble connecting right now. Please try again later.",
                sender: 'bot',
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chat-container">
            {isOpen && (
                <div className="chat-window">
                    <div className="chat-header">
                        <h3>Chat Support</h3>
                        <button className="close-button" onClick={toggleChat}>
                            <X size={20} />
                        </button>
                    </div>
                    <div className="chat-messages">
                        {messages.length === 0 && (
                            <div className="message bot-message">
                                Hi {currentUser?.userName || 'there'}, how can I help you today?
                            </div>
                        )}
                        {messages.map((msg, index) => (
                            <div 
                                key={index} 
                                className={`message ${msg.sender === 'bot' ? 'bot-message' : 'user-message'}`}
                            >
                                {msg.text}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="message bot-message loading">
                                <div className="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        )}
                    </div>
                    <form className="chat-input-container" onSubmit={handleSendMessage}>
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="chat-input"
                            disabled={isLoading}
                        />
                        <button 
                            type="submit" 
                            className="send-button"
                            disabled={isLoading || !message.trim()}
                        >
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            )}
            <button 
                className={`chat-button ${isOpen ? 'active' : ''}`}
                onClick={toggleChat}
            >
                <MessageCircle size={24} />
            </button>
        </div>
    );
};

export default ChatButton; 