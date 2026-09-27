import React, { useState, useEffect } from 'react';
import { api } from './api';
import Navbar from './components/Navbar';
import CourseCatalog from './components/CourseCatalog';
import MyCourses from './components/MyCourses';
import AssignmentsHub from './components/AssignmentsHub';
import SubmissionsWorkspace from './components/SubmissionsWorkspace';
import UserDirectory from './components/UserDirectory';
import {
  LoginModal,
  RegisterModal,
  CourseModal,
  AssignmentModal,
  SubmitModal,
  GradeModal,
  ReviewModal,
  CourseDetailsModal
} from './components/Modals';

export default function App() {
  const [user, setUser] = useState(api.getUser());
  const [currentTab, setCurrentTab] = useState('courses');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [toasts, setToasts] = useState([]);

  // Modals state
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [assignmentModalData, setAssignmentModalData] = useState({ isOpen: false, courseId: null, courseTitle: '' });
  const [submitModalData, setSubmitModalData] = useState({ isOpen: false, assignmentId: null, assignmentTitle: '' });
  const [reviewModalData, setReviewModalData] = useState({ isOpen: false, assignmentId: null, assignmentTitle: '' });
  const [gradeModalData, setGradeModalData] = useState({ isOpen: false, submission: null, maxScore: 100 });
  const [courseDetailsModalData, setCourseDetailsModalData] = useState({ isOpen: false, courseId: null });

  useEffect(() => {
    const handleAuthExpired = () => {
      setUser(null);
      showToast('Session expired. Please sign in again.', 'danger');
    };
    window.addEventListener('auth-expired', handleAuthExpired);
    return () => window.removeEventListener('auth-expired', handleAuthExpired);
  }, []);

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const handleLogout = () => {
    api.clearAuth();
    setUser(null);
    showToast('Signed out successfully.', 'info');
    setCurrentTab('courses');
    triggerRefresh();
  };

  const handleEnroll = async (courseId) => {
    try {
      await api.enrollCourse(courseId);
      showToast('Successfully enrolled in course!', 'success');
      triggerRefresh();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  return (
    <div className="app-wrapper">
      <Navbar
        user={user}
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenRegister={() => setIsRegisterOpen(true)}
        onOpenCreateCourse={() => {
          setEditingCourse(null);
          setIsCourseModalOpen(true);
        }}
        onLogout={handleLogout}
      />

      <main className="main-content">
        {currentTab === 'courses' && (
          <CourseCatalog
            user={user}
            onViewCourse={(id) => setCourseDetailsModalData({ isOpen: true, courseId: id })}
            onEnroll={handleEnroll}
            onOpenCreateAssignment={(id, title) => setAssignmentModalData({ isOpen: true, courseId: id, courseTitle: title })}
            onOpenEditCourse={(course) => {
              setEditingCourse(course);
              setIsCourseModalOpen(true);
            }}
            onOpenLogin={() => setIsLoginOpen(true)}
            refreshTrigger={refreshTrigger}
          />
        )}

        {currentTab === 'my-courses' && (
          <MyCourses
            user={user}
            onViewCourse={(id) => setCourseDetailsModalData({ isOpen: true, courseId: id })}
            onOpenCreateAssignment={(id, title) => setAssignmentModalData({ isOpen: true, courseId: id, courseTitle: title })}
            onOpenCreateCourse={() => {
              setEditingCourse(null);
              setIsCourseModalOpen(true);
            }}
            refreshTrigger={refreshTrigger}
          />
        )}

        {currentTab === 'assignments' && (
          <AssignmentsHub
            user={user}
            onOpenSubmit={(id, title) => setSubmitModalData({ isOpen: true, assignmentId: id, assignmentTitle: title })}
            onOpenReviewSubmissions={(id, title) => setReviewModalData({ isOpen: true, assignmentId: id, assignmentTitle: title })}
            onOpenLogin={() => setIsLoginOpen(true)}
            refreshTrigger={refreshTrigger}
          />
        )}

        {currentTab === 'submissions' && (
          <SubmissionsWorkspace
            user={user}
            onOpenReviewSubmissions={(id, title) => setReviewModalData({ isOpen: true, assignmentId: id, assignmentTitle: title })}
            refreshTrigger={refreshTrigger}
            showToast={showToast}
          />
        )}

        {currentTab === 'users' && <UserDirectory />}
      </main>

      {/* MODALS */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={(userData) => {
          setUser(userData);
          triggerRefresh();
        }}
        showToast={showToast}
      />

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onRegisterSuccess={(userData) => {
          setUser(userData);
          triggerRefresh();
        }}
        showToast={showToast}
      />

      <CourseModal
        isOpen={isCourseModalOpen}
        course={editingCourse}
        onClose={() => setIsCourseModalOpen(false)}
        onSuccess={triggerRefresh}
        showToast={showToast}
      />

      <AssignmentModal
        isOpen={assignmentModalData.isOpen}
        courseId={assignmentModalData.courseId}
        courseTitle={assignmentModalData.courseTitle}
        onClose={() => setAssignmentModalData({ isOpen: false, courseId: null, courseTitle: '' })}
        onSuccess={triggerRefresh}
        showToast={showToast}
      />

      <SubmitModal
        isOpen={submitModalData.isOpen}
        assignmentId={submitModalData.assignmentId}
        assignmentTitle={submitModalData.assignmentTitle}
        onClose={() => setSubmitModalData({ isOpen: false, assignmentId: null, assignmentTitle: '' })}
        onSuccess={triggerRefresh}
        showToast={showToast}
      />

      <ReviewModal
        isOpen={reviewModalData.isOpen}
        assignmentId={reviewModalData.assignmentId}
        assignmentTitle={reviewModalData.assignmentTitle}
        onClose={() => setReviewModalData({ isOpen: false, assignmentId: null, assignmentTitle: '' })}
        onOpenGrade={(submission, maxScore) => {
          setGradeModalData({ isOpen: true, submission, maxScore });
        }}
        showToast={showToast}
      />

      <GradeModal
        isOpen={gradeModalData.isOpen}
        submission={gradeModalData.submission}
        maxScore={gradeModalData.maxScore}
        onClose={() => setGradeModalData({ isOpen: false, submission: null, maxScore: 100 })}
        onSuccess={triggerRefresh}
        showToast={showToast}
      />

      <CourseDetailsModal
        isOpen={courseDetailsModalData.isOpen}
        courseId={courseDetailsModalData.courseId}
        user={user}
        onClose={() => setCourseDetailsModalData({ isOpen: false, courseId: null })}
        onOpenSubmit={(id, title) => setSubmitModalData({ isOpen: true, assignmentId: id, assignmentTitle: title })}
        showToast={showToast}
      />

      {/* TOAST CONTAINER */}
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 200, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`alert alert-${toast.type}`}
            style={{ minWidth: '280px', maxWidth: '400px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
