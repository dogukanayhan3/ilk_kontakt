import React from "react";
import Layout from "../page_layout/Layout";
import "../../component-styles/StaticPages.css";

function TermsOfServicePage() {
    return (
        <Layout>
            <div className="static-page terms-of-service-page">
                <h1 className="page-title">Kullanım Şartları</h1>
                <div className="page-content">
                    <section className="terms-section">
                        <h2>1. Kabul Edilme</h2>
                        <p>
                            İlk Kontakt platformunu kullanarak, bu kullanım şartlarını kabul etmiş olursunuz. 
                            Bu şartları kabul etmiyorsanız, lütfen platformumuzu kullanmayınız.
                        </p>
                    </section>
                    
                    <section className="terms-section">
                        <h2>2. Hesap Oluşturma</h2>
                        <p>
                            Platformumuzu kullanmak için bir hesap oluşturmanız gerekmektedir. Hesap bilgilerinizin 
                            doğru, güncel ve eksiksiz olmasından siz sorumlusunuz.
                        </p>
                    </section>
                    
                    <section className="terms-section">
                        <h2>3. Kullanıcı Davranışları</h2>
                        <p>
                            Platformumuzda yasadışı, zarar verici, tehditkar, kötüye kullanım içeren, 
                            taciz edici, iftira niteliğinde veya başka şekilde uygunsuz içerik paylaşmamalısınız.
                        </p>
                    </section>
                    
                    <section className="terms-section">
                        <h2>4. Fikri Mülkiyet</h2>
                        <p>
                            Platformumuz ve içeriği, İlk Kontakt'ın veya lisans verenlerin mülkiyetindedir 
                            ve fikri mülkiyet yasalarıyla korunmaktadır.
                        </p>
                    </section>
                    
                    <section className="terms-section">
                        <h2>5. Hizmet Değişiklikleri</h2>
                        <p>
                            İlk Kontakt, herhangi bir zamanda, önceden bildirim yapmaksızın platformu değiştirme, 
                            askıya alma veya sonlandırma hakkını saklı tutar.
                        </p>
                    </section>
                    
                    <section className="terms-section">
                        <h2>6. Sorumluluk Sınırlaması</h2>
                        <p>
                            İlk Kontakt, platformun kullanımından kaynaklanan doğrudan, dolaylı, arızi (gelip geçici), 
                            özel veya sonuç olarak ortaya çıkan zararlardan sorumlu değildir.
                        </p>
                    </section>
                    
                    <section className="terms-section">
                        <h2>7. Uygulanacak Hukuk</h2>
                        <p>
                            Bu kullanım şartları, Türkiye Cumhuriyeti yasalarına tabidir ve bu yasalara göre yorumlanacaktır.
                        </p>
                    </section>
                </div>
            </div>
        </Layout>
    );
}

export default TermsOfServicePage;