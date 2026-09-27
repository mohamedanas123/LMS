import React from 'react';

export default function RoleSwitcher({ onQuickLogin }) {
  return (
    <div className="demo-account-bar">
      <div className="demo-bar-inner">
        <div className="flex items-center gap-sm">
          <strong style={{ color: 'var(--text-main)' }}>Quick Role Switcher:</strong>
          <span>Click any demo account to test role permissions instantly</span>
        </div>
        <div className="demo-pills">
          <button className="demo-pill-btn" onClick={() => onQuickLogin('student_alice', 'Student@12345')}>
            <span className="badge badge-student" style={{ fontSize: '9px', padding: '1px 4px' }}>Student</span> Alice Smith
          </button>
          <button className="demo-pill-btn" onClick={() => onQuickLogin('student_bob', 'Student@12345')}>
            <span className="badge badge-student" style={{ fontSize: '9px', padding: '1px 4px' }}>Student</span> Bob Jones
          </button>
          <button className="demo-pill-btn" onClick={() => onQuickLogin('instructor_alan', 'Instructor@12345')}>
            <span className="badge badge-instructor" style={{ fontSize: '9px', padding: '1px 4px' }}>Instructor</span> Prof. Alan Turing
          </button>
          <button className="demo-pill-btn" onClick={() => onQuickLogin('instructor_ada', 'Instructor@12345')}>
            <span className="badge badge-instructor" style={{ fontSize: '9px', padding: '1px 4px' }}>Instructor</span> Dr. Ada Lovelace
          </button>
          <button className="demo-pill-btn" onClick={() => onQuickLogin('admin', 'Admin@12345')}>
            <span className="badge badge-admin" style={{ fontSize: '9px', padding: '1px 4px' }}>Admin</span> Administrator
          </button>
        </div>
      </div>
    </div>
  );
}
