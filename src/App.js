import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomePage from './components/home_page/HomePage';
import LoginPage from './components/user_management/LoginPage';
import JobListPage from './components/positions/JobListPage';
import ContactPage from './components/contact/ContactPage';
import EducationPage from "./components/education/EducationPage";
import ProfilePage from "./components/profile/ProfilePage";
import SocialPage from "./components/social/SocialPage";
import NotificationsPage from "./components/notifications/NotificationsPage";
import "./component-styles/global.css";
import { AuthProvider } from './contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  return isAuthenticated ? children : <Navigate to="/homepage" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/homepage" 
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/joblistpage" 
            element={
              <ProtectedRoute>
                <JobListPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/socialpage" 
            element={
              <ProtectedRoute>
                <SocialPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/educationpage" 
            element={
              <ProtectedRoute>
                <EducationPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profilepage" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profilepage/:userId" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/notificationspage" 
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/contact_us" 
            element={
              <ProtectedRoute>
                <ContactPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;