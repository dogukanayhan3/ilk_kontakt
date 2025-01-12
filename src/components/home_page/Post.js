import { useState } from "react";
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import "../../component-styles/Post.css";

function Post({post_owner, post_content, post_likes, post_comments}){
    const [commentsVisible, setCommentsVisible] = useState(false);
    const [likes, setLikes] = useState(post_likes);
    const [isLiked, setIsLiked] = useState(false);

    const handleLikes = () => {
        setLikes((prevLikes) => (isLiked ? (prevLikes-1) : (prevLikes+1)))
        setIsLiked((prevIsLiked) => (!prevIsLiked));
    };

    const handleComments = () => (
        setCommentsVisible((prevState) => !prevState)
    );

    return(
        <div className="post">
            <div className="post-header">
                <img 
                    src="/api/placeholder/50/50" 
                    alt={`${post_owner}'s profile`} 
                />
                <div className="post-header-info">
                    <h3>{post_owner}</h3>
                    <p>Professional Network</p>
                </div>
            </div>
            <div className="post-content">
                <p>{post_content}</p>
            </div>
            <div className="post-interactions">
                <button 
                    className={`like-btn ${isLiked ? 'liked' : ''}`} 
                    onClick={handleLikes}
                >
                    <Heart 
                        size={20} 
                        fill={isLiked ? '#3245f1' : 'none'}
                        stroke={isLiked ? '#3245f1' : '#5fbcee'}
                    />
                    <span>{likes} Beğeni</span>
                </button>
                <button 
                    className="comment-btn" 
                    onClick={handleComments}
                >
                    <MessageCircle size={20} />
                    <span>{post_comments.length} Yorum</span>
                </button>
                <button className="share-btn">
                    <Share2 size={20} />
                    <span>Paylaş</span>
                </button>
            </div>
            {commentsVisible && (
                <div className="comments-section">
                    {post_comments.map((comment, index) => (
                        <div key={index} className="comment">
                            <img 
                                src="/api/placeholder/40/40" 
                                alt={`${comment.comment_owner}'s profile`} 
                            />
                            <div className="comment-content">
                                <h4>{comment.comment_owner}</h4>
                                <p>{comment.comment_content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Post;