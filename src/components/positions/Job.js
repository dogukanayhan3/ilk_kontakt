import React from 'react';
import { Computer, MapPin, Briefcase, DollarSign, ChevronRight } from 'lucide-react';
import "../../component-styles/JobListings.css";

function Job({ title, company, description, location, experience, salary, type }) {
    return (
        <div className="job-listing">
            <div className="job-header">
                <h3>
                    <Briefcase size={20} color="#5fbcee" strokeWidth={2} />
                    {title} - {company}
                </h3>
                <h4>
                    <Computer size={20} color="#5fbcee" strokeWidth={2} />
                    {type}
                </h4>
            </div>
            <p>{description}</p>
            <div className="job-details">
                <p>
                    <MapPin size={16} color="#5fbcee" strokeWidth={2} />
                    Konum: {location}
                </p>
                <p>
                    <Briefcase size={16} color="#5fbcee" strokeWidth={2} />
                    Deneyim: {experience}
                </p>
                <p>
                    <DollarSign size={16} color="#5fbcee" strokeWidth={2} />
                    Maaş: {salary}
                </p>
            </div>
            <button className="apply-btn">
                Şimdi Başvur!
                <ChevronRight size={16} strokeWidth={2} />
            </button>
        </div>
    );
}

export default Job;