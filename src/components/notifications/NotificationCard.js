import "../../component-styles/NotificationCard.css";
import { Bell, MessageCircle, UserPlus, Check } from 'lucide-react';

function NotificationCard({ notification, onMarkAsRead, onSubmitFeedback }) {
    const getIcon = () => {
        switch (notification.type) {
        case 'message':
            return <MessageCircle className="notification-icon message" />;
        case 'connection':
            return <UserPlus className="notification-icon connection" />;
        case 'profile-update':
            return <Bell className="notification-icon update" />;
        default:
            return null;
        }
    };

    return (
        <div className={`notification-item ${notification.read ? 'read' : ''}`}>
        <div className="notification-header">
            {getIcon()}
            <h4>{notification.title}</h4>
        </div>
        <p>{notification.content}</p>
        <div className="notification-actions">
            {!notification.read && (
            <button 
                className="mark-read-btn" 
                onClick={() => onMarkAsRead(notification.id)}
            >
                <Check size={16} /> Okundu Olarak İşaretle
            </button>
            )}
            <button 
            className="feedback-btn" 
            onClick={() => onSubmitFeedback(notification.id)}
            >
            Geri Dönüş Yap
            </button>
        </div>
        </div>
    );
}

export default NotificationCard;
