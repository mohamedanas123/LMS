import React, { useState, useEffect } from 'react';
import { api } from '../api';

export function LoginModal({ isOpen, onClose, onLoginSuccess, showToast }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = await api.login(username.trim(), password);
      api.setAuth(data.token, data.user);
      onLoginSuccess(data.user);
      showToast(`Welcome back, ${data.user.fullName}!`, 'success');
      onClose();
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header">
          <h3 className="modal-title">Sign In to LMS</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. student_alice"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function RegisterModal({ isOpen, onClose, onRegisterSuccess, showToast }) {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('ROLE_STUDENT');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = await api.register(username.trim(), email.trim(), password, fullName.trim(), role);
      api.setAuth(data.token, data.user);
      onRegisterSuccess(data.user);
      showToast(`Account created successfully as ${role.replace('ROLE_', '')}!`, 'success');
      onClose();
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header">
          <h3 className="modal-title">Create LMS Account</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Alice Smith"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. alice_smith"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <div className="form-hint">Alphanumeric, underscores and dots only (3-50 chars).</div>
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="alice@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Account Role</label>
              <select
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="ROLE_STUDENT">Student (Browse, Enroll, Submit Work)</option>
                <option value="ROLE_INSTRUCTOR">Instructor (Create Courses &amp; Grade Work)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CourseModal({ isOpen, course, onClose, onSuccess, showToast }) {
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (course) {
      setCode(course.code || '');
      setTitle(course.title || '');
      setDescription(course.description || '');
    } else {
      setCode('');
      setTitle('');
      setDescription('');
    }
  }, [course, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = { code: code.trim(), title: title.trim(), description: description.trim() };
      if (course && course.id) {
        await api.updateCourse(course.id, payload);
        showToast('Course updated successfully', 'success');
      } else {
        await api.createCourse(payload);
        showToast('Course created successfully', 'success');
      }
      onSuccess();
      onClose();
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header">
          <h3 className="modal-title">{course ? 'Edit Course' : 'Create New Course'}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Course Code</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. CS-404"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Course Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Advanced Cryptographic Engineering"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Syllabus / Description</label>
              <textarea
                className="form-textarea"
                placeholder="Detailed syllabus outline..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AssignmentModal({ isOpen, courseId, courseTitle, onClose, onSuccess, showToast }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [maxScore, setMaxScore] = useState(100);
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        courseId,
        title: title.trim(),
        description: description.trim(),
        maxScore: parseInt(maxScore),
        dueDate: dueDate ? dueDate + ':00' : null
      };
      await api.createAssignment(payload);
      showToast('Assignment created successfully!', 'success');
      onSuccess();
      onClose();
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Post New Assignment</h3>
            <div className="text-dim" style={{ fontSize: '12px', marginTop: '2px' }}>Course: {courseTitle}</div>
          </div>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Assignment Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Lab 3: Buffer Overflow Defense"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Instructions &amp; Requirements</label>
              <textarea
                className="form-textarea"
                placeholder="Detailed assignment instructions..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="grid-cols-2">
              <div className="form-group">
                <label className="form-label">Maximum Score (Points)</label>
                <input
                  type="number"
                  className="form-input"
                  min="1"
                  value={maxScore}
                  onChange={(e) => setMaxScore(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Due Date (Optional)</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Publishing...' : 'Publish Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function SubmitModal({ isOpen, assignmentId, assignmentTitle, onClose, onSuccess, showToast }) {
  const [textContent, setTextContent] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!textContent.trim() && !file) {
      showToast('Please provide text response or select a file to upload.', 'danger');
      return;
    }

    try {
      setLoading(true);
      await api.submitAssignment(assignmentId, textContent.trim(), file);
      showToast('Assignment submitted successfully!', 'success');
      onSuccess();
      onClose();
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setLoading(false);
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
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header">
          <h3 className="modal-title">Submit Work: {assignmentTitle}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Written Response / Code Explanation</label>
              <textarea
                className="form-textarea"
                placeholder="Enter your text response or submission notes here..."
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Attach File</label>
              <div
                className="file-upload-zone"
                onClick={() => document.getElementById('reactFileInput').click()}
              >
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>📂</div>
                <div style={{ fontWeight: 500 }}>Click to browse attachment</div>
                <div className="form-hint">Permitted: .pdf, .docx, .txt, .zip, .png, .jpg, .py, .java, .md (Max 10MB)</div>
                <div className="text-mono text-sm mt-sm" style={{ color: 'var(--accent-blue)' }}>
                  {file ? `Selected: ${file.name} (${formatBytes(file.size)})` : 'No file selected (Optional)'}
                </div>
              </div>
              <input
                type="file"
                id="reactFileInput"
                className="hidden"
                onChange={(e) => setFile(e.target.files[0] || null)}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Uploading & Submitting...' : 'Submit Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ReviewModal({ isOpen, assignmentId, assignmentTitle, onClose, onOpenGrade, showToast }) {
  const [submissions, setSubmissions] = useState([]);
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && assignmentId) {
      loadData();
    }
  }, [isOpen, assignmentId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subs, asg] = await Promise.all([
        api.getSubmissionsForAssignment(assignmentId),
        api.getAssignment(assignmentId)
      ]);
      setSubmissions(subs);
      setAssignment(asg);
    } catch (err) {
      showToast(err.message, 'danger');
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

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-container" style={{ maxWidth: '820px' }}>
        <div className="modal-header">
          <h3 className="modal-title">Submissions: {assignmentTitle}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          {loading ? (
            <div className="text-muted" style={{ padding: '24px 0' }}>Loading submissions...</div>
          ) : submissions.length === 0 ? (
            <div className="text-muted" style={{ padding: '24px', textAlign: 'center' }}>
              No students have submitted this assignment yet.
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Submission Details</th>
                    <th>Attachment</th>
                    <th>Status / Grade</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <strong>{s.student ? s.student.fullName : 'Student'}</strong>
                        <div className="text-dim text-sm">{s.student ? s.student.email : ''}</div>
                      </td>
                      <td>
                        <div className="text-muted text-sm" style={{ maxHeight: '80px', overflowY: 'auto', fontFamily: 'var(--font-mono)', fontSize: '12px', background: '#f4f4f5', padding: '6px', borderRadius: '4px' }}>
                          {s.textContent || '(No text submitted)'}
                        </div>
                        <div className="text-dim text-sm mt-xs">Submitted: {formatDate(s.submittedAt)}</div>
                      </td>
                      <td>
                        {s.hasAttachment ? (
                          <button className="btn btn-secondary btn-sm" onClick={() => handleDownload(s.id)}>
                            💾 Download {s.originalFileName || 'file'}
                          </button>
                        ) : (
                          <span className="text-dim text-sm">No file</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${s.status === 'GRADED' ? 'badge-graded' : 'badge-submitted'}`}>
                          {s.status}
                        </span>
                        {s.feedback && (
                          <div className="text-mono mt-xs" style={{ fontWeight: 600 }}>
                            Score: {s.feedback.grade} / {assignment?.maxScore}
                          </div>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => onOpenGrade(s, assignment?.maxScore || 100)}
                        >
                          {s.feedback ? 'Update Grade' : 'Grade'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export function GradeModal({ isOpen, submission, maxScore, onClose, onSuccess, showToast }) {
  const [grade, setGrade] = useState('');
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (submission && submission.feedback) {
      setGrade(submission.feedback.grade || '');
      setComments(submission.feedback.comments || '');
    } else {
      setGrade('');
      setComments('');
    }
  }, [submission, isOpen]);

  if (!isOpen || !submission) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.gradeSubmission(submission.id, parseFloat(grade), comments.trim());
      showToast('Grade and feedback saved successfully!', 'success');
      onSuccess();
      onClose();
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header">
          <h3 className="modal-title">Grade Submission</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Score / Points</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max={maxScore}
                className="form-input"
                placeholder="e.g. 95"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                required
              />
              <div className="form-hint">Maximum permissible score: {maxScore} points</div>
            </div>
            <div className="form-group">
              <label className="form-label">Evaluation Feedback &amp; Comments</label>
              <textarea
                className="form-textarea"
                placeholder="Detailed feedback for the student..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Grade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CourseDetailsModal({ isOpen, courseId, user, onClose, onOpenSubmit, showToast }) {
  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && courseId) {
      loadDetails();
    }
  }, [isOpen, courseId]);

  const loadDetails = async () => {
    try {
      setLoading(true);
      const [c, asgs] = await Promise.all([
        api.getCourse(courseId),
        api.getAssignmentsByCourse(courseId)
      ]);
      setCourse(c);
      setAssignments(asgs);
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setLoading(false);
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

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-container" style={{ maxWidth: '680px' }}>
        <div className="modal-header">
          <div>
            <span className="badge badge-code">{course?.code || 'CODE'}</span>
            <h3 className="modal-title mt-xs">{course?.title || 'Course Details'}</h3>
          </div>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          {loading ? (
            <div className="text-muted" style={{ padding: '24px 0' }}>Loading course details...</div>
          ) : (
            <div>
              <p className="text-muted" style={{ lineHeight: 1.6, marginBottom: '16px' }}>
                {course?.description || 'No description available.'}
              </p>
              <div className="flex items-center justify-between text-dim text-sm" style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '16px' }}>
                <span>Instructor: <strong style={{ color: 'var(--text-main)' }}>{course?.instructor ? course.instructor.fullName : 'Faculty'}</strong></span>
                <span>{course?.enrolledStudentsCount} students enrolled</span>
              </div>

              <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Coursework &amp; Assignments</h4>
              {assignments.length === 0 ? (
                <div className="text-muted text-sm">No assignments posted for this course yet.</div>
              ) : (
                assignments.map((a) => (
                  <div key={a.id} className="panel" style={{ padding: '14px', marginBottom: '10px', background: 'var(--bg-subtle)' }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <strong>{a.title}</strong>
                        <div className="text-muted text-sm mt-xs">{a.description || ''}</div>
                        <div className="text-dim" style={{ fontSize: '11px', marginTop: '4px' }}>
                          Max Score: {a.maxScore} pts {a.dueDate ? ' | Due: ' + formatDate(a.dueDate) : ''}
                        </div>
                      </div>
                      {user && user.role === 'ROLE_STUDENT' && (
                        <div>
                          {a.hasSubmitted ? (
                            <span className="badge badge-graded">Submitted</span>
                          ) : (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => {
                                onClose();
                                onOpenSubmit(a.id, a.title);
                              }}
                            >
                              Submit
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
