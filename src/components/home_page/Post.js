import React, { useState } from 'react';
import { ThumbsUp, MessageCircle, Send } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext'; // Ensure path is correct
import '../../component-styles/Post.css'; // Ensure path is correct
import PropTypes from 'prop-types';

// Keep getCookie function as is
function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}

// Updated component signature to match PostDto structure
function Post({
    id,
    userName, // Renamed from post_owner, maps to PostDto.UserName
    content, // Renamed from post_content, maps to PostDto.Content
    userLikes, // Renamed from user_likes, maps to PostDto.UserLikes (array of Guids)
    numberOfLikes, // Added, maps to PostDto.NumberOfLikes
    userComments, // Renamed from user_comments, maps to PostDto.UserComments (array of CommentDto)
    publishDate, // Renamed from publish_date, maps to PostDto.PublishDate
    onPostUpdate, // Function to refresh data in parent
    }) {
    const [isCommenting, setIsCommenting] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [error, setError] = useState('');
    const { currentUser } = useAuth(); // Get current logged-in user info

    // Check if the current user's ID is in the userLikes array
    // Ensure currentUser and currentUser.id exist before checking includes
    const hasLiked =
        currentUser?.id && userLikes?.includes(currentUser.id);

    // --- API Call Logic (handleLike, handleComment) ---
    // These functions remain largely the same, as they trigger backend actions
    // and rely on onPostUpdate to reflect changes.

    const handleLike = async (e) => {
        e.preventDefault();
        if (!currentUser) {
        setError('Please log in to like posts.');
        return;
        }
        setError(''); // Clear previous errors

        try {
        // Fetch XSRF token (standard ABP practice)
        await fetch(
            'https://localhost:44388/api/abp/application-configuration',
            {
            credentials: 'include',
            },
        );
        const xsrfToken = getCookie('XSRF-TOKEN');
        if (!xsrfToken) {
            setError('Could not verify request (XSRF token missing).');
            return;
        }

        // Determine endpoint based on current like status
        const endpoint = `https://localhost:44388/api/app/post/${
            hasLiked ? 'unlike' : 'like'
        }/${id}`;

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            RequestVerificationToken: xsrfToken, // ABP Anti-forgery token
            'X-Requested-With': 'XMLHttpRequest', // Often required by ABP
            },
            credentials: 'include', // Send cookies
            body: JSON.stringify({}), // Empty body for Like/Unlike DTO
        });

        if (!response.ok) {
            // Try to get error details from ABP response
            let errorMsg = 'Like/Unlike operation failed.';
            try {
            const errorData = await response.json();
            errorMsg = errorData?.error?.message || errorMsg;
            } catch (parseError) {
            // Ignore if response is not JSON
            }
            throw new Error(errorMsg + ` (Status: ${response.status})`);
        }

        onPostUpdate(); // Tell parent component to refresh data
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
        setError(''); // Clear previous errors

        try {
        // Fetch XSRF token
        await fetch(
            'https://localhost:44388/api/abp/application-configuration',
            {
            credentials: 'include',
            },
        );
        const xsrfToken = getCookie('XSRF-TOKEN');
        if (!xsrfToken) {
            setError('Could not verify request (XSRF token missing).');
            return;
        }

        // Endpoint for adding a comment
        const endpoint = `https://localhost:44388/api/app/post/comment/${id}`;

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            RequestVerificationToken: xsrfToken,
            'X-Requested-With': 'XMLHttpRequest',
            },
            credentials: 'include',
            body: JSON.stringify({ content: commentText }), // Send comment content
        });

        if (!response.ok) {
            let errorMsg = 'Failed to post comment.';
            try {
            const errorData = await response.json();
            errorMsg = errorData?.error?.message || errorMsg;
            } catch (parseError) {
            // Ignore if response is not JSON
            }
            throw new Error(errorMsg + ` (Status: ${response.status})`);
        }

        // Clear comment box and hide form
        setCommentText('');
        setIsCommenting(false);
        onPostUpdate(); // Refresh post data to show the new comment
        } catch (err) {
        setError(err.message);
        console.error('Comment error:', err);
        }
    };

    return (
        <div className="post">
        <div className="post-header">
            <img src={`https://via.placeholder.com/40`} alt="Profile" />{' '}
            {/* Placeholder image */}
            <div>
            {/* Display post owner's username */}
            <h4>{userName || '<Unknown User>'}</h4>
            {/* Format and display publish date */}
            <span>
                {publishDate
                ? new Date(publishDate).toLocaleString()
                : 'Date unavailable'}
            </span>
            </div>
        </div>

        <div className="post-content">
            {/* Display post content */}
            <p>{content}</p>
        </div>

        <div className="post-actions">
            {/* Like Button */}
            <button
            type="button"
            className={`like-button ${hasLiked ? 'liked' : ''}`}
            onClick={handleLike}
            disabled={!currentUser} // Disable if not logged in
            title={!currentUser ? 'Log in to like' : (hasLiked ? 'Unlike' : 'Like')}
            >
            <ThumbsUp size={18} />
            {/* Display number of likes from numberOfLikes prop */}
            <span>{numberOfLikes || 0}</span>
            </button>

            {/* Comment Button */}
            <button
            type="button" // Explicitly set type
            className="comment-button"
            onClick={() => setIsCommenting(!isCommenting)}
            disabled={!currentUser} // Disable if not logged in
            title={!currentUser ? 'Log in to comment' : 'Comment'}
            >
            <MessageCircle size={18} />
            {/* Display number of comments */}
            <span>{userComments?.length || 0}</span>
            </button>
        </div>

        {/* Comment Input Form (only show if isCommenting is true and user is logged in) */}
        {isCommenting && currentUser && (
            <form onSubmit={handleComment} className="comment-form">
            <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write your comment..."
                rows={2}
                required // Basic HTML validation
            />
            <button type="submit" disabled={!commentText.trim()} title="Send Comment">
                <Send size={18} />
            </button>
            </form>
        )}

        {/* Comments Section */}
        <div className="comments-section">
            {/* Map over userComments array */}
            {userComments?.map((comment) => (
            <div key={comment.id} className="comment">
                {/* Display commenter's username */}
                <strong>{comment.userName || '<Unknown User>'}</strong>
                {/* Display comment content */}
                <p>{comment.content}</p>
                {/* Format and display comment creation time */}
                <span>
                {comment.creationTime
                    ? new Date(comment.creationTime).toLocaleString()
                    : ''}
                </span>
            </div>
            ))}
            {/* Optional: Show message if comments are open but list is empty */}
            {isCommenting && (!userComments || userComments.length === 0) && (
                <p className="no-comments-yet">Be the first to comment!</p>
            )}
        </div>

        {/* Display error messages */}
        {error && <div className="error-message">{error}</div>}
        </div>
    );
}

// Updated PropTypes to match PostDto and CommentDto structure
Post.propTypes = {
    id: PropTypes.string.isRequired, // Post ID
    userName: PropTypes.string, // Post creator's username (optional fallback needed)
    content: PropTypes.string.isRequired, // Post content
    userLikes: PropTypes.arrayOf(PropTypes.string), // Array of user IDs (Guids as strings) who liked
    numberOfLikes: PropTypes.number, // Total number of likes
    userComments: PropTypes.arrayOf(
        PropTypes.shape({
        id: PropTypes.string.isRequired, // Comment ID
        userId: PropTypes.string.isRequired, // Commenter's user ID
        userName: PropTypes.string, // Commenter's username (optional fallback needed)
        content: PropTypes.string.isRequired, // Comment content
        creationTime: PropTypes.string.isRequired, // Comment timestamp string
        }),
    ),
    publishDate: PropTypes.string.isRequired, // Post timestamp string
    onPostUpdate: PropTypes.func.isRequired, // Callback to refresh data
};

// Default props for safety, especially for arrays and counts
Post.defaultProps = {
    userName: '<Unknown User>',
    userLikes: [],
    numberOfLikes: 0,
    userComments: [],
};

export default Post;
