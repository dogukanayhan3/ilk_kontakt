import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { LogOut } from "lucide-react";
import "../../component-styles/AdminNavbar.css";

function AdminNavbar() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if logout fails, redirect to login
      navigate("/login");
    }
  };

  return (
    <header className="admin-navbar">
      <div className="admin-navbar-content">
        <div className="admin-logo">
          İlk Kontakt
          <span className="admin-badge">Admin</span>
        </div>
        <button className="admin-logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Çıkış Yap</span>
        </button>
      </div>
    </header>
  );
}

export default AdminNavbar;