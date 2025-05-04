import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(() => {
        // Check if user data exists in localStorage
        const savedUser = localStorage.getItem('userData');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const logout = useCallback(async () => {
        try {
            // Call your logout endpoint
            await fetch('https://localhost:44388/api/account/logout', {
                method: 'GET',
                credentials: 'include'
            });
            
            // Clear localStorage
            localStorage.removeItem('userData');
            localStorage.removeItem('isAuthenticated');
            
            // Clear current user from context
            setCurrentUser(null);
            
        } catch (error) {
            console.error('Logout error:', error);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ currentUser, setCurrentUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};