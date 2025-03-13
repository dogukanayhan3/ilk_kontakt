import { Link } from "react-router-dom";
import "../../component-styles/Footer.css"

function Footer() {
    return(
        <footer>
            <p>© 2024 İlk Kontakt</p>
            <div>
                <Link to="/about_us">Hakkımızda</Link> | 
                <Link to="/privacy_policy">Gizlilik Sözleşmesi</Link> | 
                <Link to="/terms_of_service">Kullanım Şartları</Link> | 
                <Link to="/contact_us">Bizimle İletişime Geçin!</Link>
            </div>
        </footer>
    );
}
export default Footer;