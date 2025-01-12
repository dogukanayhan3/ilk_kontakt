import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, Briefcase, GraduationCap, CheckCircle } from 'lucide-react';
import "../../component-styles/LoginPage.css";

function LoginPage() {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        name: '',
        email: '',
        role: 'student', // 'student' or 'working'
        organization: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isLoginMode) {
            if (formData.username === 'admin' && formData.password === '1234') {
                localStorage.setItem('isAuthenticated', 'true');
                navigate("/homepage");
                return;
            }
            setError('Kullanıcı adı veya şifre yanlış');
        } else {
            if (formData.password !== formData.confirmPassword) {
                setError('Şifreler eşleşmiyor!');
                return;
            }
            alert("Kayıt başarılı! Giriş yapabilirsiniz.");
            setIsLoginMode(true);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <div className={`login-wrapper ${isLoginMode ? 'login-mode' : 'signup-mode'}`}>
            <div className="login-card">
                <h2>{isLoginMode ? 'Giriş Yap' : 'Kayıt Ol'}</h2>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="login-form">
                    {!isLoginMode && (
                        <>
                            <div className="form-group">
                                <label><User size={18} /> Ad Soyad</label>
                                <input
                                    type="text"
                                    placeholder="Adınızı ve soyadınızı girin"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label><Mail size={18} /> E-posta</label>
                                <input
                                    type="email"
                                    placeholder="E-posta adresinizi girin"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label><CheckCircle size={18} /> Rolünüz</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="student">Öğrenci</option>
                                    <option value="working">Çalışan</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>{formData.role === 'student' ? <GraduationCap size={18} /> : <Briefcase size={18} />} 
                                    {formData.role === 'student' ? ' Üniversite' : ' Şirket'}
                                </label>
                                <input
                                    type="text"
                                    placeholder={formData.role === 'student' ? 'Üniversite adını girin' : 'Şirket adını girin'}
                                    name="organization"
                                    value={formData.organization}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </>
                    )}
                    <div className="form-group">
                        <label><User size={18} /> Kullanıcı Adı</label>
                        <input
                            type="text"
                            placeholder="Kullanıcı adınızı girin"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label><Lock size={18} /> Şifre</label>
                        <input
                            type="password"
                            placeholder="Şifrenizi girin"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    {!isLoginMode && (
                        <div className="form-group">
                            <label><Lock size={18} /> Şifre Tekrar</label>
                            <input
                                type="password"
                                placeholder="Şifrenizi tekrar girin"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}
                    <button type="submit" className="login-button">
                        {isLoginMode ? 'Giriş Yap' : 'Kayıt Ol'}
                    </button>
                </form>

                <div className="login-toggle">
                    {isLoginMode
                        ? "Hesabınız yok mu? "
                        : "Zaten bir hesabınız var mı? "}
                    <span
                        onClick={() => setIsLoginMode(!isLoginMode)}
                        className="toggle-link"
                    >
                        {isLoginMode ? 'Kayıt Ol' : 'Giriş Yap'}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;