import React from 'react';

export default function SecurityDocs() {
  return (
    <section>
      <div className="panel">
        <div className="panel-header">
          <div>
            <h1 className="panel-title">API Architecture &amp; Security Verification</h1>
            <p className="panel-subtitle">Complete REST endpoint specification and security testing reference for Postman &amp; OWASP ZAP.</p>
          </div>
        </div>

        <div className="grid-cols-2">
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '10px' }}>Security Controls Implemented</h3>
            <ul style={{ listStyle: 'square', paddingLeft: '20px', fontSize: '13px', lineHeight: '1.8', color: 'var(--text-muted)' }}>
              <li><strong>Password Hashing:</strong> BCrypt algorithm with secure salt rounds (passwords never stored in plaintext).</li>
              <li><strong>Authentication:</strong> Stateless JWT tokens (HMAC-SHA256) passed via <code>Authorization: Bearer &lt;token&gt;</code>.</li>
              <li><strong>Role-Based Access Control (RBAC):</strong> Strict method security enforcing Student, Instructor, and Admin privileges.</li>
              <li><strong>Broken Object Level Authorization (IDOR) Defense:</strong> Students can strictly only view/download their own submissions; Instructors can only view/grade submissions for courses they teach.</li>
              <li><strong>Stored XSS Prevention:</strong> OWASP HTML Sanitizer strips all scripts, event handlers, and malicious tags from submissions and feedback.</li>
              <li><strong>Secure File Upload Validation:</strong> Whitelist extensions (<code>.pdf, .docx, .txt, .zip, .png, .jpg, .py, .java, .md</code>), 10MB size limit, path traversal rejection, UUID isolated storage.</li>
              <li><strong>Standardized Error Handling:</strong> <code>GlobalExceptionHandler</code> intercepts all exceptions to prevent stack trace or database leakage.</li>
            </ul>
          </div>

          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '10px' }}>Default Credentials</h3>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Role</th>
                    <th>Username</th>
                    <th>Password</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span className="badge badge-admin">ADMIN</span></td>
                    <td className="text-mono">admin</td>
                    <td className="text-mono">Admin@12345</td>
                  </tr>
                  <tr>
                    <td><span className="badge badge-instructor">INSTRUCTOR</span></td>
                    <td className="text-mono">instructor_alan</td>
                    <td className="text-mono">Instructor@12345</td>
                  </tr>
                  <tr>
                    <td><span className="badge badge-instructor">INSTRUCTOR</span></td>
                    <td className="text-mono">instructor_ada</td>
                    <td className="text-mono">Instructor@12345</td>
                  </tr>
                  <tr>
                    <td><span className="badge badge-student">STUDENT</span></td>
                    <td className="text-mono">student_alice</td>
                    <td className="text-mono">Student@12345</td>
                  </tr>
                  <tr>
                    <td><span className="badge badge-student">STUDENT</span></td>
                    <td className="text-mono">student_bob</td>
                    <td className="text-mono">Student@12345</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <h3 style={{ fontSize: '15px', fontWeight: 600, margin: '24px 0 12px 0' }}>REST API Endpoint Specification</h3>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Method</th>
                <th>Endpoint</th>
                <th>Required Role</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span className="http-method method-post">POST</span></td>
                <td className="text-mono">/api/auth/register</td>
                <td>Public</td>
                <td>Register new Student or Instructor account</td>
              </tr>
              <tr>
                <td><span className="http-method method-post">POST</span></td>
                <td className="text-mono">/api/auth/login</td>
                <td>Public</td>
                <td>Authenticate user and receive JWT Bearer token</td>
              </tr>
              <tr>
                <td><span className="http-method method-get">GET</span></td>
                <td className="text-mono">/api/auth/me</td>
                <td>Authenticated</td>
                <td>Get currently authenticated user identity</td>
              </tr>
              <tr>
                <td><span className="http-method method-get">GET</span></td>
                <td className="text-mono">/api/courses</td>
                <td>Public</td>
                <td>List all courses (supports optional <code>?search=</code> query)</td>
              </tr>
              <tr>
                <td><span className="http-method method-get">GET</span></td>
                <td className="text-mono">/api/courses/{'{id}'}</td>
                <td>Public</td>
                <td>Get detailed course information</td>
              </tr>
              <tr>
                <td><span className="http-method method-post">POST</span></td>
                <td className="text-mono">/api/courses</td>
                <td>Instructor / Admin</td>
                <td>Create a new course</td>
              </tr>
              <tr>
                <td><span className="http-method method-put">PUT</span></td>
                <td className="text-mono">/api/courses/{'{id}'}</td>
                <td>Instructor / Admin</td>
                <td>Update course details (owner check enforced)</td>
              </tr>
              <tr>
                <td><span className="http-method method-delete">DELETE</span></td>
                <td className="text-mono">/api/courses/{'{id}'}</td>
                <td>Instructor / Admin</td>
                <td>Delete course (owner check enforced)</td>
              </tr>
              <tr>
                <td><span className="http-method method-post">POST</span></td>
                <td className="text-mono">/api/courses/{'{id}'}/enroll</td>
                <td>Student / Admin</td>
                <td>Enroll current student in course</td>
              </tr>
              <tr>
                <td><span className="http-method method-get">GET</span></td>
                <td className="text-mono">/api/courses/my-courses</td>
                <td>Authenticated</td>
                <td>Get enrolled courses (Student) or authored courses (Instructor)</td>
              </tr>
              <tr>
                <td><span className="http-method method-post">POST</span></td>
                <td className="text-mono">/api/assignments</td>
                <td>Instructor / Admin</td>
                <td>Create a new assignment for a course</td>
              </tr>
              <tr>
                <td><span className="http-method method-get">GET</span></td>
                <td className="text-mono">/api/assignments/{'{id}'}</td>
                <td>Authenticated</td>
                <td>Get assignment details</td>
              </tr>
              <tr>
                <td><span className="http-method method-get">GET</span></td>
                <td className="text-mono">/api/assignments/course/{'{courseId}'}</td>
                <td>Authenticated</td>
                <td>List all assignments for a specific course</td>
              </tr>
              <tr>
                <td><span className="http-method method-post">POST</span></td>
                <td className="text-mono">/api/submissions</td>
                <td>Student / Admin</td>
                <td>Submit assignment (Multipart: <code>assignmentId</code>, <code>textContent</code>, <code>file</code>)</td>
              </tr>
              <tr>
                <td><span className="http-method method-get">GET</span></td>
                <td className="text-mono">/api/submissions/{'{id}'}</td>
                <td>Student / Instructor / Admin</td>
                <td>Get submission (Strict IDOR authorization check)</td>
              </tr>
              <tr>
                <td><span className="http-method method-get">GET</span></td>
                <td className="text-mono">/api/submissions/assignment/{'{assignmentId}'}</td>
                <td>Instructor / Admin</td>
                <td>List submissions for course assignment</td>
              </tr>
              <tr>
                <td><span className="http-method method-get">GET</span></td>
                <td className="text-mono">/api/submissions/my-submissions</td>
                <td>Student / Admin</td>
                <td>List all submissions made by current student</td>
              </tr>
              <tr>
                <td><span className="http-method method-put">PUT</span></td>
                <td className="text-mono">/api/submissions/{'{id}'}/feedback</td>
                <td>Instructor / Admin</td>
                <td>Grade submission and provide sanitized instructor feedback</td>
              </tr>
              <tr>
                <td><span className="http-method method-get">GET</span></td>
                <td className="text-mono">/api/submissions/{'{id}'}/download</td>
                <td>Student / Instructor / Admin</td>
                <td>Download submitted file attachment with IDOR check</td>
              </tr>
              <tr>
                <td><span className="http-method method-get">GET</span></td>
                <td className="text-mono">/api/users</td>
                <td>Admin</td>
                <td>List all registered platform users</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
