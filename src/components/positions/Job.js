import React from 'react';
import { 
    Computer, 
    MapPin, 
    Briefcase, 
    ChevronRight, 
    Edit, 
    Trash2,
    Calendar
} from 'lucide-react';
import "../../component-styles/JobListings.css";

const JOB_TYPE_LABELS = {
    0: 'Tam Zamanlı',
    1: 'Yarı Zamanlı', 
    2: 'Sözleşmeli',
    3: 'Staj',
    4: 'Uzaktan'
};

function Job({ job, onEdit, onDelete, currentUser }) {
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleEdit = (e) => {
        e.stopPropagation();
        onEdit(job);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        onDelete(job.id);
    };

    const canManage = currentUser && (
        currentUser.id === job.creatorId || 
        currentUser.userId === job.creatorId
    );

    return (
        <div className="job-listing">
            <div className="job-header">
                <div className="job-title-section">
                    <h3>
                        <Briefcase size={20} color="#5fbcee" strokeWidth={2} />
                        {job.title}
                    </h3>
                    <h4>
                        <Computer size={18} color="#5fbcee" strokeWidth={2} />
                        {job.company}
                    </h4>
                </div>
                
                {canManage && (
                    <div className="job-actions">
                        <button 
                            className="edit-job-btn"
                            onClick={handleEdit}
                            title="Düzenle"
                        >
                            <Edit size={16} strokeWidth={2} />
                        </button>
                        <button 
                            className="delete-job-btn"
                            onClick={handleDelete}
                            title="Sil"
                        >
                            <Trash2 size={16} strokeWidth={2} />
                        </button>
                    </div>
                )}
            </div>

            <div className="job-description">
                <p>{job.description}</p>
            </div>

            <div className="job-details">
                <div className="job-detail-item">
                    <Computer size={16} color="#5fbcee" strokeWidth={2} />
                    <span>Tür: {JOB_TYPE_LABELS[job.type] || 'Belirtilmemiş'}</span>
                </div>
                
                <div className="job-detail-item">
                    <MapPin size={16} color="#5fbcee" strokeWidth={2} />
                    <span>Konum: {job.location || 'Belirtilmemiş'}</span>
                </div>
                
                <div className="job-detail-item">
                    <Briefcase size={16} color="#5fbcee" strokeWidth={2} />
                    <span>Deneyim: {job.experienceLevel || 'Belirtilmemiş'}</span>
                </div>

                <div className="job-detail-item">
                    <Calendar size={16} color="#5fbcee" strokeWidth={2} />
                    <span>Yayınlanma: {formatDate(job.creationTime)}</span>
                </div>
            </div>

            <div className="job-footer">
                <button className="apply-btn">
                    Şimdi Başvur!
                    <ChevronRight size={16} strokeWidth={2} />
                </button>
            </div>
        </div>
    );
}

export default Job;
