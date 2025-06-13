import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import AdminNavbar from "./AdminNavbar"; // Import the new navbar
import AdminUsers from "./AdminUsers";
import AdminCompanyProfiles from "./AdminCompanyProfiles";
import AdminPosts from "./AdminPosts";
import AdminJobListings from "./AdminJobListings";
import AdminUserProfiles from "./AdminUserProfiles";
import {
  Users,
  Building2,
  FileText,
  Briefcase,
  UserCircle,
  X,
} from "lucide-react";
import "../../component-styles/AdminDashboard.css";

const ADMIN_CARDS = [
  {
    key: "users",
    title: "Kullanıcı Yönetimi",
    description: "Kullanıcı hesaplarını ve rollerini yönetin",
    icon: Users,
    color: "#3FC0FF",
  },
  {
    key: "companies",
    title: "Şirket Profilleri",
    description: "Şirket profillerini onaylayın ve yönetin",
    icon: Building2,
    color: "#FFB300",
  },
  {
    key: "posts",
    title: "Gönderi Yönetimi",
    description: "Sosyal medya gönderilerini düzenleyin",
    icon: FileText,
    color: "#ff6b6b",
  },
  {
    key: "jobs",
    title: "İş İlanları",
    description: "İş ilanlarını görüntüleyin ve düzenleyin",
    icon: Briefcase,
    color: "#05E25D",
  },
  {
    key: "profiles",
    title: "Kullanıcı Profilleri",
    description: "Kullanıcı profil bilgilerini yönetin",
    icon: UserCircle,
    color: "#9C27B0",
  },
];

export default function AdminDashboard() {
  const [activeModal, setActiveModal] = useState(null);

  const openModal = (modalKey) => {
    setActiveModal(modalKey);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const renderModalContent = () => {
    switch (activeModal) {
      case "users":
        return <AdminUsers />;
      case "companies":
        return <AdminCompanyProfiles />;
      case "posts":
        return <AdminPosts />;
      case "jobs":
        return <AdminJobListings />;
      case "profiles":
        return <AdminUserProfiles />;
      default:
        return null;
    }
  };

  return (
    <div className="admin-dashboard">
      <AdminNavbar /> {/* Use the new admin navbar */}
      <main className="admin-main">
        <div className="admin-header">
          <h1>Yönetici Paneli</h1>
          <p>Sistem yönetimi ve içerik kontrolü</p>
        </div>

        <div className="admin-grid">
          {ADMIN_CARDS.map((card) => {
            const IconComponent = card.icon;
            return (
              <div
                key={card.key}
                className="admin-card"
                onClick={() => openModal(card.key)}
                style={{ "--card-color": card.color }}
              >
                <div className="admin-card-icon">
                  <IconComponent size={48} />
                </div>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </div>
            );
          })}
        </div>

        {/* Modal */}
        {activeModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>
                  {ADMIN_CARDS.find((card) => card.key === activeModal)?.title}
                </h2>
                <button className="modal-close" onClick={closeModal}>
                  <X size={24} />
                </button>
              </div>
              <div className="modal-body">{renderModalContent()}</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}