import React, { useState } from "react";
import { MessageSquare, X, Send } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import "../../component-styles/DMButton.css";
import DMWindow from "./DMWindow";

const DMButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
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
      sender: "user",
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    // TODO: Implement actual DM functionality with backend
    // For now, just simulate a response
    setTimeout(() => {
      const botMessage = {
        text: "This is a placeholder response. DM functionality will be implemented with backend integration.",
        sender: "bot",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="dm-container">
      {isOpen && <DMWindow onClose={toggleDM} />}
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
