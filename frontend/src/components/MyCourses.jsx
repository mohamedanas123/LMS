import React, { useState, useEffect } from 'react';
import { api } from '../api';

export default function MyCourses({
  user,
  onViewCourse,
  onOpenCreateAssignment,
  onOpenCreateCourse,
  refreshTrigger
}) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isStudent = user && user.role === 'ROLE_STUDENT';

  useEffect(() => {
    loadMyCourses();
  }, [refreshTrigger, user]);

  const loadMyCourses = async () => {
    try {
      setLoading(true);
      const data = await api.getMyCourses();
      setCourses(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <div className="panel-header">
        <div>
          <h1 className="panel-title">{isStudent ? 'My Enrolled Courses' : 'My Teaching Dashboard'}</h1>
          <p className="panel-subtitle">
            {isStudent
              ? 'Access assignments and course materials for your active classes.'
              : 'Manage course syllabi, add lab assignments, and inspect enrollments.'}
          </p>
        </div>
        {!isStudent && (
          <button className="btn btn-primary btn-sm" onClick={onOpenCreateCourse}>
            + Create New Course
          </button>
        )}
      </div>

      {error && <div className="alert alert-danger">Failed to load courses: {error}</div>}

      {loading ? (
        <div className="text-muted" style={{ padding: '24px 0' }}>Loading your courses...</div>
      ) : courses.length === 0 ? (
        <div className="text-muted" style={{ padding: '32px', textAlign: 'center', border: '1px dashed var(--border-strong)', borderRadius: '8px' }}>
          {isStudent
            ? 'You are not enrolled in any courses yet. Switch to the Course Catalog to browse and enroll!'
            : 'You have not created any courses yet. Click "+ Create New Course" above.'}
        </div>
      ) : (
        <div className="grid-cols-3">
          {courses.map((course) => (
            <div key={course.id} className="course-card">
              <div>
                <div className="course-card-top">
                  <span className="badge badge-code">{course.code}</span>
                  <span className="badge badge-graded">{isStudent ? 'Enrolled' : 'Instructor'}</span>
                </div>
                <h3 className="course-title">{course.title}</h3>
                <p className="course-desc mt-sm">{course.description || ''}</p>
              </div>

              <div>
                <div className="course-meta">
                  <span>{course.assignmentsCount} assignments</span>
                  <span>{course.enrolledStudentsCount} students</span>
                </div>

                <div className="flex items-center justify-between mt-md gap-sm">
                  <button className="btn btn-secondary btn-sm" onClick={() => onViewCourse(course.id)}>
                    View Course
                  </button>
                  {!isStudent && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => onOpenCreateAssignment(course.id, course.title)}
                    >
                      + Add Assignment
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
