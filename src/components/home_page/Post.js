import React, { useState } from 'react';
import { ThumbsUp, MessageCircle, Send } from 'lucide-react';
import { useAuth } from "../../contexts/AuthContext";
import "../../component-styles/Post.css";
import PropTypes from 'prop-types';

function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}

function Post({ 
    id, 
    post_owner, 
    post_content, 
    user_likes, 
    user_comments, 
    publish_date, 
    onPostUpdate 
}) {
    const [isCommenting, setIsCommenting] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [error, setError] = useState("");
    const { currentUser } = useAuth();
    
    const hasLiked = user_likes?.includes(currentUser?.id);

    const handleLike = async (e) => {
        // Prevent default button behavior
        e.preventDefault();
        
        try {
            // First get XSRF token
            await fetch('https://localhost:44388/api/abp/application-configuration', {
                credentials: 'include'
            });
            const xsrfToken = getCookie('XSRF-TOKEN');
            if (!xsrfToken) {
                setError('XSRF token not found');
                return;
            }

            const endpoint = `https://localhost:44388/api/app/post/${hasLiked ? 'unlike' : 'like'}/${id}`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'RequestVerificationToken': xsrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'include',
                body: JSON.stringify({})
            });
            
            if (!response.ok) throw new Error('Like işlemi başarısız oldu');
            onPostUpdate();
        } catch (err) {
            setError(err.message);
            console.error('Like error:', err);
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        try {
            // First get XSRF token
            await fetch('https://localhost:44388/api/abp/application-configuration', {
                credentials: 'include'
            });
            const xsrfToken = getCookie('XSRF-TOKEN');
            if (!xsrfToken) {
                setError('XSRF token not found');
                return;
            }

            const response = await fetch(`https://localhost:44388/api/app/post/comment/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'RequestVerificationToken': xsrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'include',
                body: JSON.stringify({ content: commentText })
            });
            
            if (!response.ok) throw new Error('Yorum gönderilemedi');
            setCommentText("");
            setIsCommenting(false);
            // Trigger a refresh of the post data
            onPostUpdate();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="post">
            <div className="post-header">
                <img src={`https://via.placeholder.com/40`} alt="Profile" />
                <div>
                    <h4>{post_owner}</h4>
                    <span>{new Date(publish_date).toLocaleString()}</span>
                </div>
            </div>
            
            <div className="post-content">
                <p>{post_content}</p>
            </div>
            
            <div className="post-actions">
                <button 
                    type="button" // Add this line
                    className={`like-button ${hasLiked ? 'liked' : ''}`}
                    onClick={handleLike}
                >
                    <ThumbsUp size={18} />
                    <span>{user_likes?.length || 0}</span>
                </button>
                
                <button 
                    className="comment-button"
                    onClick={() => setIsCommenting(!isCommenting)}
                >
                    <MessageCircle size={18} />
                    <span>{user_comments?.length || 0}</span>
                </button>
            </div>
            
            {isCommenting && (
                <form onSubmit={handleComment} className="comment-form">
                    <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Yorumunuzu yazın..."
                    />
                    <button type="submit">
                        <Send size={18} />
                    </button>
                </form>
            )}
            
            <div className="comments-section">
                {user_comments?.map(comment => (
                    <div key={comment.id} className="comment">
                        <strong>{comment.userId}</strong>
                        <p>{comment.content}</p>
                        <span>{new Date(comment.creationTime).toLocaleString()}</span>
                    </div>
                ))}
            </div>
            
            {error && <div className="error-message">{error}</div>}
        </div>
    );
}

Post.propTypes = {
    id: PropTypes.string.isRequired,
    post_owner: PropTypes.string.isRequired,
    post_content: PropTypes.string.isRequired,
    user_likes: PropTypes.array,
    user_comments: PropTypes.array,
    publish_date: PropTypes.string.isRequired,
    onPostUpdate: PropTypes.func.isRequired
};

export default Post;