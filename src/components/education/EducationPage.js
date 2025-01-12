import React from 'react';
import Layout from "../page_layout/Layout";
import CourseCard from './CourseCard';
import "../../component-styles/EducationPage.css";
import courses from "../../coursesdata.json";

function EducationPage() {
    return (
        <Layout>
            <section className="welcome">
                <h1>Eğitim Programları</h1>
                <p>Kariyerinizi geliştirecek online kurslar!</p>
            </section>
            <section className="education-listings-container">
                {courses.map(course => (
                    <CourseCard key={course.id} course={course} />
                ))}
            </section>
        </Layout>
    );
}

export default EducationPage;