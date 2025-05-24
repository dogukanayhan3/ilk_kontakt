import React from 'react';
import { Users, Briefcase, Link2, ArrowUpRight } from 'lucide-react';

function SocialConnectionCard({ connection }) {
    return (
        <div className="social-connection-card">
            <div className="connection-header">
                <img 
                    src={connection.profileImage} 
                    alt={connection.name} 
                    className="connection-profile-image"
                />
                <div className="connection-info">
                    <h3>{connection.name}</h3>
                    <p><Briefcase size={16} strokeWidth={1.5} /> {connection.position}</p>
                </div>
            </div>
            <div className="connection-projects">
                <h4>Projeler</h4>
                {connection.projects.map(project => (
                    <div key={project.id} className="project-item">
                        <div className="project-details">
                            <h5>{project.title}</h5>
                            <p>{project.description}</p>
                        </div>
                        <button className="project-link-btn">
                            Detaylar <ArrowUpRight size={16} strokeWidth={2} />
                        </button>
                    </div>
                ))}
            </div>
            <button
                className="view-profile-btn"
                onClick={() => navigate(`/profile/${connection.id}`)}
            >
                Profili Görüntüle
            </button>
        </div>
    );
}

export default SocialConnectionCard;