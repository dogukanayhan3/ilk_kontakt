import React, { useState, useEffect } from 'react';
import { X, Save, Briefcase } from 'lucide-react';
import "../../component-styles/JobListings.css";

const JOB_TYPES = [
    { value: 0, label: 'Tam Zamanlı' },
    { value: 1, label: 'Yarı Zamanlı' },
    { value: 2, label: 'Sözleşmeli' },
    { value: 3, label: 'Staj' },
    { value: 4, label: 'Uzaktan' }
];

function JobForm({ job, onSubmit, onClose }) {
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        description: '',
        type: 0,
        location: '',
        experienceLevel: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (job) {
            setFormData({
                title: job.title || '',
                company: job.company || '',
                description: job.description || '',
                type: job.type || 0,
                location: job.location || '',
                experienceLevel: job.experienceLevel || ''
            });
        }
    }, [job]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'İş başlığı gereklidir';
        } else if (formData.title.length > 128) {
            newErrors.title = 'İş başlığı 128 karakterden uzun olamaz';
        }

        if (!formData.company.trim()) {
            newErrors.company = 'Şirket adı gereklidir';
        } else if (formData.company.length > 128) {
            newErrors.company = 'Şirket adı 128 karakterden uzun olamaz';
        }

        if (formData.description && formData.description.length > 1000) {
            newErrors.description = 'Açıklama 1000 karakterden uzun olamaz';
        }

        if (formData.location && formData.location.length > 256) {
            newErrors.location = 'Konum 256 karakterden uzun olamaz';
        }

        if (formData.experienceLevel && formData.experienceLevel.length > 64) {
            newErrors.experienceLevel = 'Deneyim seviyesi 64 karakterden uzun olamaz';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            await onSubmit(formData);
        } catch (error) {
            console.error('Form submission error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'type' ? parseInt(value) : value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    return (
        <div className="job-form-overlay">
            <div className="job-form-container">
                <div className="job-form-header">
                    <h2>
                        <Briefcase size={24} strokeWidth={2} />
                        {job ? 'İş İlanını Düzenle' : 'Yeni İş İlanı Oluştur'}
                    </h2>
                    <button className="close-form-btn" onClick={onClose}>
                        <X size={24} strokeWidth={2} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="job-form">
                    <div className="form-group">
                        <label htmlFor="title">İş Başlığı *</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            maxLength={128}
                            className={errors.title ? 'error' : ''}
                        />
                        {errors.title && <span className="error-text">{errors.title}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="company">Şirket *</label>
                        <input
                            type="text"
                            id="company"
                            name="company"
                            value={formData.company}
                            onChange={handleChange}
                            maxLength={128}
                            className={errors.company ? 'error' : ''}
                        />
                        {errors.company && <span className="error-text">{errors.company}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="type">İş Türü</label>
                        <select
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                        >
                            {JOB_TYPES.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="location">Konum</label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            maxLength={256}
                            className={errors.location ? 'error' : ''}
                        />
                        {errors.location && <span className="error-text">{errors.location}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="experienceLevel">Deneyim Seviyesi</label>
                        <input
                            type="text"
                            id="experienceLevel"
                            name="experienceLevel"
                            value={formData.experienceLevel}
                            onChange={handleChange}
                            maxLength={64}
                            placeholder="Örn: Junior, Mid-level, Senior"
                            className={errors.experienceLevel ? 'error' : ''}
                        />
                        {errors.experienceLevel && <span className="error-text">{errors.experienceLevel}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Açıklama</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            maxLength={1000}
                            rows={6}
                            placeholder="İş tanımı, gereksinimler, faydalar..."
                            className={errors.description ? 'error' : ''}
                        />
                        {errors.description && <span className="error-text">{errors.description}</span>}
                        <small className="char-count">
                            {formData.description.length}/1000 karakter
                        </small>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={onClose}>
                            İptal
                        </button>
                        <button type="submit" className="save-btn" disabled={loading}>
                            <Save size={16} strokeWidth={2} />
                            {loading ? 'Kaydediliyor...' : (job ? 'Güncelle' : 'Oluştur')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default JobForm;
