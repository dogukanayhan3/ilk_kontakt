import React from "react";
import Layout from "../page_layout/Layout";
import "../../component-styles/StaticPages.css";

function PrivacyPolicyPage() {
    return (
        <Layout>
            <div className="static-page privacy-policy-page">
                <h1 className="page-title">Gizlilik Politikası</h1>
                <div className="page-content">
                    <section className="policy-section">
                        <h2>1. Giriş</h2>
                        <p>
                            İlk Kontakt olarak gizliliğinize saygı duyuyor ve kişisel verilerinizin 
                            korunmasına önem veriyoruz. Bu Gizlilik Politikası, platformumuzu kullanırken 
                            hangi bilgileri topladığımızı, bunları nasıl kullandığımızı ve koruduğumuzu 
                            açıklamaktadır.
                        </p>
                    </section>
                    
                    <section className="policy-section">
                        <h2>2. Toplanan Bilgiler</h2>
                        <p>
                            Platformumuza kaydolduğunuzda, profilinizi güncellerken, iş ilanı verirken 
                            veya başvuru yaparken belirli kişisel bilgilerinizi (isim, e-posta adresi, 
                            telefon numarası, eğitim ve iş geçmişi gibi) toplamaktayız.
                        </p>
                    </section>
                    
                    <section className="policy-section">
                        <h2>3. Bilgilerin Kullanımı</h2>
                        <p>
                            Topladığımız bilgileri, hizmetlerimizi sunmak, geliştirmek, güvenliği sağlamak için kullanıyoruz.
                        </p>
                    </section>
                    
                    <section className="policy-section">
                        <h2>4. Bilgilerin Paylaşımı</h2>
                        <p>
                            Kişisel bilgilerinizi, yasal zorunluluklar dışında üçüncü taraflarla paylaşmıyoruz. 
                            Profil bilgileriniz, platformdaki diğer kullanıcılar tarafından görüntülenebilir.
                        </p>
                    </section>
                    
                    <section className="policy-section">
                        <h2>5. Veri Güvenliği</h2>
                        <p>
                            Bilgilerinizi korumak için teknik ve idari önlemler alıyoruz.
                        </p>
                    </section>
                    
                    <section className="policy-section">
                        <h2>6. Politika Değişiklikleri</h2>
                        <p>
                            Bu politikayı zaman zaman güncelleyebiliriz. Değişiklikler durumunda, 
                            platformumuzda duyuru yapılacaktır.
                        </p>
                    </section>
                </div>
            </div>
        </Layout>
    );
}

export default PrivacyPolicyPage;