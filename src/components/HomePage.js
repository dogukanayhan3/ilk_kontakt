const generatePost = async () => {
  try {
    const response = await fetch(
      `${API_CONFIG.GEMINI_API_URL}?key=${API_CONFIG.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Generate a professional social media post about career development or industry insights. The post should be:
1. Professional and informative
2. Engaging and shareable
3. Relevant to the tech industry
4. Include a call to action
5. Be in Turkish

Keep it concise and impactful.`,
                },
              ],
            },
          ],
        }),
      }
    );

    // ... rest of the code ...
  } catch (err) {
    console.error("Generate post error:", err);
  }
};

// ... rest of the code until the suggestions mapping ...

suggestedConnections.map((suggestion, index) => (
  <div key={index} className="connection-suggestion">
    <img
      src={suggestion.profilePictureUrl || "/default-avatar.png"}
      alt={suggestion.name}
      className="suggestion-profile-image"
    />
    <div className="suggestion-details">
      <h4>
        {suggestion.name} {suggestion.surname}
      </h4>
      <p className="suggestion-reason">{suggestion.matchReason}</p>
      <button
        onClick={() => navigate(`/profilepage/${suggestion.id}`)}
      >
        Profili Görüntüle
      </button>
    </div>
  </div>
))

// ... rest of the existing code ... 