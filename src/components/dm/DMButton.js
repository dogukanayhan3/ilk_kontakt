import React, { useState } from "react";
import { MessageSquare, X, Send } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import "../../component-styles/DMButton.css";

const DMButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useAuth();

  // Mock connections list
  const connections = [
    {
      id: 1,
      name: "Alice Smith",
      profilePic: "https://i.pravatar.cc/150?img=1",
    },
    {
      id: 2,
      name: "Bob Johnson",
      profilePic: "https://i.pravatar.cc/150?img=2",
    },
    {
      id: 3,
      name: "Charlie Lee",
      profilePic: "https://i.pravatar.cc/150?img=3",
    },
  ];
  const [selectedConnection, setSelectedConnection] = useState(null);

  // Store messages per connection
  const [messagesByConnection, setMessagesByConnection] = useState({});

  const toggleDM = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedConnection) return;
    const userMessage = {
      text: message,
      sender: "user",
      timestamp: new Date().toISOString(),
    };
    setMessagesByConnection((prev) => {
      const prevMsgs = prev[selectedConnection.id] || [];
      return { ...prev, [selectedConnection.id]: [...prevMsgs, userMessage] };
    });
    setMessage("");
    setIsLoading(true);
    setTimeout(() => {
      const botMessage = {
        text: "This is a placeholder response. DM functionality will be implemented with backend integration.",
        sender: "bot",
        timestamp: new Date().toISOString(),
      };
      setMessagesByConnection((prev) => {
        const prevMsgs = prev[selectedConnection.id] || [];
        return { ...prev, [selectedConnection.id]: [...prevMsgs, botMessage] };
      });
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="dm-container">
      {isOpen && (
        <div className="dm-window">
          <div className="dm-left-panel">
            <h4>Connections</h4>
            <ul className="connections-list">
              {connections.map((conn) => (
                <li
                  key={conn.id}
                  className={`connection-item${
                    selectedConnection && selectedConnection.id === conn.id
                      ? " selected"
                      : ""
                  }`}
                  onClick={() => setSelectedConnection(conn)}
                >
                  <img
                    src={conn.profilePic}
                    alt={conn.name}
                    className="profile-pic"
                  />
                  <span>{conn.name}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="dm-right-panel">
            <div className="dm-header">
              <h3>
                {selectedConnection
                  ? selectedConnection.name
                  : "Direct Messages"}
              </h3>
              <button className="close-button" onClick={toggleDM}>
                <X size={20} />
              </button>
            </div>
            <div className="dm-messages">
              {!selectedConnection && (
                <div className="message bot-message">
                  Select a connection to start chatting!
                </div>
              )}
              {selectedConnection && (
                <>
                  {(messagesByConnection[selectedConnection.id]?.length === 0 ||
                    !messagesByConnection[selectedConnection.id]) && (
                    <div className="message bot-message">
                      Start a conversation!
                    </div>
                  )}
                  {messagesByConnection[selectedConnection.id]?.map(
                    (msg, index) => (
                      <div
                        key={index}
                        className={`message ${
                          msg.sender === "bot" ? "bot-message" : "user-message"
                        }`}
                      >
                        {msg.text}
                      </div>
                    )
                  )}
                  {isLoading && (
                    <div className="message bot-message loading">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            <form className="dm-input-container" onSubmit={handleSendMessage}>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  selectedConnection
                    ? `Message ${selectedConnection.name}...`
                    : "Select a connection..."
                }
                className="dm-input"
                disabled={isLoading || !selectedConnection}
              />
              <button
                type="submit"
                className="send-button"
                disabled={isLoading || !message.trim() || !selectedConnection}
              >
                <Send size={20} />
              </button>
            </form>
          </div>
        </div>
      )}
      <button
        className={`dm-button ${isOpen ? "active" : ""}`}
        onClick={toggleDM}
      >
        <MessageSquare size={24} />
      </button>
    </div>
  );
};

export default DMButton;
