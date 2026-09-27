const API_BASE = '/api';

export const api = {
  getToken() {
    return localStorage.getItem('lms_token');
  },

  getUser() {
    const userStr = localStorage.getItem('lms_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  setAuth(token, user) {
    localStorage.setItem('lms_token', token);
    localStorage.setItem('lms_user', JSON.stringify(user));
  },

  clearAuth() {
    localStorage.removeItem('lms_token');
    localStorage.removeItem('lms_user');
  },

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      ...(options.headers || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData) && !headers['Content-Type'] && options.body) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    if (response.status === 401) {
      if (token) {
        this.clearAuth();
        window.dispatchEvent(new Event('auth-expired'));
      }
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || 'Authentication required or session expired.');
    }

    if (options.isDownload) {
      if (!response.ok) {
        const err = await response.json().catch(() => ({ message: 'Download failed' }));
        throw new Error(err.message || 'Download failed');
      }
      const blob = await response.blob();
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'submission-file';
      if (contentDisposition && contentDisposition.includes('filename=')) {
        filename = contentDisposition.split('filename=')[1].replace(/"/g, '').trim();
      }
      return { blob, filename };
    }

    const data = await response.json();

    if (!response.ok || !data.success) {
      let errMsg = data.message || `Request failed (${response.status})`;
      if (data.validationErrors && data.validationErrors.length > 0) {
        errMsg += ':\n• ' + data.validationErrors.join('\n• ');
      }
      throw new Error(errMsg);
    }

    return data.data;
  },

  // Auth
  login(username, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  },

  register(username, email, password, fullName, role) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, fullName, role })
    });
  },

  // Courses
  getCourses(search = '') {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.request(`/courses${query}`);
  },

  getCourse(id) {
    return this.request(`/courses/${id}`);
  },

  createCourse(courseData) {
    return this.request('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData)
    });
  },

  updateCourse(id, courseData) {
    return this.request(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(courseData)
    });
  },

  enrollCourse(id) {
    return this.request(`/courses/${id}/enroll`, {
      method: 'POST'
    });
  },

  getMyCourses() {
    return this.request('/courses/my-courses');
  },

  // Assignments
  getAssignmentsByCourse(courseId) {
    return this.request(`/assignments/course/${courseId}`);
  },

  createAssignment(assignmentData) {
    return this.request('/assignments', {
      method: 'POST',
      body: JSON.stringify(assignmentData)
    });
  },

  getAssignment(id) {
    return this.request(`/assignments/${id}`);
  },

  // Submissions
  submitAssignment(assignmentId, textContent, file) {
    const formData = new FormData();
    formData.append('assignmentId', assignmentId);
    if (textContent) formData.append('textContent', textContent);
    if (file) formData.append('file', file);

    return this.request('/submissions', {
      method: 'POST',
      body: formData
    });
  },

  getMySubmissions() {
    return this.request('/submissions/my-submissions');
  },

  getSubmissionsForAssignment(assignmentId) {
    return this.request(`/submissions/assignment/${assignmentId}`);
  },

  gradeSubmission(submissionId, grade, comments) {
    return this.request(`/submissions/${submissionId}/feedback`, {
      method: 'PUT',
      body: JSON.stringify({ grade, comments })
    });
  },

  downloadSubmissionFile(submissionId) {
    return this.request(`/submissions/${submissionId}/download`, {
      isDownload: true
    });
  },

  // Users
  getUsers() {
    return this.request('/users');
  }
};
