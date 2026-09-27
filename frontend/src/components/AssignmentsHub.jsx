import React, { useState, useEffect } from 'react';
import { api } from '../api';

export default function AssignmentsHub({
  user,
  onOpenSubmit,
  onOpenReviewSubmissions,
  onOpenLogin,
  refreshTrigger
}) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAllAssignments();
  }, [refreshTrigger, user]);

  const loadAllAssignments = async () => {
    try {
      setLoading(true);
      const courses = await api.getCourses();
      let list = [];

      for (const c of courses) {
        try {
          const asgs = await api.getAssignmentsByCourse(c.id);
          list = list.concat(asgs);
        } catch (ignored) {}
      }

      setAssignments(list);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'No deadline';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <section>
      <div className="panel-header">
        <div>
          <h1 className="panel-title">Assignments &amp; Deadlines</h1>
          <p className="panel-subtitle">View open assignments across courses, track scoring criteria, and submit your work.</p>
        </div>
      </div>

      {error && <div className="alert alert-danger">Failed to load assignments: {error}</div>}

      {loading ? (
        <div className="text-muted" style={{ padding: '24px 0' }}>Loading assignments...</div>
      ) : assignments.length === 0 ? (
        <div className="text-muted" style={{ padding: '32px', textAlign: 'center', border: '1px dashed var(--border-strong)', borderRadius: '8px' }}>
          No assignments currently posted.
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Assignment Title &amp; Instructions</th>
                <th>Max Score</th>
                <th>Due Date</th>
                <th>Status / Action</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => (
                <tr key={a.id}>
                  <td>
                    <span className="badge badge-code">{a.courseCode || 'CODE'}</span>
                  </td>
                  <td>
                    <strong>{a.title}</strong>
                    <div className="text-muted text-sm mt-xs">{a.description || ''}</div>
                  </td>
                  <td className="text-mono">
                    <strong>{a.maxScore}</strong> pts
                  </td>
                  <td className="text-dim text-sm">{formatDate(a.dueDate)}</td>
                  <td>
                    {!user ? (
                      <button className="btn btn-secondary btn-sm" onClick={onOpenLogin}>
                        Login to Submit
                      </button>
                    ) : user.role === 'ROLE_STUDENT' ? (
                      a.hasSubmitted ? (
                        <div className="flex items-center gap-sm">
                          <span className={`badge ${a.mySubmission?.status === 'GRADED' ? 'badge-graded' : 'badge-submitted'}`}>
                            {a.mySubmission?.status}
                          </span>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => onOpenSubmit(a.id, a.title)}
                          >
                            Resubmit
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => onOpenSubmit(a.id, a.title)}
                        >
                          Submit Work
                        </button>
                      )
                    ) : (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => onOpenReviewSubmissions(a.id, a.title)}
                      >
                        Review Submissions ({a.submissionCount || 0})
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
