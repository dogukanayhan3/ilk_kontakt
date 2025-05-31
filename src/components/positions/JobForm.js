import React, { useState, useEffect } from 'react';
import { X, Save, Briefcase, ExternalLink } from 'lucide-react';
import "../../component-styles/JobListings.css";

const WORK_TYPES = [
    { value: 0, label: 'Ofiste' },
    { value: 1, label: 'Uzaktan' },
    { value: 2, label: 'Hibrit' }
];

const EXPERIENCE_LEVELS = [
    { value: 0, label: 'Staj' },
    { value: 1, label: 'Giriş Seviyesi' },
    { value: 2, label: 'Orta Seviye' },
    { value: 3, label: 'Üst Seviye' },
    { value: 4, label: 'Direktör' },
    { value: 5, label: 'Yönetici' }
];

function JobForm({ job, onSubmit, onClose }) {
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        description: '',
        workType: 0,
        experienceLevel: 1,
        location: '',
        externalUrl: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (job) {
            setFormData({
                title: job.title || '',
                company: job.company || '',
                description: job.description || '',
                workType: job.workType !== undefined ? job.workType : 0,
                experienceLevel: job.experienceLevel !== undefined ? job.experienceLevel : 1,
                location: job.location || '',
                externalUrl: job.externalUrl || ''
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

        if (formData.externalUrl) {
            try {
                new URL(formData.externalUrl);
            } catch {
                newErrors.externalUrl = 'Geçerli bir URL giriniz (örn: https://example.com)';
            }
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
            [name]: (name === 'workType' || name === 'experienceLevel') ? parseInt(value) : value
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
                    <div className="form-row">
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
                                placeholder="Örn: Frontend Developer"
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
                                placeholder="Şirket adı"
                            />
                            {errors.company && <span className="error-text">{errors.company}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="workType">Çalışma Türü</label>
                            <select
                                id="workType"
                                name="workType"
                                value={formData.workType}
                                onChange={handleChange}
                            >
                                {WORK_TYPES.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="experienceLevel">Deneyim Seviyesi</label>
                            <select
                                id="experienceLevel"
                                name="experienceLevel"
                                value={formData.experienceLevel}
                                onChange={handleChange}
                            >
                                {EXPERIENCE_LEVELS.map(level => (
                                    <option key={level.value} value={level.value}>
                                        {level.label}
                                    </option>
                                ))}
                            </select>
                        </div>
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
                            placeholder="Örn: İstanbul, Türkiye"
                        />
                        {errors.location && <span className="error-text">{errors.location}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="externalUrl">
                            <ExternalLink size={16} strokeWidth={1.5} />
                            Harici Başvuru URL'si
                        </label>
                        <input
                            type="url"
                            id="externalUrl"
                            name="externalUrl"
                            value={formData.externalUrl}
                            onChange={handleChange}
                            className={errors.externalUrl ? 'error' : ''}
                            placeholder="https://example.com/careers/job-id"
                        />
                        {errors.externalUrl && <span className="error-text">{errors.externalUrl}</span>}
                        <small className="form-help">
                            Başvuruların harici bir sitede yapılması durumunda bu alanı doldurun
                        </small>
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
