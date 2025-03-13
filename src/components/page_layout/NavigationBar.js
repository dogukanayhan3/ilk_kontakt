import "../../component-styles/NavigationBar.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, User, BriefcaseBusiness, Globe, Bell, Library } from 'lucide-react';

function NavigationBar() {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { 
            name: 'homepage', 
            path: '/homepage', 
            label: 'Keşfet', 
            icon: Home,
            activeColor: '#00ff00'
        },
        { 
            name: 'joblistpage', 
            path: '/joblistpage', 
            label: 'Pozisyonlar', 
            icon: BriefcaseBusiness,
            activeColor: '#ff6b6b' 
        },
        { 
            name: 'socialpage', 
            path: '/socialpage', 
            label: 'Sosyal', 
            icon: Globe,
            activeColor: '#3FC0FF'
        },
        { 
            name: 'educationpage', 
            path: '/educationpage', 
            label: 'Eğitimler', 
            icon: Library,
            activeColor: '#FFB300' 
        },
        { 
            name: 'profilepage', 
            path: '/profilepage', 
            label: 'Profil', 
            icon: User,
            activeColor: '#05E25D'
        },
        { 
            name: 'notificationspage', 
            path: '/notificationspage', 
            label: 'Bildirimler', 
            icon: Bell,
            activeColor: '#FF6600'
        }
    ];

    const handleLogout = (e) => {
        e.preventDefault();
        localStorage.removeItem('isAuthenticated');
        navigate('/login');
    };

    return (
        <header className="navbar">
            <Link to="/" className="logo">İlk Kontakt</Link>
            <nav>
                <ul>
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const IconComponent = item.icon;

                    return (
                    <li key={item.name}>
                        <Link 
                        to={item.path}
                        className={`nav-item ${isActive ? "active" : ""}`}
                        style={{
                            '--active-color': item.activeColor
                        }}
                        >
                        <IconComponent 
                            size={20}
                            strokeWidth={1.5}
                            className="nav-icon"
                        />
                        <span>{item.label}</span>
                        </Link>
                    </li>
                    );
                })}
                </ul>
            </nav>
            <Link to="/" onClick={handleLogout} className="exit">Çıkış Yap</Link>
        </header>
    );
}

export default NavigationBar;