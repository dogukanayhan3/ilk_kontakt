import { Book, Users, Clock, Award, ChevronRight } from 'lucide-react';
import "../component-styles/EducationPage.css";

function CourseCard({ course }) {
    return (
        <div className="course-listing">
            <div className="course-image">
                <img src={course.imageUrl} alt={course.title} />
            </div>
            <div className="course-details">
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                <div className="course-meta">
                    <div className="instructor-info">
                        <Users size={18} strokeWidth={1.5} />
                        <div>
                            <strong>{course.instructor}</strong>
                            <p>{course.instructorTitle}</p>
                        </div>
                    </div>
                    <div className="course-additional-info">
                        <div className="course-duration">
                            <Clock size={18} strokeWidth={1.5} />
                            <p>{course.duration}</p>
                        </div>
                        <div className="course-level">
                            <Award size={18} strokeWidth={1.5} />
                            <p>{course.level}</p>
                        </div>
                    </div>
                </div>
                <div className="course-footer">
                    <span className="course-price">{course.price}</span>
                    <button className="apply-btn">
                        Kursa Kayıt Ol
                        <ChevronRight size={18} strokeWidth={3} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CourseCard;