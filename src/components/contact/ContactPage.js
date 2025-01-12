import Layout from "../page_layout/Layout";
import "../../component-styles/ContactPage.css";

function ContactPage() {
    return (
        <Layout>
                <section>   
                    <h2 className="section-title">İletişim</h2>
                    <p className="section-subtitle">
                        Bizimle iletişime geçmek için aşağıdaki formu doldurabilir veya iletişim
                        bilgilerimizi kullanarak bize ulaşabilirsiniz.
                    </p>    
                    <form className="contact-form">
                        <input
                            type="text"
                            name="name"
                            placeholder="Adınız Soyadınız"      
                            required
                        />
                        <input 
                            type="email"
                            name="email"
                            placeholder="E-posta Adresiniz"
                            required
                        />
                        <textarea
                            name="message"
                            placeholder="Mesajınız"
                            required
                        ></textarea>
                        <button type="submit">Gönder</button>
                    </form>
                    <div className="contact-info">
                        <h3>İletişim Bilgilerimiz</h3>
                        <p>
                            <strong>Adres:</strong> Mutlukent Mah. 1986.Sokak. No:8 Çankaya – ANKARA/TURKIYE
                        </p>
                        <p>
                            <strong>Telefon:</strong> +90 123 456 7890
                        </p>
                        <p>
                            <strong>E-posta:</strong> info@ilkkontakt.com
                        </p>
                    </div>
                </section>
        </Layout>
    );
}

export default ContactPage;