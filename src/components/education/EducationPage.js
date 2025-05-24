import React, { useState, useEffect, useCallback } from 'react';
import Layout from "../page_layout/Layout";
import CourseCard from './CourseCard';
import "../../component-styles/EducationPage.css";
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Plus } from 'lucide-react';

const API_BASE_URL = 'https://localhost:44388';
const INSTRUCTOR_ROOT = `${API_BASE_URL}/api/app/instructor`;

// Helper to get XSRF cookie
function getCookie(name) {
    const m = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return m ? m[2] : null;
}

function EducationPage() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isInstructor, setIsInstructor] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
        }
    }, [currentUser, navigate]);

    const checkInstructorStatus = useCallback(async () => {
        if (!currentUser) return;

        try {
            const response = await fetch(
                `${INSTRUCTOR_ROOT}/current-user-instructor`,
                {
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (response.ok) {
                setIsInstructor(true);
            } else if (response.status === 404) {
                setIsInstructor(false);
            } else {
                throw new Error('Failed to check instructor status');
            }
        } catch (err) {
            console.error('Check instructor status error:', err);
            // If there's an error, assume not an instructor
            setIsInstructor(false);
        }
    }, [currentUser]);

    const handleInstructorApplication = async () => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        setIsApplying(true);
        setError('');

        try {
            // Get XSRF token
            await fetch(`${API_BASE_URL}/api/abp/application-configuration`, {
                credentials: 'include'
            });
            const xsrf = getCookie('XSRF-TOKEN');
            if (!xsrf) throw new Error('XSRF token not found');

            // Create instructor application
            const res = await fetch(INSTRUCTOR_ROOT, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    accept: 'application/json',
                    'Content-Type': 'application/json',
                    RequestVerificationToken: xsrf,
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({
                    // The backend will automatically set userId and InstructorUserProfileId
                })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error?.message || 'Eğitmen başvurusu başarısız');
            }

            alert('Eğitmen başvurunuz başarıyla alındı!');
            checkInstructorStatus();
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setIsApplying(false);
        }
    };

    const handleCreateCourse = () => {
        navigate('/create-course');
    };

    const fetchCourses = useCallback(async () => {
        setError('');
        if (!currentUser) return;

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/app/course/published-courses`,
                {
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (response.status === 401 || response.redirected) {
                console.log('Unauthorized or redirected, navigating to login.');
                navigate('/login');
                return;
            }

            if (!response.ok) {
                throw new Error(`Failed to fetch courses (Status: ${response.status})`);
            }

            const data = await response.json();
            setCourses(Array.isArray(data.items) ? data.items : []);
        } catch (err) {
            console.error('Fetch courses error:', err);
            setError(err.message);
            setCourses([]);
        } finally {
            setLoading(false);
        }
    }, [navigate, currentUser]);

    // Initial fetch on component mount if user is logged in
    useEffect(() => {
        if (currentUser) {
            setLoading(true);
            fetchCourses();
            checkInstructorStatus();
        } else {
            setLoading(false);
        }
    }, [currentUser, fetchCourses, checkInstructorStatus]);

    // Render only if user is authenticated (or during initial load check)
    if (!currentUser && !loading) {
        return null;
    }

    if (loading) {
        return (
            <Layout>
                <div className="loading-container">
                    <p>Loading courses...</p>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="error-container">
                    <p>Error: {error}</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <section className="welcome">
                <h1>Eğitim Programları</h1>
                <p>Kariyerinizi geliştirecek online kurslar!</p>
            </section>
            <section className="education-listings-container">
                <div className="instructor-application-section">
                    {!isInstructor ? (
                        <button 
                            className="instructor-btn"
                            onClick={handleInstructorApplication}
                            disabled={isApplying}
                        >
                            <GraduationCap size={18} strokeWidth={1.5} />
                            {isApplying ? 'Başvuru Yapılıyor...' : 'Eğitmen Olmak İçin Başvur!'}
                        </button>
                    ) : (
                        <button 
                            className="create-course-btn"
                            onClick={handleCreateCourse}
                        >
                            <Plus size={18} strokeWidth={1.5} />
                            Kurs Yükle
                        </button>
                    )}
                </div>
                {courses.length === 0 ? (
                    <p className="no-courses">Henüz kurs bulunmamaktadır.</p>
                ) : (
                    courses.map(course => (
                        <CourseCard 
                            key={course.id} 
                            course={course} 
                            isInstructor={isInstructor}
                            onInstructorStatusChange={checkInstructorStatus}
                        />
                    ))
                )}
            </section>
        </Layout>
    );
}

export default EducationPage;
