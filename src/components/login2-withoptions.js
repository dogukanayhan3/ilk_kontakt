import React, { useState } from 'react';
import "../component-styles/LoginPage.css";

function LoginPage({ onLoginSuccess }) {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        // Prevent the default form submission
        e.preventDefault();

        // Add console logs for debugging
        console.log('Submit triggered');
        console.log('Username:', username);
        console.log('Password:', password);

        // Developer backdoor login
        if (username === 'admin' && password === '1234') {
            console.log('Login successful');
            // Successful login
            localStorage.setItem('isAuthenticated', 'true');
            if (onLoginSuccess) {
                onLoginSuccess();
            }
            return;
        }

        // For now, show an error message
        console.log('Login failed');
        setError('Kullanıcı adı veya şifre yanlış');
    };

    return (
        <div className="login-wrapper">
            <div className="login-card">
                <h2>{isLoginMode ? 'Giriş Yap' : 'Kayıt Ol'}</h2>
                
                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="login-form">
                    {!isLoginMode && (
                        <div className="form-group">
                            <label>Ad Soyad</label>
                            <input
                                type="text"
                                placeholder="Adınızı ve soyadınızı girin"
                                required
                            />
                        </div>
                    )}
                    
                    <div className="form-group">
                        <label>Kullanıcı Adı</label>
                        <input
                            type="text"
                            placeholder="Kullanıcı adınızı girin"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Şifre</label>
                        <input
                            type="password"
                            placeholder="Şifrenizi girin"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    
                    {!isLoginMode && (
                        <div className="form-group">
                            <label>Şifre Tekrar</label>
                            <input
                                type="password"
                                placeholder="Şifrenizi tekrar girin"
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