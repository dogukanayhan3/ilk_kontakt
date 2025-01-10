import Layout from "./Layout";
import Job from "./Job";
import jobListings from "../jobdata.json";
import "../component-styles/JobListings.css";

function JobListPage() {
    return (
        <Layout>
            <section className="welcome">
                <h1>Açık Pozisyonlar</h1>
                <p>Yeni kariyer fırsatınızı bulun!</p>
            </section>
            <section className="feed job-listings-container">
                <div className="feed-main">
                    {jobListings.map((job, index) => (
                        <Job 
                            key={index}
                            title={job.title}
                            company={job.company}
                            description={job.description}
                            location={job.location}
                            experience={job.experience}
                            salary={job.salary}
                            type={job.type}
                        />
                    ))}
                </div>
            </section>
        </Layout>
    );
}

export default JobListPage;