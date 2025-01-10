import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import JobListPage from './components/JobListPage';
import ContactPage from './components/ContactPage';
import EducationPage from "./components/EducationPage";
import ProfilePage from "./components/ProfilePage";
import SocialPage from "./components/SocialPage";
import "./component-styles/global.css";
import NotificationsPage from "./components/NotificationsPage";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
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
          path="/notificationspage" 
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          } 
        />
        {/* <Route 
          path="/about_us" 
          element={
            <ProtectedRoute>
              <AboutUsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/privacy_policy" 
          element={
            <ProtectedRoute>
              <PrivacyPolicyPage />
            </ProtectedRoute>
        } 
        />
        <Route 
          path="/terms_of_use" 
          element={
            <ProtectedRoute>
              <TermsOfUsePage />
            </ProtectedRoute>
        } 
        /> */}
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
  );
}

export default App;