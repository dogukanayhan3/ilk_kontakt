import React from "react";
import Layout from "../page_layout/Layout";
import "../../component-styles/StaticPages.css";

function AboutUsPage() {
    return (
        <Layout>
            <div className="static-page about-us-page">
                <h1 className="page-title">Hakkımızda</h1>
                <div className="page-content">
                    <section className="about-section">
                        <h2>İlk Kontakt Nedir?</h2>
                        <p>
                            İlk Kontakt, profesyonel hayata yeni atılan gençlerin ve şirketlerin bir araya gelerek bağlantı kurmasını, 
                            işbirliği yapmasını ve kariyer fırsatlarını keşfetmesini sağlayan profesyonel bir ağdır.
                        </p>
                        <p>
                            2024-2025 yıllarında kurulan İlk Kontakt, genç profesyonellerin iş dünyasına ilk adımlarını atmalarını,
                            kariyerlerini geliştirmesini ve şirketlerin en iyi yetenekleri bulmasını kolaylaştırmak amacıyla geliştirilmiştir.
                        </p>
                    </section>
                    
                    <section className="about-section">
                        <h2>Misyonumuz</h2>
                        <p>
                            Profesyonellerin kariyerlerinde ilerlemelerine yardımcı olmak ve şirketlerin 
                            en iyi yetenekleri bulmalarını sağlayarak iş dünyasındaki bağlantıları 
                            güçlendirmek.
                        </p>
                    </section>
                    
                    <section className="about-section">
                        <h2>Vizyonumuz</h2>
                        <p>
                            Genç profesyonellerden başlayarak Türkiye'nin en güvenilir ve etkili profesyonel ağı olmak ve kullanıcılarımıza 
                            kariyer gelişimlerinde değer katan bir platform sunmak.
                        </p>
                    </section>
                    
                    <section className="about-section">
                        <h2>Ekibimiz</h2>
                        <p>
                            İlk Kontakt, Ankara Bilim Üniversitesi öğrencileri tarafından oluşturulan bir ekip tarafından yönetilmektedir.
                        </p>
                    </section>
                </div>
            </div>
        </Layout>
    );
}

export default AboutUsPage;