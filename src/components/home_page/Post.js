import React, { useState, useEffect } from 'react';
import { ThumbsUp, MessageCircle, Send, Heart, MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import '../../component-styles/Post.css';
import PropTypes from 'prop-types';

// Helper function to get cookies
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
  // --- Component State ---
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  // --- LOCAL STATE for Optimistic UI ---
  const [localHasLiked, setLocalHasLiked] = useState(() =>
    currentUser?.id && userLikes ? userLikes.includes(currentUser.id) : false
  );
  const [localLikeCount, setLocalLikeCount] = useState(numberOfLikes || 0);

  // Effect to sync local state if props change from outside
  useEffect(() => {
    const currentPropHasLiked = currentUser?.id && userLikes ? userLikes.includes(currentUser.id) : false;
    setLocalHasLiked(currentPropHasLiked);
    setLocalLikeCount(numberOfLikes || 0);
  }, [userLikes, numberOfLikes, currentUser?.id]);

  // --- API Call Logic ---
  const handleLike = async (e) => {
    e.preventDefault();
    if (!currentUser) { setError('Please log in to like posts.'); return; }
    setError('');

    const originalHasLiked = localHasLiked;
    const originalLikeCount = localLikeCount;

    setLocalHasLiked(!originalHasLiked);
    setLocalLikeCount(originalHasLiked ? originalLikeCount - 1 : originalLikeCount + 1);

    try {
      await fetch('https://localhost:44388/api/abp/application-configuration', { credentials: 'include' });
      const xsrfToken = getCookie('XSRF-TOKEN');
      if (!xsrfToken) { throw new Error('Could not verify request (XSRF token missing).'); }

      const endpoint = `https://localhost:44388/api/app/post/${originalHasLiked ? 'unlike' : 'like'}/${id}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', RequestVerificationToken: xsrfToken, 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'include',
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        let errorMsg = 'Like/Unlike operation failed.';
        try { if (response.status !== 204) { const errorData = await response.json(); errorMsg = errorData?.error?.message || errorMsg; } } catch (parseError) { /* Ignore */ }
        throw new Error(errorMsg + ` (Status: ${response.status})`);
      }
      // Optional: onPostUpdate(); // Keep commented out if optimistic is enough

    } catch (err) {
      setError(err.message);
      console.error('Like/Unlike error, reverting UI:', err);
      setLocalHasLiked(originalHasLiked);
      setLocalLikeCount(originalLikeCount);
    }
  };

  // --- CORRECTED handleComment ---
  const handleComment = async (e) => {
    e.preventDefault();
    if (!currentUser) { setError('Please log in to comment.'); return; }
    if (!commentText.trim()) { setError('Comment cannot be empty.'); return; }
    setError('');

    try {
      // Fetch XSRF token
      await fetch('https://localhost:44388/api/abp/application-configuration', { credentials: 'include' });
      const xsrfToken = getCookie('XSRF-TOKEN');
      if (!xsrfToken) { setError('Could not verify request (XSRF token missing).'); return; }

      const endpoint = `https://localhost:44388/api/app/post/comment/${id}`;

      // Restore fetch options
      const response = await fetch(endpoint, {
        method: 'POST', // <<< WAS MISSING
        headers: { // <<< WAS MISSING
          'Content-Type': 'application/json',
          RequestVerificationToken: xsrfToken,
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include',
        body: JSON.stringify({ content: commentText }), // <<< WAS MISSING
      });

      if (!response.ok) {
        let errorMsg = 'Failed to post comment.';
        try { const errorData = await response.json(); errorMsg = errorData?.error?.message || errorMsg; } catch (parseError) { /* Ignore */ }
        throw new Error(errorMsg + ` (Status: ${response.status})`);
      }

      // Clear input and hide form on success
      setCommentText('');
      setIsCommenting(false);
      // Refresh the post data to show the new comment
      onPostUpdate(); // <<< Keep this for comments

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
         <img src={`https://i.pravatar.cc/50?u=${id}`} alt="Profile" className="post-avatar"/>
         <div className="post-header-info">
           <h4 className="post-username">{userName || '<Unknown User>'}</h4>
           <span className="post-timestamp">{publishDate ? new Date(publishDate).toLocaleString() : 'Date unavailable'}</span>
         </div>
       </div>
      {/* === Post Content === */}
       <div className="post-content"><p>{content}</p></div>
      {/* === Post Stats === */}
       <div className="post-stats">
         {localLikeCount > 0 && (<span className="stat-item"><Heart size={14} className="stat-icon liked-icon" />{localLikeCount} {localLikeCount === 1 ? 'like' : 'likes'}</span>)}
         {/* Comment count uses props, updated via onPostUpdate */}
         {userComments && userComments.length > 0 && (<span className="stat-item comment-stat" onClick={() => setIsCommenting(!isCommenting)} title="View Comments"><MessageSquare size={14} className="stat-icon" />{userComments.length} {userComments.length === 1 ? 'comment' : 'comments'}</span>)}
       </div>
      {/* === Post Actions === */}
      <div className="post-actions">
        <button type="button" className={`action-button like-button ${localHasLiked ? 'liked' : ''}`} onClick={handleLike} disabled={!currentUser} title={!currentUser ? 'Log in to like' : localHasLiked ? 'Unlike' : 'Like'}>
          {/* Use CSS for fill */}
          <ThumbsUp size={18} />
          <span>{localHasLiked ? 'Liked' : 'Like'}</span>
        </button>
        <button type="button" className="action-button comment-button" onClick={() => setIsCommenting(!isCommenting)} disabled={!currentUser} title={!currentUser ? 'Log in to comment' : 'Comment'}>
          <MessageCircle size={18} />
          {/* Display static text, count is in stats */}
          <span>Comment</span>
        </button>
      </div>
      {/* === Comment Input & Section === */}
       {isCommenting && currentUser && ( <div className="comment-input-section"> <img src={`https://i.pravatar.cc/40?u=${currentUser.id}`} alt="Your avatar" className="comment-input-avatar"/> <form onSubmit={handleComment} className="comment-form"> <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Write your comment..." rows={2} required className="comment-textarea"/> <button type="submit" disabled={!commentText.trim()} title="Send Comment" className="comment-send-button"> <Send size={18} /> </button> </form> </div> )}
       {isCommenting && ( <div className="comments-section"> {userComments?.length > 0 ? ( userComments.map((comment) => ( <div key={comment.id} className="comment"> <img src={`https://i.pravatar.cc/40?u=${comment.userId}`} alt="Commenter avatar" className="comment-avatar"/> <div className="comment-body"> <div className="comment-header"><strong className="comment-username">{comment.userName || '<Unknown User>'}</strong></div> <p className="comment-text">{comment.content}</p> <span className="comment-timestamp">{comment.creationTime ? new Date(comment.creationTime).toLocaleString() : ''}</span> </div> </div> )) ) : ( <p className="no-comments-yet">No comments yet.</p> )} </div> )}
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
