import Layout from "../page_layout/Layout";
import "../../component-styles/ContactPage.css";
import { useState } from "react";

const API_BASE = "https://localhost:44388";

function getCookie(name) {
  const m = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return m ? m[2] : null;
}

function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "loading", message: "Gönderiliyor..." });

    try {
      // Get XSRF token
      await fetch(`${API_BASE}/api/abp/application-configuration`, {
        credentials: "include",
      });
      const xsrf = getCookie("XSRF-TOKEN");
      if (!xsrf) throw new Error("XSRF token bulunamadı");

      const response = await fetch(`${API_BASE}/api/app/contact-us`, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          RequestVerificationToken: xsrf,
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error?.message || "Gönderim başarısız oldu");
      }

      setStatus({
        type: "success",
        message: "Mesajınız başarıyla gönderildi!",
      });
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Contact form submission error:", error);
      setStatus({
        type: "error",
        message: error.message || "Bir hata oluştu. Lütfen tekrar deneyin.",
      });
    }
  };

  return (
    <Layout>
      <section>
        <h2 className="section-title">İletişim</h2>
        <p className="section-subtitle">
          Bizimle iletişime geçmek için aşağıdaki formu doldurabilir veya
          iletişim bilgilerimizi kullanarak bize ulaşabilirsiniz.
        </p>
        <form className="contact-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Adınız Soyadınız"
            required
            value={formData.name}
            onChange={handleChange}
          />
          <input
            type="email"
            name="email"
            placeholder="E-posta Adresiniz"
            required
            value={formData.email}
            onChange={handleChange}
          />
          <textarea
            name="message"
            placeholder="Mesajınız"
            required
            value={formData.message}
            onChange={handleChange}
          ></textarea>
          {status.message && (
            <div className={`status-message ${status.type}`}>
              {status.message}
            </div>
          )}
          <button type="submit" disabled={status.type === "loading"}>
            {status.type === "loading" ? "Gönderiliyor..." : "Gönder"}
          </button>
        </form>
        <div className="contact-info">
          <h3>İletişim Bilgilerimiz</h3>
          <p>
            <strong>Adres:</strong> Çankaya, Ankara, Türkiye
          </p>
          <p>
            <strong>Telefon:</strong> +90 543 543 56 56
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
