import React, { useState, useEffect } from 'react';
import { api } from '../api';

export default function SubmissionsWorkspace({
  user,
  onOpenReviewSubmissions,
  refreshTrigger,
  showToast
}) {
  const [submissions, setSubmissions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isStudent = user && user.role === 'ROLE_STUDENT';

  useEffect(() => {
    if (isStudent) {
      loadStudentSubmissions();
    } else {
      loadInstructorCourses();
    }
  }, [refreshTrigger, user]);

  const loadStudentSubmissions = async () => {
    try {
      setLoading(true);
      const data = await api.getMySubmissions();
      setSubmissions(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadInstructorCourses = async () => {
    try {
      setLoading(true);
      const myCourses = await api.getMyCourses();
      const courseWithAssignments = await Promise.all(
        myCourses.map(async (c) => {
          const asgs = await api.getAssignmentsByCourse(c.id).catch(() => []);
          return { ...c, assignments: asgs };
        })
      );
      setCourses(courseWithAssignments);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (submissionId) => {
    try {
      const { blob, filename } = await api.downloadSubmissionFile(submissionId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      showToast(`Downloaded ${filename}`, 'success');
    } catch (err) {
      showToast(`Download failed: ${err.message}`, 'danger');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
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

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <section>
      <div className="panel-header">
        <div>
          <h1 className="panel-title">Submission &amp; Evaluation Workspace</h1>
          <p className="panel-subtitle">
            {isStudent
              ? 'Track review statuses, view instructor score evaluations, and download submitted artifacts.'
              : 'Evaluate student assignments, inspect attachments, and assign feedback.'}
          </p>
        </div>
      </div>

      {error && <div className="alert alert-danger">Error: {error}</div>}

      {loading ? (
        <div className="text-muted" style={{ padding: '24px 0' }}>Loading submissions...</div>
      ) : isStudent ? (
        submissions.length === 0 ? (
          <div className="text-muted" style={{ padding: '32px', textAlign: 'center', border: '1px dashed var(--border-strong)', borderRadius: '8px' }}>
            You have not submitted any assignments yet.
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Assignment</th>
                  <th>Submitted At</th>
                  <th>Content &amp; Attachment</th>
                  <th>Status</th>
                  <th>Score &amp; Instructor Feedback</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <strong>{s.assignmentTitle || 'Assignment'}</strong>
                      <div className="text-dim text-sm">{s.courseTitle || ''}</div>
                    </td>
                    <td className="text-dim text-sm">{formatDate(s.submittedAt)}</td>
                    <td>
                      <div className="text-muted text-sm" style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {s.textContent || '(No text content)'}
                      </div>
                      {s.hasAttachment && (
                        <button
                          className="btn btn-secondary btn-sm mt-xs"
                          onClick={() => handleDownload(s.id)}
                        >
                          📎 {s.originalFileName || 'attachment'} ({formatBytes(s.fileSize)})
                        </button>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${s.status === 'GRADED' ? 'badge-graded' : 'badge-submitted'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td>
                      {s.feedback ? (
                        <div>
                          <div className="text-mono" style={{ fontWeight: 600, color: 'var(--status-success-text)' }}>
                            {s.feedback.grade} / {s.maxScore} pts
                          </div>
                          <div className="text-muted text-sm mt-xs" style={{ background: '#f4f4f5', padding: '4px 8px', borderRadius: '4px', fontStyle: 'italic' }}>
                            "{s.feedback.comments || 'No comments'}"
                          </div>
                          <div className="text-dim" style={{ fontSize: '10px', marginTop: '2px' }}>
                            Graded by: {s.feedback.instructor ? s.feedback.instructor.fullName : 'Instructor'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-dim text-sm">Pending Review</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div>
          {courses.filter(c => c.assignments && c.assignments.length > 0).length === 0 ? (
            <div className="text-muted" style={{ padding: '32px', textAlign: 'center', border: '1px dashed var(--border-strong)', borderRadius: '8px' }}>
              No assignments available for grading. Create assignments in your courses first.
            </div>
          ) : (
            courses.map((c) => (
              <div key={c.id} className="panel">
                <div className="panel-header">
                  <div>
                    <h3 className="panel-title">{c.code} - {c.title}</h3>
                    <p className="panel-subtitle">Select an assignment to view and grade student submissions</p>
                  </div>
                </div>
                <div className="grid-cols-2">
                  {c.assignments?.map((a) => (
                    <div key={a.id} style={{ border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '12px', background: 'var(--bg-subtle)' }}>
                      <div className="flex items-center justify-between">
                        <div>
                          <strong>{a.title}</strong>
                          <div className="text-dim text-sm mt-xs">Max: {a.maxScore} pts</div>
                        </div>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => onOpenReviewSubmissions(a.id, a.title)}
                        >
                          Review Submissions
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
}
