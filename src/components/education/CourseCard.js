import { Book, Users, Clock, Award, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import "../../component-styles/EducationPage.css";

const API_BASE = 'https://localhost:44388';
const ENROLLMENT_ROOT = `${API_BASE}/api/app/enrollment`;

// Helper to get XSRF cookie
function getCookie(name) {
  const m = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return m ? m[2] : null;
}

function CourseCard({ course, isInstructor, onInstructorStatusChange }) {
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [error, setError] = useState('');
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    // Format the creation date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleEnrollment = async () => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        setIsEnrolling(true);
        setError('');

        try {
            // Get XSRF token
            await fetch(`${API_BASE}/api/abp/application-configuration`, {
                credentials: 'include'
            });
            const xsrf = getCookie('XSRF-TOKEN');
            if (!xsrf) throw new Error('XSRF token not found');

            // Create enrollment
            const res = await fetch(ENROLLMENT_ROOT, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    accept: 'application/json',
                    'Content-Type': 'application/json',
                    RequestVerificationToken: xsrf,
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({
                    courseId: course.id,
                    studentId: currentUser.id
                })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error?.message || 'Kayıt işlemi başarısız');
            }

            alert('Kursa başarıyla kaydoldunuz!');
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setIsEnrolling(false);
        }
    };

    return (
        <div className="course-listing">
            <div className="course-image">
                <img 
                    src={course.thumbnailUrl || '/default-course-image.jpg'} 
                    alt={course.title} 
                />
            </div>
            <div className="course-details">
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                <div className="course-meta">
                    <div className="instructor-info">
                        <Users size={18} strokeWidth={1.5} />
                        <div>
                            <strong>Eğitmen ID: {course.instructorId}</strong>
                            <p>Oluşturulma: {formatDate(course.creationTime)}</p>
                        </div>
                    </div>
                    <div className="course-additional-info">
                        <div className="course-status">
                            <Award size={18} strokeWidth={1.5} />
                            <p>{course.isPublished ? 'Yayında' : 'Taslak'}</p>
                        </div>
                    </div>
                </div>
                {error && <div className="error-message">{error}</div>}
                <div className="course-footer">
                    <button 
                        className="apply-btn" 
                        onClick={handleEnrollment}
                        disabled={isEnrolling}
                    >
                        {isEnrolling ? 'Kaydediliyor...' : 'Kursa Kayıt Ol'}
                        <ChevronRight size={18} strokeWidth={3} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CourseCard;