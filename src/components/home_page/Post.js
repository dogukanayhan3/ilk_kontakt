import React, { useState } from 'react';
import { ThumbsUp, MessageCircle, Send, Heart, MessageSquare } from 'lucide-react'; // Added Heart, MessageSquare for stats
import { useAuth } from '../../contexts/AuthContext';
import '../../component-styles/Post.css'; // We will update this CSS file
import PropTypes from 'prop-types';

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
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
}) {
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  const hasLiked = currentUser?.id && userLikes?.includes(currentUser.id);

  // --- API Call Logic (handleLike, handleComment) ---
  // No changes needed in the logic itself
  const handleLike = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setError('Please log in to like posts.');
      return;
    }
    setError('');

    try {
      await fetch(
        'https://localhost:44388/api/abp/application-configuration',
        { credentials: 'include' },
      );
      const xsrfToken = getCookie('XSRF-TOKEN');
      if (!xsrfToken) {
        setError('Could not verify request (XSRF token missing).');
        return;
      }
      const endpoint = `https://localhost:44388/api/app/post/${
        hasLiked ? 'unlike' : 'like'
      }/${id}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          RequestVerificationToken: xsrfToken,
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include',
        body: JSON.stringify({}),
      });
      if (!response.ok) {
        let errorMsg = 'Like/Unlike operation failed.';
        try {
          const errorData = await response.json();
          errorMsg = errorData?.error?.message || errorMsg;
        } catch (parseError) { /* Ignore */ }
        throw new Error(errorMsg + ` (Status: ${response.status})`);
      }
      onPostUpdate();
    } catch (err) {
      setError(err.message);
      console.error('Like/Unlike error:', err);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setError('Please log in to comment.');
      return;
    }
    if (!commentText.trim()) {
      setError('Comment cannot be empty.');
      return;
    }
    setError('');

    try {
      await fetch(
        'https://localhost:44388/api/abp/application-configuration',
        { credentials: 'include' },
      );
      const xsrfToken = getCookie('XSRF-TOKEN');
      if (!xsrfToken) {
        setError('Could not verify request (XSRF token missing).');
        return;
      }
      const endpoint = `https://localhost:44388/api/app/post/comment/${id}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          RequestVerificationToken: xsrfToken,
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include',
        body: JSON.stringify({ content: commentText }),
      });
      if (!response.ok) {
        let errorMsg = 'Failed to post comment.';
        try {
          const errorData = await response.json();
          errorMsg = errorData?.error?.message || errorMsg;
        } catch (parseError) { /* Ignore */ }
        throw new Error(errorMsg + ` (Status: ${response.status})`);
      }
      setCommentText('');
      setIsCommenting(false);
      onPostUpdate();
    } catch (err) {
      setError(err.message);
      console.error('Comment error:', err);
    }
  };
  // --- End API Call Logic ---

  return (
    <div className="post">
      {/* === Post Header === */}
      <div className="post-header">
        <img
          src={`https://i.pravatar.cc/50?u=${id}`} // Placeholder avatar based on post ID
          alt="Profile"
          className="post-avatar"
        />
        <div className="post-header-info">
          <h4 className="post-username">{userName || '<Unknown User>'}</h4>
          <span className="post-timestamp">
            {publishDate
              ? new Date(publishDate).toLocaleString()
              : 'Date unavailable'}
          </span>
        </div>
      </div>

      {/* === Post Content === */}
      <div className="post-content">
        <p>{content}</p>
      </div>

      {/* === Post Stats (Likes/Comments Count) === */}
      <div className="post-stats">
         {numberOfLikes > 0 && (
             <span className="stat-item">
                 <Heart size={14} className="stat-icon liked-icon" />
                 {numberOfLikes} {numberOfLikes === 1 ? 'like' : 'likes'}
             </span>
         )}
         {userComments && userComments.length > 0 && (
             <span className="stat-item comment-stat" onClick={() => setIsCommenting(!isCommenting)} title="View Comments">
                 <MessageSquare size={14} className="stat-icon" />
                 {userComments.length} {userComments.length === 1 ? 'comment' : 'comments'}
             </span>
         )}
      </div>


      {/* === Post Actions (Like/Comment Buttons) === */}
      <div className="post-actions">
        <button
          type="button"
          className={`action-button like-button ${hasLiked ? 'liked' : ''}`}
          onClick={handleLike}
          disabled={!currentUser}
          title={!currentUser ? 'Log in to like' : hasLiked ? 'Unlike' : 'Like'}
        >
          <ThumbsUp size={18} />
          <span>Like</span>
        </button>

        <button
          type="button"
          className="action-button comment-button"
          onClick={() => setIsCommenting(!isCommenting)}
          disabled={!currentUser}
          title={!currentUser ? 'Log in to comment' : 'Comment'}
        >
          <MessageCircle size={18} />
          <span>Comment</span>
        </button>
      </div>

      {/* === Comment Input Form === */}
      {isCommenting && currentUser && (
        <div className="comment-input-section">
          <img
            src={`https://i.pravatar.cc/40?u=${currentUser.id}`} // Current user avatar
            alt="Your avatar"
            className="comment-input-avatar"
          />
          <form onSubmit={handleComment} className="comment-form">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write your comment..."
              rows={2}
              required
              className="comment-textarea"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              title="Send Comment"
              className="comment-send-button"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      {/* === Comments Section === */}
      {isCommenting && ( // Show comments only when comment section is open
        <div className="comments-section">
          {userComments?.length > 0 ? (
            userComments.map((comment) => (
              <div key={comment.id} className="comment">
                <img
                  src={`https://i.pravatar.cc/40?u=${comment.userId}`} // Commenter avatar
                  alt="Commenter avatar"
                  className="comment-avatar"
                />
                <div className="comment-body">
                  <div className="comment-header">
                    <strong className="comment-username">
                      {comment.userName || '<Unknown User>'}
                    </strong>
                  </div>
                  <p className="comment-text">{comment.content}</p>
                   <span className="comment-timestamp">
                    {comment.creationTime
                      ? new Date(comment.creationTime).toLocaleString()
                      : ''}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="no-comments-yet">No comments yet.</p>
          )}
        </div>
      )}


      {/* === Error Display === */}
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
        }),
    ),
    publishDate: PropTypes.string.isRequired,
    onPostUpdate: PropTypes.func.isRequired,
};

// Default props remain the same
Post.defaultProps = {
    userName: '<Unknown User>',
    userLikes: [],
    numberOfLikes: 0,
    userComments: [],
};


export default Post;
