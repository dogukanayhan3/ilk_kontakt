import React, { useState, useEffect } from "react";
import {
  ThumbsUp,
  MessageCircle,
  Send,
  Heart,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import "../../component-styles/Post.css";
import PropTypes from "prop-types";

// Helper function to get cookies
function getCookie(name) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

// Helper function to fetch profile image
async function fetchProfileImage(userId) {
  try {
    const response = await fetch(
      `https://localhost:44388/api/app/user-profile/by-user-id/${userId}`,
      {
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );
    if (response.ok) {
      const data = await response.json();
      return data.profilePictureUrl || "/default-avatar.png";
    }
    return "/default-avatar.png";
  } catch (err) {
    console.error("Failed to fetch profile image:", err);
    return "/default-avatar.png";
  }
}

function Post({
  id,
  userName,
  content,
  userLikes,
  numberOfLikes,
  userComments,
  publishDate,
  onPostUpdate,
  profileImage,
  userProfileImage,
  creatorUserId, // Add creatorUserId to props
}) {
  // --- Component State ---
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [error, setError] = useState("");
  const { currentUser } = useAuth();

  // --- Local State for Optimistic UI ---
  const [localHasLiked, setLocalHasLiked] = useState(() =>
    currentUser?.id && userLikes ? userLikes.includes(currentUser.id) : false
  );
  const [localLikeCount, setLocalLikeCount] = useState(numberOfLikes || 0);

  // --- State for Profile Images ---
  const [creatorProfileImage, setCreatorProfileImage] = useState(
    "/default-avatar.png"
  );
  const [commenterProfileImages, setCommenterProfileImages] = useState({}); // Map of commenter userId to profileImageUrl

  // Fetch creator profile image
  useEffect(() => {
    if (creatorUserId) {
      fetchProfileImage(creatorUserId).then((imageUrl) =>
        setCreatorProfileImage(imageUrl)
      );
    }
  }, [creatorUserId]);

  // Fetch commenter profile images
  useEffect(() => {
    if (userComments?.length > 0) {
      const fetchImages = async () => {
        const images = {};
        for (const comment of userComments) {
          if (!images[comment.userId]) {
            images[comment.userId] = await fetchProfileImage(comment.userId);
          }
        }
        setCommenterProfileImages(images);
      };
      fetchImages();
    }
  }, [userComments]);

  // Effect to sync local state if props change from outside
  useEffect(() => {
    const currentPropHasLiked =
      currentUser?.id && userLikes ? userLikes.includes(currentUser.id) : false;
    setLocalHasLiked(currentPropHasLiked);
    setLocalLikeCount(numberOfLikes || 0);
  }, [userLikes, numberOfLikes, currentUser?.id]);

  // --- API Call Logic ---
  const handleLike = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setError("Gönderileri beğenmek için lütfen giriş yapın.");
      return;
    }
    setError("");

    const originalHasLiked = localHasLiked;
    const originalLikeCount = localLikeCount;

    setLocalHasLiked(!originalHasLiked);
    setLocalLikeCount(
      originalHasLiked ? originalLikeCount - 1 : originalLikeCount + 1
    );

    try {
      await fetch("https://localhost:44388/api/abp/application-configuration", {
        credentials: "include",
      });
      const xsrfToken = getCookie("XSRF-TOKEN");
      if (!xsrfToken) {
        throw new Error("İstek doğrulanamadı (XSRF token eksik).");
      }

      const endpoint = `https://localhost:44388/api/app/post/${
        originalHasLiked ? "unlike" : "like"
      }/${id}`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          RequestVerificationToken: xsrfToken,
          "X-Requested-With": "XMLHttpRequest",
        },
        credentials: "include",
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        let errorMsg = "Like/Unlike operation failed.";
        try {
          if (response.status !== 204) {
            const errorData = await response.json();
            errorMsg = errorData?.error?.message || errorMsg;
          }
        } catch (parseError) {
          /* Ignore */
        }
        throw new Error(errorMsg + ` (Status: ${response.status})`);
      }
    } catch (err) {
      setError(err.message);
      console.error(
        "Beğenme/Beğenme kaldırma hatası, arayüz geri alınıyor:",
        err
      );
      setLocalHasLiked(originalHasLiked);
      setLocalLikeCount(originalLikeCount);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setError("Yorum yapmak için lütfen giriş yapın.");
      return;
    }
    if (!commentText.trim()) {
      setError("Yorum boş olamaz.");
      return;
    }
    setError("");

    try {
      await fetch("https://localhost:44388/api/abp/application-configuration", {
        credentials: "include",
      });
      const xsrfToken = getCookie("XSRF-TOKEN");
      if (!xsrfToken) {
        setError("İstek doğrulanamadı (XSRF token eksik).");
        return;
      }

      const endpoint = `https://localhost:44388/api/app/post/comment/${id}`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          RequestVerificationToken: xsrfToken,
          "X-Requested-With": "XMLHttpRequest",
        },
        credentials: "include",
        body: JSON.stringify({ content: commentText }),
      });

      if (!response.ok) {
        let errorMsg = "Failed to post comment.";
        try {
          const errorData = await response.json();
          errorMsg = errorData?.error?.message || errorMsg;
        } catch (parseError) {
          /* Ignore */
        }
        throw new Error(errorMsg + ` (Status: ${response.status})`);
      }

      setCommentText("");
      setIsCommenting(false);
      onPostUpdate();
    } catch (err) {
      setError(err.message);
      console.error("Comment error:", err);
    }
  };

  return (
    <div className="post">
      {/* === Post Header === */}
      <div className="post-header">
        <img src={creatorProfileImage} alt="Profile" className="post-avatar" />
        <div className="post-header-info">
          <h4 className="post-username">{userName || "<Unknown User>"}</h4>
          <span className="post-timestamp">
            {publishDate
              ? new Date(publishDate).toLocaleString()
              : "Date unavailable"}
          </span>
        </div>
      </div>
      {/* === Post Content === */}
      <div className="post-content">
        <p>{content}</p>
      </div>
      {/* === Post Stats === */}
      <div className="post-stats">
        {localLikeCount > 0 && (
          <span className="stat-item">
            <Heart size={14} className="stat-icon liked-icon" />
            {localLikeCount} {localLikeCount === 1 ? "like" : "likes"}
          </span>
        )}
        {userComments && userComments.length > 0 && (
          <span
            className="stat-item comment-stat"
            onClick={() => setIsCommenting(!isCommenting)}
            title="View Comments"
          >
            <MessageSquare size={14} className="stat-icon" />
            {userComments.length}{" "}
            {userComments.length === 1 ? "comment" : "comments"}
          </span>
        )}
      </div>
      {/* === Post Actions === */}
      <div className="post-actions">
        <button
          type="button"
          className={`action-button like-button ${
            localHasLiked ? "liked" : ""
          }`} // Add "liked" class if already liked
          onClick={handleLike}
          disabled={!currentUser}
          title={
            !currentUser
              ? "Beğenmek için giriş yapın."
              : localHasLiked
              ? "Unlike"
              : "Like"
          }
        >
          <ThumbsUp size={18} className={localHasLiked ? "liked-icon" : ""} />
          <span>{localHasLiked ? "Liked" : "Like"}</span>
        </button>
        <button
          type="button"
          className="action-button comment-button"
          onClick={() => setIsCommenting(!isCommenting)}
          disabled={!currentUser}
          title={!currentUser ? "Log in to comment" : "Comment"}
        >
          <MessageCircle size={18} />
          <span>Yorum</span>
        </button>
      </div>
      {/* === Comment Input & Section === */}
      {isCommenting && currentUser && (
        <div className="comment-input-section">
          <img
            src={userProfileImage}
            alt="Your avatar"
            className="comment-input-avatar"
          />
          <form onSubmit={handleComment} className="comment-form">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Yorumunuzu yazın..."
              rows={2}
              required
              className="comment-textarea"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              title="Yorumu Gönder"
              className="comment-send-button"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
      {isCommenting && (
        <div className="comments-section">
          {userComments?.length > 0 ? (
            userComments.map((comment) => (
              <div key={comment.id} className="comment">
                <img
                  src={
                    commenterProfileImages[comment.userId] ||
                    "/default-avatar.png"
                  }
                  alt="Commenter avatar"
                  className="comment-avatar"
                />
                <div className="comment-body">
                  <div className="comment-header">
                    <strong className="comment-username">
                      {comment.userName || "<Unknown User>"}
                    </strong>
                  </div>
                  <p className="comment-text">{comment.content}</p>
                  <span className="comment-timestamp">
                    {comment.creationTime
                      ? new Date(comment.creationTime).toLocaleString()
                      : ""}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="no-comments-yet">Henüz yorum yok.</p>
          )}
        </div>
      )}
      {error && <div className="error-message post-error">{error}</div>}
    </div>
  );
}

// PropTypes remain the same
Post.propTypes = {
  id: PropTypes.string.isRequired,
  userName: PropTypes.string,
  content: PropTypes.string.isRequired,
  userLikes: PropTypes.arrayOf(PropTypes.string),
  numberOfLikes: PropTypes.number,
  userComments: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      userId: PropTypes.string.isRequired,
      userName: PropTypes.string,
      content: PropTypes.string.isRequired,
      creationTime: PropTypes.string.isRequired,
      profileImage: PropTypes.string,
    })
  ),
  publishDate: PropTypes.string.isRequired,
  onPostUpdate: PropTypes.func.isRequired,
  creatorUserId: PropTypes.string.isRequired, // Add creatorUserId to props
};

Post.defaultProps = {
  userName: "<Unknown User>",
  userLikes: [],
  numberOfLikes: 0,
  userComments: [],
};

export default Post;
