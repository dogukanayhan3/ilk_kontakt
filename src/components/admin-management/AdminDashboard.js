import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import AdminNavbar from "./AdminNavbar";
import AdminUsers from "./AdminUsers";
import AdminCompanyProfiles from "./AdminCompanyProfiles";
import AdminPosts from "./AdminPosts";
import AdminJobListings from "./AdminJobListings";
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
  const [modalSize, setModalSize] = useState({ 
    width: 'auto', 
    height: 'auto',
    minWidth: '600px',
    maxWidth: '1000px',
    preferredWidth: '80vw'
  });
  const modalContentRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Configuration for different modal types
  const getModalConfig = (modalKey) => {
    const configs = {
      users: { 
        minWidth: '900px', 
        maxWidth: '1400px', 
        preferredWidth: '95vw',
        minHeight: '500px',
        maxHeight: '85vh'
      },
      companies: { 
        minWidth: '800px', 
        maxWidth: '1200px', 
        preferredWidth: '90vw',
        minHeight: '450px',
        maxHeight: '80vh'
      },
      posts: { 
        minWidth: '700px', 
        maxWidth: '1100px', 
        preferredWidth: '88vw',
        minHeight: '400px',
        maxHeight: '80vh'
      },
      jobs: { 
        minWidth: '850px', 
        maxWidth: '1300px', 
        preferredWidth: '92vw',
        minHeight: '500px',
        maxHeight: '85vh'
      },
      profiles: { 
        minWidth: '800px', 
        maxWidth: '1250px', 
        preferredWidth: '90vw',
        minHeight: '450px',
        maxHeight: '82vh'
      },
      messages: { 
        minWidth: '750px', 
        maxWidth: '1150px', 
        preferredWidth: '88vw',
        minHeight: '400px',
        maxHeight: '80vh'
      },
      'password-resets': { 
        minWidth: '800px', 
        maxWidth: '1200px', 
        preferredWidth: '90vw',
        minHeight: '450px',
        maxHeight: '82vh'
      },
    };
    
    return configs[modalKey] || { 
      minWidth: '600px', 
      maxWidth: '1000px', 
      preferredWidth: '80vw',
      minHeight: '400px',
      maxHeight: '80vh'
    };
  };

  // Responsive breakpoint detection
  const getResponsiveConfig = (config) => {
    const screenWidth = window.innerWidth;
    
    if (screenWidth < 768) {
      // Mobile
      return {
        ...config,
        preferredWidth: '100vw',
        minWidth: '100vw',
        maxWidth: '100vw',
        minHeight: '100vh',
        maxHeight: '100vh',
        borderRadius: '0'
      };
    } else if (screenWidth < 1024) {
      // Tablet
      return {
        ...config,
        preferredWidth: '95vw',
        minWidth: '95vw',
        maxWidth: '95vw',
        maxHeight: '90vh'
      };
    } else if (screenWidth < 1440) {
      // Small desktop
      return {
        ...config,
        preferredWidth: config.preferredWidth,
        maxWidth: Math.min(parseInt(config.maxWidth), screenWidth * 0.9) + 'px'
      };
    }
    
    // Large desktop - use original config
    return config;
  };

  const openModal = (modalKey) => {
    if (isModalAnimating) return;
    
    setIsModalAnimating(true);
    setActiveModal(modalKey);
    document.body.classList.add('modal-open');
    
    // Set modal size based on content type and screen size
    const baseConfig = getModalConfig(modalKey);
    const responsiveConfig = getResponsiveConfig(baseConfig);
    setModalSize(responsiveConfig);
    
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
    const modalContent = modalContentRef.current;
    if (modalContent) {
      modalContent.style.animation = 'modalSlideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards';
    }
    
    setTimeout(() => {
      setActiveModal(null);
      setIsModalAnimating(false);
      // Reset modal size
      setModalSize({ 
        width: 'auto', 
        height: 'auto',
        minWidth: '600px',
        maxWidth: '1000px',
        preferredWidth: '80vw'
      });
    }, 300);
  };

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && activeModal) {
        closeModal();
      }
    };

    const handleResize = () => {
      if (activeModal) {
        // Recalculate modal size on window resize
        const baseConfig = getModalConfig(activeModal);
        const responsiveConfig = getResponsiveConfig(baseConfig);
        setModalSize(responsiveConfig);
      }
    };

    document.addEventListener('keydown', handleEscape);
    window.addEventListener('resize', handleResize);
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('resize', handleResize);
      document.body.classList.remove('modal-open');
    };
  }, [activeModal]);

  // Check if user is admin (you might want to adjust this based on your auth system)
  useEffect(() => {
    if (user && !user.isAdmin) {
      navigate('/');
    }
  }, [user, navigate]);

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
      case "messages":
        return <AdminContactMessages />;
      case "password-resets":
        return <AdminPasswordResets />;
      default:
        return null;
    }
  };

  const getModalTitle = () => {
    const card = ADMIN_CARDS.find((card) => card.key === activeModal);
    return card ? card.title : '';
  };

  const getModalStyles = () => {
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
      return {
        width: '100vw',
        height: '100vh',
        maxWidth: '100vw',
        maxHeight: '100vh',
        minWidth: '100vw',
        minHeight: '100vh',
        borderRadius: '0',
        margin: '0'
      };
    }

    return {
      width: modalSize.preferredWidth,
      minWidth: modalSize.minWidth,
      maxWidth: modalSize.maxWidth,
      minHeight: modalSize.minHeight,
      maxHeight: modalSize.maxHeight,
      borderRadius: modalSize.borderRadius || '24px'
    };
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

        {/* Enhanced Dynamic Modal */}
        {activeModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div 
              className="modal-content" 
              onClick={(e) => e.stopPropagation()}
              ref={modalContentRef}
              style={getModalStyles()}
            >
              <div className="modal-header">
                <h2>{getModalTitle()}</h2>
                <button 
                  className="modal-close" 
                  onClick={closeModal}
                  aria-label="Close modal"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="modal-body">
                <div className="modal-content-wrapper">
                  {renderModalContent()}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}