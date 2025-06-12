import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import "../../component-styles/DMButton.css";

const API_BASE = process.env.REACT_APP_API_URL || "https://localhost:44388";

// Helper function to get cookies
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const DMButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [connections, setConnections] = useState([]);
  const [userProfiles, setUserProfiles] = useState({});
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [messagesByConnection, setMessagesByConnection] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingConnections, setIsLoadingConnections] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  // Store current user's actual ID once we determine it
  const currentUserIdRef = useRef(null);

  // Debug auth state
  useEffect(() => {
    if (isOpen) {
      console.log("Current user state:", currentUser);
      console.log("API_BASE value:", API_BASE);
    }
  }, [isOpen, currentUser]);

  // Fetch connections when DM is opened
  useEffect(() => {
    if (isOpen) {
      fetchConnections();
    }
  }, [isOpen]);

  // Get current user ID from user profiles
  const identifyCurrentUserId = (profiles) => {
    // Find profile that matches current user's email or username
    for (const id in profiles) {
      const profile = profiles[id];
      if (profile.email === currentUser?.email || profile.userName === currentUser?.userName) {
        console.log(`Identified current user ID: ${id}`);
        currentUserIdRef.current = profile.userId;
        return profile.userId;
      }
    }
    return null;
  };

  // Fetch user connections
  const fetchConnections = async () => {
    try {
      setIsLoadingConnections(true);
      setError(null);
      
      console.log("Fetching connections from:", `${API_BASE}/api/app/connection/user-connections`);
      
      const response = await fetch(`${API_BASE}/api/app/connection/user-connections`, {
        credentials: "include",
      });
      
      console.log("Response status:", response.status);
      
      const responseText = await response.text();
      console.log("Raw API Response:", responseText);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch connections: ${response.status} ${response.statusText}`);
      }
      
      const data = JSON.parse(responseText);
      console.log("Parsed connections data:", data);
      
      // Filter for accepted connections (status === 1)
      const acceptedConnections = data.items.filter(conn => conn.status === 1);
      console.log("Accepted connections:", acceptedConnections);
      
      setConnections(acceptedConnections);
      
      // First, get all unique user IDs from connections
      const userIds = new Set();
      acceptedConnections.forEach(conn => {
        userIds.add(conn.senderId);
        userIds.add(conn.receiverId);
      });
      
      // Fetch all profiles at once
      const profiles = {};
      await Promise.all(
        Array.from(userIds).map(async (userId) => {
          const profile = await fetchUserProfile(userId);
          if (profile) {
            profiles[userId] = profile;
          }
        })
      );
      
      // Now identify which one is the current user
      identifyCurrentUserId(profiles);
      
    } catch (error) {
      console.error("Error fetching connections:", error);
      setError(`Failed to load connections: ${error.message}`);
    } finally {
      setIsLoadingConnections(false);
    }
  };

  // Fetch user profile by ID
  const fetchUserProfile = async (userId) => {
    try {
      console.log(`Fetching user profile for ID: ${userId}`);
      const response = await fetch(`${API_BASE}/api/app/user-profile/by-user-id/${userId}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user profile for user ${userId}`);
      }
      
      const responseText = await response.text();
      const profileData = JSON.parse(responseText);
      console.log(`Parsed profile data for ${userId}:`, profileData);
      
      setUserProfiles(prev => ({
        ...prev,
        [userId]: profileData
      }));
      
      return profileData;
    } catch (error) {
      console.error(`Error fetching user profile for ${userId}:`, error);
      return null;
    }
  };

  // Fetch conversation messages - Update this function
  const fetchConversation = async (connection) => {
    try {
      setIsLoadingMessages(true);
      setError(null);
      
      console.log(`Fetching conversation for connection ID: ${connection.id}`);
      
      // Changed to connectionId (lowercase 'c') to match API expectations
      const response = await fetch(`${API_BASE}/api/app/message/conversation?connectionId=${connection.id}`, {
        credentials: "include",
      });
      
      console.log("Conversation response status:", response.status);
      
      const responseText = await response.text();
      console.log("Conversation raw response:", responseText);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch conversation: ${response.status} ${responseText}`);
      }
      
      if (!responseText.trim()) {
        // Handle empty response
        setMessagesByConnection(prev => ({
          ...prev,
          [connection.id]: []
        }));
        return;
      }
      
      try {
        const data = JSON.parse(responseText);
        console.log("Parsed conversation data:", data);
        
        // Check if data is an array directly or has an items property
        const messages = Array.isArray(data) ? data : (data.items || []);
        console.log("Extracted messages:", messages);
        
        setMessagesByConnection(prev => ({
          ...prev,
          [connection.id]: messages
        }));
      } catch (parseError) {
        console.error("Error parsing conversation JSON:", parseError);
        setError("Invalid response format from server");
      }
    } catch (error) {
      console.error("Error fetching conversation:", error);
      setError(`Failed to load messages: ${error.message}`);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Handle connection selection
  const handleConnectionSelect = (connection) => {
    setSelectedConnection(connection);
    fetchConversation(connection);
  };

  // Send a message - Updated implementation
  // Send a message - Authentication-focused implementation
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedConnection) return;

    setIsLoading(true);
    const messageText = message.trim();
    setMessage("");

    try {
      // First make a request to ensure authentication is current
      const authCheckResponse = await fetch(`${API_BASE}/api/account/my-profile`, {
        method: "GET",
        credentials: "include",
      });
      
      console.log("Auth check response status:", authCheckResponse.status);
      
      // Get the latest XSRF token after auth check
      await fetch(`${API_BASE}/api/abp/application-configuration`, {
        credentials: "include",
      });
      const xsrfToken = getCookie("XSRF-TOKEN");
      console.log("XSRF token for message sending:", xsrfToken);
      
      // Create a simple payload with ONLY required fields
      const messagePayload = {
        connectionId: selectedConnection.id,
        text: messageText
      };
      
      // Log what we're sending
      console.log("Sending message payload:", messagePayload);
      
      // Use a "fire and forget" approach first - don't wait for response
      fetch(`${API_BASE}/api/app/message`, {
        method: "POST",
        headers: {
          "accept": "text/plain",
          "Content-Type": "application/json",
          "RequestVerificationToken": xsrfToken,
          "X-Requested-With": "XMLHttpRequest"
        },
        credentials: "include", // Critical for authentication
        body: JSON.stringify(messagePayload)
      });
      
      // Add message to UI immediately
      const tempMessage = {
        id: `temp-${Date.now()}`,
        connectionId: selectedConnection.id,
        senderId: currentUserIdRef.current,
        text: messageText,
        creationTime: new Date().toISOString()
      };
      
      setMessagesByConnection(prev => ({
        ...prev,
        [selectedConnection.id]: [
          tempMessage,
          ...(prev[selectedConnection.id] || [])
        ]
      }));
      
      // Clear any previous error
      setError(null);
      
      // Refresh the conversation after a delay to see the real message
      setTimeout(() => {
        fetchConversation(selectedConnection);
      }, 1000);
      
    } catch (error) {
      console.error("Error sending message:", error);
      setError(`Failed to send message: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDM = () => {
    setIsOpen(!isOpen);
  };

  // Get the other user ID from a connection
  const getOtherUserId = (connection) => {
    if (!connection) return null;
    
    const currentId = currentUserIdRef.current;
    
    // If we've identified the current user's ID
    if (currentId) {
      return connection.senderId === currentId ? connection.receiverId : connection.senderId;
    }
    
    // Fallback: try to guess based on email/username matching
    if (userProfiles[connection.senderId]?.email === currentUser?.email) {
      return connection.receiverId;
    } else if (userProfiles[connection.receiverId]?.email === currentUser?.email) {
      return connection.senderId;
    }
    
    // If we still can't determine, just return the first ID that's not null
    return connection.senderId || connection.receiverId;
  };

  // Get display info for a connection
  const getConnectionDisplayInfo = (connection) => {
    if (!connection) return null;

    const otherUserId = getOtherUserId(connection);
    const userProfile = userProfiles[otherUserId];
    
    return {
      id: connection.id,
      userId: otherUserId,
      name: userProfile ? `${userProfile.name} ${userProfile.surname}` : `User ${otherUserId.substring(0, 8)}...`,
      profilePic: userProfile?.profilePictureUrl || "https://i.pravatar.cc/150?img=0",
    };
  };

  // Determine if a message is from the current user
  const isCurrentUserMessage = (message) => {
    const currentId = currentUserIdRef.current;
    if (currentId) {
      return message.senderId === currentId;
    }
    
    // Fallback method if we don't have the ID
    return Object.values(userProfiles).some(profile => 
      profile.userId === message.senderId && profile.email === currentUser?.email
    );
  };

  return (
    <div className="dm-container">
      {isOpen && (
        <div className="dm-window">
          <div className="dm-left-panel">
            <h4>Connections</h4>
            {isLoadingConnections ? (
              <div className="loading-indicator">Loading connections...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : (
              <ul className="connections-list">
                {connections.length === 0 ? (
                  <li className="no-connections">No connections found</li>
                ) : (
                  connections.map((conn) => {
                    const displayInfo = getConnectionDisplayInfo(conn);
                    if (!displayInfo) return null;
                    
                    return (
                      <li
                        key={conn.id}
                        className={`connection-item${
                          selectedConnection && selectedConnection.id === conn.id
                            ? " selected"
                            : ""
                        }`}
                        onClick={() => handleConnectionSelect(conn)}
                      >
                        <img
                          src={displayInfo.profilePic}
                          alt={displayInfo.name}
                          className="profile-pic"
                        />
                        <span>{displayInfo.name}</span>
                      </li>
                    );
                  })
                )}
              </ul>
            )}
          </div>
          <div className="dm-right-panel">
            <div className="dm-header">
              <h3>
                {selectedConnection
                  ? getConnectionDisplayInfo(selectedConnection)?.name
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
                  {isLoadingMessages ? (
                    <div className="loading-indicator">Loading messages...</div>
                  ) : error ? (
                    <div className="error-message">{error}</div>
                  ) : (
                    <>
                      {(!messagesByConnection[selectedConnection.id] || 
                        messagesByConnection[selectedConnection.id].length === 0) && (
                        <div className="message bot-message">
                          No messages yet. Start a conversation!
                        </div>
                      )}
                      {messagesByConnection[selectedConnection.id]?.map((msg) => {
                        // Make sure we have a valid message object
                        if (!msg || !msg.text) {
                          console.log("Invalid message object:", msg);
                          return null;
                        }
                        
                        return (
                          <div
                            key={msg.id || `msg-${Math.random()}`} // Fallback ID if missing
                            className={`message ${
                              isCurrentUserMessage(msg) ? "user-message" : "bot-message"
                            }`}
                          >
                            {msg.text}
                            <small className="message-time">
                              {msg.creationTime ? new Date(msg.creationTime).toLocaleTimeString() : ''}
                            </small>
                          </div>
                        );
                      })}
                    </>
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
                    ? `Message ${getConnectionDisplayInfo(selectedConnection)?.name}...`
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