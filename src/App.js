import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomePage from './components/home_page/HomePage';
import LoginPage from './components/user_management/LoginPage';
import JobListPage from './components/positions/JobListPage';
import ContactPage from './components/contact/ContactPage';
import EducationPage from "./components/education/EducationPage";
import CreateCoursePage from "./components/education/CreateCoursePage";
import ProfilePage from "./components/profile/ProfilePage";
import SocialPage from "./components/social/SocialPage";
import JobApplicantsPage from './components/positions/JobApplicantsPage';
import "./component-styles/global.css";
import { AuthProvider } from './contexts/AuthContext';
import AboutUsPage from './components/static_pages/AboutUsPage';
import PrivacyPolicyPage from './components/static_pages/PrivacyPolicyPage';
import TermsOfServicePage from './components/static_pages/TermsOfServicePage';

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
            path="/create-course" 
            element={
              <ProtectedRoute>
                <CreateCoursePage />
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
            path="/contact_us" 
            element={
              <ProtectedRoute>
                <ContactPage />
              </ProtectedRoute>
            } 
          />
          <Route path="/job-applicants/:jobId" element={<JobApplicantsPage />} />

          {/* New routes for static pages */}
          <Route path="/about_us" element={<AboutUsPage />} />
          <Route path="/privacy_policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms_of_service" element={<TermsOfServicePage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;