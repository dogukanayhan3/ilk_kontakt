import React from 'react';
import { Users, Briefcase, Link2, ArrowUpRight } from 'lucide-react';
import Layout from "./Layout";
import SocialConnectionCard from "./SocialConnectionCard"
import "../component-styles/SocialPage.css";
import socialConnections from "../socialConnections.json";


function SocialPage() {
    return (
        <Layout>
            <section className="welcome">
                <h1>Profesyonel Ağ</h1>
                <p>Alanınızdaki profesyonelleri keşfedin ve bağlantı kurun!</p>
            </section>
            <section className="social-connections-container">
                <div className="connections-grid">
                    {socialConnections.map(connection => (
                        <SocialConnectionCard 
                            key={connection.id} 
                            connection={connection} 
                        />
                    ))}
                </div>
                <div className="network-actions">
                    <button className="expand-network-btn">
                        <Users size={18} strokeWidth={1.5} />
                        Ağınızı genişletin
                    </button>
                </div>
            </section>
        </Layout>
    );
}

export default SocialPage;