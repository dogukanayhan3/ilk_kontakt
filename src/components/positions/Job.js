import React from 'react';
import { 
    Computer, 
    MapPin, 
    Briefcase, 
    ChevronRight, 
    Edit, 
    Trash2,
    Calendar,
    ExternalLink,
    Home,
    Wifi,
    Building
} from 'lucide-react';
import "../../component-styles/JobListings.css";

const WORK_TYPE_LABELS = {
    0: 'Ofiste',
    1: 'Uzaktan',
    2: 'Hibrit'
};

const WORK_TYPE_ICONS = {
    0: Building,
    1: Wifi,
    2: Computer
};

const EXPERIENCE_LEVEL_LABELS = {
    0: 'Staj',
    1: 'Giriş Seviyesi',
    2: 'Orta Seviye',
    3: 'Üst Seviye',
    4: 'Direktör',
    5: 'Yönetici'
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

    const handleApply = (e) => {
        e.stopPropagation();
        if (job.externalUrl) {
            window.open(job.externalUrl, '_blank', 'noopener,noreferrer');
        } else {
            // Handle internal application logic here
            alert('Başvuru sistemi yakında aktif olacak!');
        }
    };

    const canManage = currentUser && (
        currentUser.id === job.creatorId || 
        currentUser.userId === job.creatorId
    );

    const WorkTypeIcon = WORK_TYPE_ICONS[job.workType] || Computer;

    return (
        <div className="job-listing">
            <div className="job-header">
                <div className="job-title-section">
                    <h3>
                        <Briefcase size={20} color="#5fbcee" strokeWidth={2} />
                        {job.title}
                    </h3>
                    <h4>
                        <Building size={18} color="#5fbcee" strokeWidth={2} />
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

            {job.description && (
                <div className="job-description">
                    <p>{job.description}</p>
                </div>
            )}

            <div className="job-details">
                <div className="job-detail-item">
                    <WorkTypeIcon size={16} color="#5fbcee" strokeWidth={2} />
                    <span>Çalışma Türü: {WORK_TYPE_LABELS[job.workType] || 'Belirtilmemiş'}</span>
                </div>
                
                {job.location && (
                    <div className="job-detail-item">
                        <MapPin size={16} color="#5fbcee" strokeWidth={2} />
                        <span>Konum: {job.location}</span>
                    </div>
                )}
                
                <div className="job-detail-item">
                    <Briefcase size={16} color="#5fbcee" strokeWidth={2} />
                    <span>Deneyim: {EXPERIENCE_LEVEL_LABELS[job.experienceLevel] || 'Belirtilmemiş'}</span>
                </div>

                <div className="job-detail-item">
                    <Calendar size={16} color="#5fbcee" strokeWidth={2} />
                    <span>Yayınlanma: {formatDate(job.creationTime)}</span>
                </div>

                {job.externalUrl && (
                    <div className="job-detail-item">
                        <ExternalLink size={16} color="#5fbcee" strokeWidth={2} />
                        <span>Harici Başvuru Linki Mevcut</span>
                    </div>
                )}
            </div>

            <div className="job-footer">
                <button className="apply-btn" onClick={handleApply}>
                    {job.externalUrl ? 'Başvuru Sayfasına Git' : 'Şimdi Başvur!'}
                    {job.externalUrl ? 
                        <ExternalLink size={16} strokeWidth={2} /> : 
                        <ChevronRight size={16} strokeWidth={2} />
                    }
                </button>
            </div>
        </div>
    );
}

export default Job;
