import React, { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import '../../component-styles/DMButton.css';

const DMButton = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const { currentUser } = useAuth();

    const toggleDM = () => {
        setIsOpen(!isOpen);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        // Add user message to DM
        const userMessage = {
            text: message,
            sender: 'user',
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMessage]);
        setMessage('');
        setIsLoading(true);

        // TODO: Implement actual DM functionality with backend
        // For now, just simulate a response
        setTimeout(() => {
            const botMessage = {
                text: "This is a placeholder response. DM functionality will be implemented with backend integration.",
                sender: 'bot',
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, botMessage]);
            setIsLoading(false);
        }, 1000);
    };

    return (
        <div className="dm-container">
            {isOpen && (
                <div className="dm-window">
                    <div className="dm-header">
                        <h3>Direct Messages</h3>
                        <button className="close-button" onClick={toggleDM}>
                            <X size={20} />
                        </button>
                    </div>
                    <div className="dm-messages">
                        {messages.length === 0 && (
                            <div className="message bot-message">
                                Start a conversation!
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
                    <form className="dm-input-container" onSubmit={handleSendMessage}>
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="dm-input"
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
                className={`dm-button ${isOpen ? 'active' : ''}`}
                onClick={toggleDM}
            >
                <MessageSquare size={24} />
            </button>
        </div>
    );
};

export default DMButton; 