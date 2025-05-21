import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import '../../component-styles/ChatButton.css';

const ChatButton = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const { currentUser } = useAuth();

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (message.trim()) {
            // For now, just clear the input
            setMessage('');
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
                        <div className="message bot-message">
                            Hi {currentUser?.userName || 'there'}, how can I help you today?
                        </div>
                    </div>
                    <form className="chat-input-container" onSubmit={handleSendMessage}>
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="chat-input"
                        />
                        <button type="submit" className="send-button">
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