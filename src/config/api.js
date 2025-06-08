// API Configuration
export const API_CONFIG = {
    GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    GEMINI_API_KEY: process.env.REACT_APP_GEMINI_API_KEY,
    API_BASE: process.env.REACT_APP_API_BASE || 'https://localhost:44388',
    JOB_LISTINGS_ROOT: `${process.env.REACT_APP_API_BASE || 'https://localhost:44388'}/api/app/job-listing`,
    JOB_APPLICATIONS_ROOT: `${process.env.REACT_APP_API_BASE || 'https://localhost:44388'}/api/app/job-application`,
    PROFILE_BY_USER: `${process.env.REACT_APP_API_BASE || 'https://localhost:44388'}/api/app/user-profile/by-user`,
    EXPERIENCE_ROOT: `${process.env.REACT_APP_API_BASE || 'https://localhost:44388'}/api/app/experience`,
    EDUCATION_ROOT: `${process.env.REACT_APP_API_BASE || 'https://localhost:44388'}/api/app/education`,
    SKILL_ROOT: `${process.env.REACT_APP_API_BASE || 'https://localhost:44388'}/api/app/skill`
};