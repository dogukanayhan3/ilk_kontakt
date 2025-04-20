import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Mail, Phone, UserCircle, CheckCircle } from 'lucide-react';
import { useAuth } from "../../contexts/AuthContext";
import '../../component-styles/LoginPage.css';

// Helper to get a cookie value by name
function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}

function LoginPage() {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        name: '',
        surname: '',
        email: '',
        phoneNumber: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { setCurrentUser } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            // 1. Ensure XSRF-TOKEN cookie is set
            await fetch('https://localhost:44388/api/abp/application-configuration', {
                credentials: 'include'
            });

            // 2. Get the XSRF token from the cookie
            const xsrfToken = getCookie('XSRF-TOKEN');
            if (!xsrfToken) {
                setError('XSRF token not found');
                return;
            }

            // 3. Make the login request
            const response = await fetch('https://localhost:44388/api/account/login', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                    'RequestVerificationToken': xsrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'include',
                body: JSON.stringify({
                    userNameOrEmailAddress: formData.username,
                    password: formData.password,
                    rememberMe: true
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.error?.message || 'Giriş başarısız oldu');
                return;
            }

            // 4. Optionally, fetch user info to set in context
            const userResponse = await fetch('https://localhost:44388/api/account/my-profile', {
                credentials: 'include'
            });

            if (!userResponse.ok) {
                setError('Kullanıcı bilgileri alınamadı');
                return;
            }

            const userData = await userResponse.json();
            const userInfo = {
                username: userData.userName,
                email: userData.email,
                name: userData.name,
                surname: userData.surname,
                profileImage: "https://via.placeholder.com/150"
            };

            setCurrentUser(userInfo);
            localStorage.setItem('userData', JSON.stringify(userInfo));
            localStorage.setItem('isAuthenticated', 'true');
            navigate('/homepage');
        } catch (err) {
            setError('Bir hata oluştu: ' + err.message);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Şifreler eşleşmiyor!');
            return;
        }

        try {
            // First get the XSRF token
            await fetch('https://localhost:44388/api/abp/application-configuration', {
                credentials: 'include'
            });

            const xsrfToken = getCookie('XSRF-TOKEN');
            if (!xsrfToken) {
                setError('XSRF token not found');
                return;
            }

            // Create registration data with required and optional fields
            const registrationData = {
                userName: formData.username,
                emailAddress: formData.email,
                password: formData.password,
                appName: "IlkKontaktApp",
                extraProperties: {
                    name: formData.name,
                    surname: formData.surname,
                    phoneNumber: formData.phoneNumber
                }
            };

            const response = await fetch('https://localhost:44388/api/account/register', {
                method: 'POST',
                headers: {
                    'accept': 'text/plain',
                    'Content-Type': 'application/json',
                    'RequestVerificationToken': xsrfToken,
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'include',
                body: JSON.stringify(registrationData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Kayıt işlemi başarısız oldu');
            }

            // After successful registration, switch to login mode and clear sensitive data
            setIsLoginMode(true);
            setFormData(prev => ({
                ...prev,
                password: '',
                confirmPassword: ''
            }));
            setError('Kayıt başarılı! Lütfen giriş yapın.');

        } catch (err) {
            console.error('Registration error:', err);
            setError('Kayıt sırasında bir hata oluştu: ' + err.message);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="login-wrapper">
            <div className={`login-card ${isLoginMode ? 'login-mode' : 'signup-mode'}`}>
                <h2>{isLoginMode ? 'Giriş Yap' : 'Kayıt Ol'}</h2>
                {error && <div className="error-message">{error}</div>}
                
                {isLoginMode ? (
                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label><User size={18} /> Kullanıcı Adı</label>
                            <input
                                type="text"
                                name="username"
                                placeholder="Kullanıcı adınızı girin"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label><Lock size={18} /> Şifre</label>
                            <input
                                type="password"
                                name="password"
                                placeholder="Şifrenizi girin"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <button type="submit" className="login-button">
                            Giriş Yap
                        </button>
                        <p className="toggle-text">
                            Henüz bizi tanımıyor musunuz?{' '}
                            <span className="toggle-link" onClick={() => setIsLoginMode(false)}>
                                Hemen kayıt olun!
                            </span>
                        </p>
                    </form>
                ) : (
                    <form onSubmit={handleSignup} className="login-form">
                        <div className="form-group">
                            <label><User size={18} /> Kullanıcı Adı</label>
                            <input
                                type="text"
                                name="username"
                                placeholder="Kullanıcı adınızı belirleyin"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label><UserCircle size={18} /> Ad</label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Adınızı girin"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label><UserCircle size={18} /> Soyad</label>
                            <input
                                type="text"
                                name="surname"
                                placeholder="Soyadınızı girin"
                                value={formData.surname}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label><Mail size={18} /> E-posta</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="E-posta adresinizi girin"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label><Phone size={18} /> Telefon</label>
                            <input
                                type="tel"
                                name="phoneNumber"
                                placeholder="Telefon numaranızı girin"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label><Lock size={18} /> Şifre</label>
                            <input
                                type="password"
                                name="password"
                                placeholder="Şifrenizi belirleyin"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label><CheckCircle size={18} /> Şifre Tekrar</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Şifrenizi tekrar girin"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <button type="submit" className="login-button">
                            Kayıt Ol
                        </button>
                        <p className="toggle-text">
                            Zaten hesabınız var mı?{' '}
                            <span className="toggle-link" onClick={() => setIsLoginMode(true)}>
                                Giriş yapın
                            </span>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}

export default LoginPage;
