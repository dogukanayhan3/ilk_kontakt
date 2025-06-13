import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import AdminNavbar from "./AdminNavbar";
import AdminUsers from "./AdminUsers";
import AdminCompanyProfiles from "./AdminCompanyProfiles";
import AdminPosts from "./AdminPosts";
import AdminJobListings from "./AdminJobListings";
import AdminUserProfiles from "./AdminUserProfiles";
import AdminContactMessages from "./AdminContactMessages";
import AdminPasswordResets from "./AdminPasswordResets";
import {
  Users,
  Building2,
  FileText,
  Briefcase,
  UserCircle,
  MessageSquare,
  KeyRound,
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
  {
    key: "messages",
    title: "İletişim Mesajları",
    description: "Kullanıcılardan gelen mesajları görüntüleyin",
    icon: MessageSquare,
    color: "#00D4AA",
  },
  {
    key: "password-resets",
    title: "Şifre Sıfırlama Talepleri",
    description: "Şifre sıfırlama taleplerini yönetin",
    icon: KeyRound,
    color: "#FF6B35",
  },
];

export default function AdminDashboard() {
  const [activeModal, setActiveModal] = useState(null);
  const [isModalAnimating, setIsModalAnimating] = useState(false);

  const openModal = (modalKey) => {
    if (isModalAnimating) return; // Prevent multiple clicks during animation
    
    setIsModalAnimating(true);
    setActiveModal(modalKey);
    document.body.classList.add('modal-open');
    
    // Reset animation state after animation completes
    setTimeout(() => {
      setIsModalAnimating(false);
    }, 400);
  };

  const closeModal = () => {
    if (isModalAnimating) return;
    
    setIsModalAnimating(true);
    document.body.classList.remove('modal-open');
    
    // Add closing animation
    const modalContent = document.querySelector('.modal-content');
    if (modalContent) {
      modalContent.style.animation = 'modalSlideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards';
    }
    
    setTimeout(() => {
      setActiveModal(null);
      setIsModalAnimating(false);
    }, 300);
  };

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && activeModal) {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.classList.remove('modal-open');
    };
  }, [activeModal]);

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
      case "messages":
        return <AdminContactMessages />;
      case "password-resets":
        return <AdminPasswordResets />;
      default:
        return null;
    }
  };

  return (
    <div className="admin-dashboard">
      <AdminNavbar />
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
                className={`admin-card ${isModalAnimating ? 'disabled' : ''}`}
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