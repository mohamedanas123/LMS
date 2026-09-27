import React, { useState, useEffect } from 'react';
import { api } from '../api';

export default function CourseCatalog({
  user,
  onViewCourse,
  onEnroll,
  onOpenCreateAssignment,
  onOpenEditCourse,
  onOpenLogin,
  refreshTrigger
}) {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCourses();
  }, [search, refreshTrigger, user]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await api.getCourses(search);
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
          <h1 className="panel-title">Available Courses</h1>
          <p className="panel-subtitle">Explore curriculum offerings, enroll in specialized modules, and access coursework.</p>
        </div>
        <div>
          <input
            type="text"
            className="form-input"
            placeholder="Search by title or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '240px', padding: '6px 10px', fontSize: '12px' }}
          />
        </div>
      </div>

      {error && <div className="alert alert-danger">Failed to load courses: {error}</div>}

      {loading ? (
        <div className="text-muted" style={{ padding: '24px 0' }}>Loading course catalog...</div>
      ) : courses.length === 0 ? (
        <div className="text-muted" style={{ padding: '32px', textAlign: 'center', border: '1px dashed var(--border-strong)', borderRadius: '8px' }}>
          No courses found matching your query.
        </div>
      ) : (
        <div className="grid-cols-3">
          {courses.map((course) => {
            const isOwner = user && course.instructor && course.instructor.id === user.id;
            const isInstructorOrAdmin = user && (isOwner || user.role === 'ROLE_ADMIN');

            return (
              <div key={course.id} className="course-card">
                <div>
                  <div className="course-card-top">
                    <span className="badge badge-code">{course.code}</span>
                    <span className="text-dim" style={{ fontSize: '11px' }}>
                      {course.enrolledStudentsCount} enrolled
                    </span>
                  </div>
                  <h3 className="course-title">{course.title}</h3>
                  <p className="course-desc mt-sm">{course.description || 'No description provided.'}</p>
                </div>

                <div>
                  <div className="course-meta">
                    <span>Instructor: <strong>{course.instructor ? course.instructor.fullName : 'Faculty'}</strong></span>
                    <span>{course.assignmentsCount} assignments</span>
                  </div>

                  <div className="flex items-center justify-between mt-md gap-sm">
                    <button className="btn btn-secondary btn-sm" onClick={() => onViewCourse(course.id)}>
                      View Course
                    </button>

                    {!user ? (
                      <button className="btn btn-primary btn-sm" onClick={onOpenLogin}>
                        Login to Enroll
                      </button>
                    ) : user.role === 'ROLE_STUDENT' ? (
                      course.enrolledByCurrentUser ? (
                        <span className="badge badge-graded">Enrolled</span>
                      ) : (
                        <button className="btn btn-primary btn-sm" onClick={() => onEnroll(course.id)}>
                          Enroll
                        </button>
                      )
                    ) : isInstructorOrAdmin ? (
                      <div className="flex gap-sm">
                        <button className="btn btn-secondary btn-sm" onClick={() => onOpenCreateAssignment(course.id, course.title)}>
                          + Assignment
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => onOpenEditCourse(course)}>
                          Edit
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
