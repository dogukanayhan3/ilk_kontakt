import React, { useState } from "react";
import { X, Send } from "lucide-react";

// Mock data for contacts
const mockContacts = [
  { id: "1", name: "Alice Smith" },
  { id: "2", name: "Bob Johnson" },
  { id: "3", name: "Charlie Brown" },
];

// Mock data for messages per contact
const mockMessages = {
  1: [
    { sender: "me", text: "Hi Alice!", timestamp: "2024-06-01T10:00:00Z" },
    { sender: "Alice", text: "Hello!", timestamp: "2024-06-01T10:01:00Z" },
  ],
  2: [
    { sender: "me", text: "Hey Bob!", timestamp: "2024-06-01T11:00:00Z" },
    { sender: "Bob", text: "Hi there!", timestamp: "2024-06-01T11:01:00Z" },
  ],
  3: [
    { sender: "me", text: "Yo Charlie!", timestamp: "2024-06-01T12:00:00Z" },
    { sender: "Charlie", text: "Hey!", timestamp: "2024-06-01T12:01:00Z" },
  ],
};

const DMWindow = ({ onClose }) => {
  const [selectedContact, setSelectedContact] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  // Update messages when contact changes
  React.useEffect(() => {
    if (selectedContact) {
      setMessages(mockMessages[selectedContact] || []);
    } else {
      setMessages([]);
    }
  }, [selectedContact]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    const newMsg = {
      sender: "me",
      text: message,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMsg]);
    setMessage("");
    // In real app, send to backend here
  };

  return (
    <div className="dmwindow-overlay">
      <div className="dmwindow single-panel">
        {!selectedContact ? (
          <div className="dmwindow-left full">
            <div className="dmwindow-header">Contacts</div>
            <ul className="dmwindow-contact-list">
              {mockContacts.map((contact) => (
                <li
                  key={contact.id}
                  className={`dmwindow-contact-item${
                    selectedContact === contact.id ? " selected" : ""
                  }`}
                  onClick={() => setSelectedContact(contact.id)}
                >
                  {contact.name}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="dmwindow-right full">
            <div className="dmwindow-header dmwindow-chat-header">
              <button
                className="dmwindow-back"
                onClick={() => setSelectedContact(null)}
              >
                &#8592; Back
              </button>
              <span>
                {mockContacts.find((c) => c.id === selectedContact)?.name}
              </span>
              <button className="dmwindow-close" onClick={onClose}>
                <X size={20} />
              </button>
            </div>
            <div className="dmwindow-messages">
              {messages.length === 0 && (
                <div className="dmwindow-message bot-message">
                  Start a conversation!
                </div>
              )}
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`dmwindow-message ${
                    msg.sender === "me" ? "user-message" : "bot-message"
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>
            <form
              className="dmwindow-input-container"
              onSubmit={handleSendMessage}
            >
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="dmwindow-input"
              />
              <button type="submit" className="dmwindow-send">
                <Send size={20} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default DMWindow;
