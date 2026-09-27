import React from 'react';

export default function Navbar({
  user,
  currentTab,
  onTabChange,
  onOpenLogin,
  onOpenRegister,
  onOpenCreateCourse,
  onLogout
}) {
  const isInstructorOrAdmin = user && (user.role === 'ROLE_INSTRUCTOR' || user.role === 'ROLE_ADMIN');
  const isAdmin = user && user.role === 'ROLE_ADMIN';
  const roleClean = user ? user.role.replace('ROLE_', '').toLowerCase() : '';

  return (
    <header className="top-navbar">
      <div className="nav-container">
        <div className="flex items-center gap-md">
          <button className="brand" onClick={() => onTabChange('courses')}>
            <span>LMS CORE</span>
            <span className="brand-badge">SECURE</span>
          </button>

          <nav>
            <ul className="nav-links">
              <li>
                <button
                  className={`nav-link ${currentTab === 'courses' ? 'active' : ''}`}
                  onClick={() => onTabChange('courses')}
                >
                  Course Catalog
                </button>
              </li>

              {user && (
                <li>
                  <button
                    className={`nav-link ${currentTab === 'my-courses' ? 'active' : ''}`}
                    onClick={() => onTabChange('my-courses')}
                  >
                    {isInstructorOrAdmin ? 'My Teaching' : 'My Courses'}
                  </button>
                </li>
              )}

              <li>
                <button
                  className={`nav-link ${currentTab === 'assignments' ? 'active' : ''}`}
                  onClick={() => onTabChange('assignments')}
                >
                  Assignments Hub
                </button>
              </li>

              {user && (
                <li>
                  <button
                    className={`nav-link ${currentTab === 'submissions' ? 'active' : ''}`}
                    onClick={() => onTabChange('submissions')}
                  >
                    {isInstructorOrAdmin ? 'Review & Grade' : 'My Submissions'}
                  </button>
                </li>
              )}

              {isAdmin && (
                <li>
                  <button
                    className={`nav-link ${currentTab === 'users' ? 'active' : ''}`}
                    onClick={() => onTabChange('users')}
                  >
                    User Directory
                  </button>
                </li>
              )}
            </ul>
          </nav>
        </div>

        <div className="nav-actions">
          {!user ? (
            <div className="flex items-center gap-sm">
              <button className="btn btn-secondary btn-sm" onClick={onOpenLogin}>
                Log In
              </button>
              <button className="btn btn-primary btn-sm" onClick={onOpenRegister}>
                Register
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-sm">
              {isInstructorOrAdmin && (
                <button className="btn btn-secondary btn-sm" onClick={onOpenCreateCourse}>
                  + New Course
                </button>
              )}
              <span className={`badge badge-${roleClean}`}>
                {user.role.replace('ROLE_', '')}
              </span>
              <span style={{ fontWeight: 500, fontSize: '13px' }}>
                {user.fullName}
              </span>
              <button className="btn btn-secondary btn-sm" onClick={onLogout}>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
