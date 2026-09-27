/**
 * LMS Secure Core - Client Application Logic
 * Clean REST API client with JWT Auth, Role UI switching, Modal Management, File Uploads
 */

const API_BASE = '/api';

// Application State
const state = {
  token: localStorage.getItem('lms_token') || null,
  user: JSON.parse(localStorage.getItem('lms_user') || 'null'),
  currentTab: 'courses',
  courses: [],
  myCourses: [],
  assignments: [],
  submissions: [],
  allUsers: []
};

// ==========================================================================
// API HELPER FUNCTIONS
// ==========================================================================

async function apiRequest(endpoint, options = {}) {
  const headers = {
    ...(options.headers || {})
  };

  if (state.token) {
    headers['Authorization'] = `Bearer ${state.token}`;
  }

  // If not FormData, default to JSON content type
  if (!(options.body instanceof FormData) && !headers['Content-Type'] && options.body) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    // Handle 401 Unauthorized
    if (response.status === 401) {
      if (state.token) {
        showToast('Session expired or unauthorized. Please log in again.', 'danger');
        handleLogout(false);
      }
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || 'Unauthorized');
    }

    // Handle File Download (blob response)
    if (options.isDownload) {
      if (!response.ok) {
        const err = await response.json().catch(() => ({ message: 'Download failed' }));
        throw new Error(err.message || 'Download failed');
      }
      const blob = await response.blob();
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'downloaded-file';
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
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

// ==========================================================================
// AUTHENTICATION & SESSION
// ==========================================================================

async function handleLogin(username, password) {
  try {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });

    state.token = data.token;
    state.user = data.user;
    localStorage.setItem('lms_token', data.token);
    localStorage.setItem('lms_user', JSON.stringify(data.user));

    closeModal('loginModal');
    updateAuthUI();
    showToast(`Welcome back, ${state.user.fullName}!`, 'success');
    loadCurrentTab();
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

async function handleRegister(username, email, password, fullName, role) {
  try {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, fullName, role })
    });

    state.token = data.token;
    state.user = data.user;
    localStorage.setItem('lms_token', data.token);
    localStorage.setItem('lms_user', JSON.stringify(data.user));

    closeModal('registerModal');
    updateAuthUI();
    showToast(`Account created successfully as ${role.replace('ROLE_', '')}!`, 'success');
    loadCurrentTab();
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

function handleLogout(notify = true) {
  state.token = null;
  state.user = null;
  localStorage.removeItem('lms_token');
  localStorage.removeItem('lms_user');

  updateAuthUI();
  if (notify) showToast('Logged out successfully.', 'info');
  switchTab('courses');
}

function quickLogin(username, password) {
  handleLogin(username, password);
}

function updateAuthUI() {
  const userSection = document.getElementById('userNavSection');
  const guestSection = document.getElementById('guestNavSection');
  const roleBadge = document.getElementById('userRoleBadge');
  const userFullName = document.getElementById('userFullName');

  // Role conditional tabs
  const tabMyCourses = document.getElementById('tabNavMyCourses');
  const tabSubmissions = document.getElementById('tabNavSubmissions');
  const tabUsers = document.getElementById('tabNavUsers');
  const btnCreateCourse = document.getElementById('btnCreateCourseHeader');

  if (state.user && state.token) {
    guestSection.classList.add('hidden');
    userSection.classList.remove('hidden');

    userFullName.textContent = state.user.fullName;
    const cleanRole = state.user.role.replace('ROLE_', '');
    roleBadge.textContent = cleanRole;
    roleBadge.className = `badge badge-${cleanRole.toLowerCase()}`;

    // Nav permissions
    tabMyCourses.classList.remove('hidden');
    tabSubmissions.classList.remove('hidden');

    if (state.user.role === 'ROLE_INSTRUCTOR' || state.user.role === 'ROLE_ADMIN') {
      tabMyCourses.querySelector('span').textContent = 'My Teaching';
      tabSubmissions.querySelector('span').textContent = 'Review & Grade';
      if (btnCreateCourse) btnCreateCourse.classList.remove('hidden');
    } else {
      tabMyCourses.querySelector('span').textContent = 'My Enrolled Courses';
      tabSubmissions.querySelector('span').textContent = 'My Submissions';
      if (btnCreateCourse) btnCreateCourse.classList.add('hidden');
    }

    if (state.user.role === 'ROLE_ADMIN') {
      tabUsers.classList.remove('hidden');
    } else {
      tabUsers.classList.add('hidden');
    }
  } else {
    guestSection.classList.remove('hidden');
    userSection.classList.add('hidden');
    tabMyCourses.classList.add('hidden');
    tabSubmissions.classList.add('hidden');
    tabUsers.classList.add('hidden');
    if (btnCreateCourse) btnCreateCourse.classList.add('hidden');
  }
}

// ==========================================================================
// NAVIGATION & TABS
// ==========================================================================

function switchTab(tabId) {
  state.currentTab = tabId;

  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.dataset.tab === tabId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  document.querySelectorAll('.tab-view').forEach(view => {
    if (view.id === `view-${tabId}`) {
      view.classList.remove('hidden');
    } else {
      view.classList.add('hidden');
    }
  });

  loadCurrentTab();
}

function loadCurrentTab() {
  switch (state.currentTab) {
    case 'courses':
      loadCourses();
      break;
    case 'my-courses':
      loadMyCourses();
      break;
    case 'assignments':
      loadAssignments();
      break;
    case 'submissions':
      loadSubmissions();
      break;
    case 'users':
      loadUsers();
      break;
  }
}

// ==========================================================================
// COURSES MODULE
// ==========================================================================

async function loadCourses(search = '') {
  const container = document.getElementById('coursesGrid');
  container.innerHTML = '<div class="text-muted" style="grid-column: 1/-1; padding: 24px 0;">Loading course catalog...</div>';

  try {
    const url = search ? `/courses?search=${encodeURIComponent(search)}` : '/courses';
    const courses = await apiRequest(url);
    state.courses = courses;

    if (courses.length === 0) {
      container.innerHTML = '<div class="text-muted" style="grid-column: 1/-1; padding: 32px; text-align:center; border:1px dashed var(--border-strong); border-radius:8px;">No courses found matching your query.</div>';
      return;
    }

    container.innerHTML = courses.map(c => `
      <div class="course-card">
        <div>
          <div class="course-card-top">
            <span class="badge badge-code">${escapeHtml(c.code)}</span>
            <span class="text-dim" style="font-size:11px;">${c.enrolledStudentsCount} enrolled</span>
          </div>
          <h3 class="course-title">${escapeHtml(c.title)}</h3>
          <p class="course-desc mt-sm">${escapeHtml(c.description || 'No description provided.')}</p>
        </div>

        <div>
          <div class="course-meta">
            <span>Instructor: <strong>${escapeHtml(c.instructor ? c.instructor.fullName : 'Faculty')}</strong></span>
            <span>${c.assignmentsCount} assignments</span>
          </div>

          <div class="flex items-center justify-between mt-md gap-sm">
            <button class="btn btn-secondary btn-sm" onclick="viewCourseDetails(${c.id})">View Course</button>
            ${renderCourseActionBtn(c)}
          </div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger" style="grid-column: 1/-1;">Failed to load courses: ${escapeHtml(err.message)}</div>`;
  }
}

function renderCourseActionBtn(course) {
  if (!state.user) {
    return `<button class="btn btn-primary btn-sm" onclick="openModal('loginModal')">Login to Enroll</button>`;
  }

  if (state.user.role === 'ROLE_STUDENT') {
    if (course.enrolledByCurrentUser) {
      return `<span class="badge badge-graded">Enrolled</span>`;
    }
    return `<button class="btn btn-primary btn-sm" onclick="enrollCourse(${course.id})">Enroll</button>`;
  }

  if (state.user.role === 'ROLE_INSTRUCTOR' || state.user.role === 'ROLE_ADMIN') {
    const isOwner = course.instructor && course.instructor.id === state.user.id;
    if (isOwner || state.user.role === 'ROLE_ADMIN') {
      return `
        <div class="flex gap-sm">
          <button class="btn btn-secondary btn-sm" onclick="openCreateAssignmentModal(${course.id}, '${escapeQuotes(course.title)}')">+ Assignment</button>
          <button class="btn btn-secondary btn-sm" onclick="openEditCourseModal(${course.id})">Edit</button>
        </div>
      `;
    }
  }

  return '';
}

async function enrollCourse(courseId) {
  try {
    await apiRequest(`/courses/${courseId}/enroll`, { method: 'POST' });
    showToast('Successfully enrolled in course!', 'success');
    loadCourses();
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

async function handleCreateCourse(e) {
  e.preventDefault();
  const form = e.target;
  const courseId = form.dataset.courseId;

  const payload = {
    title: form.title.value.trim(),
    code: form.code.value.trim(),
    description: form.description.value.trim()
  };

  try {
    if (courseId) {
      await apiRequest(`/courses/${courseId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      showToast('Course updated successfully', 'success');
    } else {
      await apiRequest('/courses', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      showToast('Course created successfully', 'success');
    }
    closeModal('courseModal');
    loadCourses();
    if (state.currentTab === 'my-courses') loadMyCourses();
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

function openEditCourseModal(courseId) {
  const course = state.courses.find(c => c.id === courseId);
  if (!course) return;

  const form = document.getElementById('courseForm');
  form.dataset.courseId = courseId;
  form.title.value = course.title;
  form.code.value = course.code;
  form.description.value = course.description || '';
  document.getElementById('courseModalTitle').textContent = 'Edit Course';
  openModal('courseModal');
}

async function viewCourseDetails(courseId) {
  try {
    const course = await apiRequest(`/courses/${courseId}`);
    const assignments = await apiRequest(`/assignments/course/${courseId}`);

    document.getElementById('courseDetailCode').textContent = course.code;
    document.getElementById('courseDetailTitle').textContent = course.title;
    document.getElementById('courseDetailDesc').textContent = course.description || 'No description available.';
    document.getElementById('courseDetailInstructor').textContent = course.instructor ? course.instructor.fullName : 'Instructor';
    document.getElementById('courseDetailEnrolled').textContent = `${course.enrolledStudentsCount} students enrolled`;

    const asgList = document.getElementById('courseDetailAssignments');
    if (assignments.length === 0) {
      asgList.innerHTML = '<div class="text-muted text-sm">No assignments posted for this course yet.</div>';
    } else {
      asgList.innerHTML = assignments.map(a => `
        <div class="panel" style="padding:14px; margin-bottom:10px; background:var(--bg-subtle);">
          <div class="flex items-center justify-between">
            <div>
              <strong>${escapeHtml(a.title)}</strong>
              <div class="text-muted text-sm mt-xs">${escapeHtml(a.description || '')}</div>
              <div class="text-dim" style="font-size:11px; margin-top:4px;">Max Score: ${a.maxScore} pts ${a.dueDate ? ' | Due: ' + formatDate(a.dueDate) : ''}</div>
            </div>
            <div>
              ${renderAssignmentAction(a)}
            </div>
          </div>
        </div>
      `).join('');
    }

    openModal('courseDetailModal');
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

// ==========================================================================
// MY COURSES / TEACHING MODULE
// ==========================================================================

async function loadMyCourses() {
  const container = document.getElementById('myCoursesGrid');
  container.innerHTML = '<div class="text-muted" style="grid-column: 1/-1;">Loading your courses...</div>';

  try {
    const courses = await apiRequest('/courses/my-courses');
    state.myCourses = courses;

    if (courses.length === 0) {
      const msg = (state.user && state.user.role === 'ROLE_STUDENT')
        ? 'You have not enrolled in any courses yet. Browse the Course Catalog to enroll!'
        : 'You have not created any courses yet. Click "+ Create Course" above.';
      container.innerHTML = `<div class="text-muted" style="grid-column: 1/-1; padding: 32px; text-align:center; border:1px dashed var(--border-strong); border-radius:8px;">${msg}</div>`;
      return;
    }

    container.innerHTML = courses.map(c => `
      <div class="course-card">
        <div>
          <div class="course-card-top">
            <span class="badge badge-code">${escapeHtml(c.code)}</span>
            <span class="badge badge-graded">${state.user.role === 'ROLE_STUDENT' ? 'Enrolled' : 'Instructor'}</span>
          </div>
          <h3 class="course-title">${escapeHtml(c.title)}</h3>
          <p class="course-desc mt-sm">${escapeHtml(c.description || '')}</p>
        </div>

        <div>
          <div class="course-meta">
            <span>${c.assignmentsCount} assignments</span>
            <span>${c.enrolledStudentsCount} students</span>
          </div>

          <div class="flex items-center justify-between mt-md gap-sm">
            <button class="btn btn-secondary btn-sm" onclick="viewCourseDetails(${c.id})">View Course</button>
            ${state.user.role === 'ROLE_INSTRUCTOR' || state.user.role === 'ROLE_ADMIN'
              ? `<button class="btn btn-primary btn-sm" onclick="openCreateAssignmentModal(${c.id}, '${escapeQuotes(c.title)}')">+ Add Assignment</button>`
              : ''}
          </div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger" style="grid-column: 1/-1;">Failed to load your courses: ${escapeHtml(err.message)}</div>`;
  }
}

// ==========================================================================
// ASSIGNMENTS MODULE
// ==========================================================================

async function loadAssignments() {
  const container = document.getElementById('assignmentsList');
  container.innerHTML = '<div class="text-muted">Loading assignments...</div>';

  try {
    // Collect all assignments from all accessible courses
    const courses = await apiRequest('/courses');
    let allAssignments = [];

    for (const c of courses) {
      try {
        const asgs = await apiRequest(`/assignments/course/${c.id}`);
        allAssignments = allAssignments.concat(asgs);
      } catch (ignored) {}
    }

    state.assignments = allAssignments;

    if (allAssignments.length === 0) {
      container.innerHTML = '<div class="text-muted" style="padding: 32px; text-align:center; border:1px dashed var(--border-strong); border-radius:8px;">No assignments currently active.</div>';
      return;
    }

    container.innerHTML = `
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Course</th>
              <th>Assignment Title & Instructions</th>
              <th>Max Score</th>
              <th>Due Date</th>
              <th>Status / Action</th>
            </tr>
          </thead>
          <tbody>
            ${allAssignments.map(a => `
              <tr>
                <td><span class="badge badge-code">${escapeHtml(a.courseCode || '')}</span></td>
                <td>
                  <strong>${escapeHtml(a.title)}</strong>
                  <div class="text-muted text-sm mt-xs">${escapeHtml(a.description || '')}</div>
                </td>
                <td class="text-mono"><strong>${a.maxScore}</strong> pts</td>
                <td class="text-dim text-sm">${a.dueDate ? formatDate(a.dueDate) : 'No deadline'}</td>
                <td>
                  ${renderAssignmentAction(a)}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger">Failed to load assignments: ${escapeHtml(err.message)}</div>`;
  }
}

function renderAssignmentAction(assignment) {
  if (!state.user) {
    return `<button class="btn btn-secondary btn-sm" onclick="openModal('loginModal')">Login to Submit</button>`;
  }

  if (state.user.role === 'ROLE_STUDENT') {
    if (assignment.hasSubmitted) {
      const sub = assignment.mySubmission;
      return `
        <div class="flex items-center gap-sm">
          <span class="badge ${sub.status === 'GRADED' ? 'badge-graded' : 'badge-submitted'}">${sub.status}</span>
          <button class="btn btn-secondary btn-sm" onclick="openSubmitModal(${assignment.id}, '${escapeQuotes(assignment.title)}')">Resubmit</button>
        </div>
      `;
    }
    return `<button class="btn btn-primary btn-sm" onclick="openSubmitModal(${assignment.id}, '${escapeQuotes(assignment.title)}')">Submit Work</button>`;
  }

  if (state.user.role === 'ROLE_INSTRUCTOR' || state.user.role === 'ROLE_ADMIN') {
    return `
      <button class="btn btn-secondary btn-sm" onclick="viewSubmissionsForAssignment(${assignment.id}, '${escapeQuotes(assignment.title)}')">
        Review Submissions (${assignment.submissionCount || 0})
      </button>
    `;
  }

  return '';
}

function openCreateAssignmentModal(courseId, courseTitle) {
  const form = document.getElementById('assignmentForm');
  form.reset();
  form.courseId.value = courseId;
  document.getElementById('assignmentModalCourseTitle').textContent = `Course: ${courseTitle}`;
  openModal('assignmentModal');
}

async function handleCreateAssignment(e) {
  e.preventDefault();
  const form = e.target;

  const payload = {
    courseId: parseInt(form.courseId.value),
    title: form.title.value.trim(),
    description: form.description.value.trim(),
    maxScore: parseInt(form.maxScore.value),
    dueDate: form.dueDate.value ? form.dueDate.value + ':00' : null
  };

  try {
    await apiRequest('/assignments', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    showToast('Assignment created successfully!', 'success');
    closeModal('assignmentModal');
    loadAssignments();
    if (state.currentTab === 'my-courses') loadMyCourses();
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

// ==========================================================================
// SUBMISSIONS & GRADING MODULE
// ==========================================================================

function openSubmitModal(assignmentId, assignmentTitle) {
  const form = document.getElementById('submitForm');
  form.reset();
  form.assignmentId.value = assignmentId;
  document.getElementById('submitModalTitle').textContent = `Submit Work: ${assignmentTitle}`;
  document.getElementById('selectedFileName').textContent = 'No file selected (Optional, max 10MB)';
  openModal('submitModal');
}

async function handleSubmitAssignment(e) {
  e.preventDefault();
  const form = e.target;
  const assignmentId = form.assignmentId.value;
  const textContent = form.textContent.value.trim();
  const fileInput = form.submissionFile;

  if (!textContent && (!fileInput.files || fileInput.files.length === 0)) {
    showToast('Please provide text response or select a file to upload.', 'danger');
    return;
  }

  const formData = new FormData();
  formData.append('assignmentId', assignmentId);
  if (textContent) {
    formData.append('textContent', textContent);
  }
  if (fileInput.files && fileInput.files[0]) {
    formData.append('file', fileInput.files[0]);
  }

  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Uploading & Submitting...';

  try {
    await apiRequest('/submissions', {
      method: 'POST',
      body: formData
    });

    showToast('Assignment submitted successfully!', 'success');
    closeModal('submitModal');
    loadAssignments();
    if (state.currentTab === 'submissions') loadSubmissions();
  } catch (err) {
    showToast(err.message, 'danger');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Assignment';
  }
}

async function loadSubmissions() {
  const container = document.getElementById('submissionsViewContent');
  container.innerHTML = '<div class="text-muted">Loading submissions...</div>';

  if (!state.user) {
    container.innerHTML = '<div class="alert alert-info">Please log in to view your submissions.</div>';
    return;
  }

  try {
    if (state.user.role === 'ROLE_STUDENT') {
      const submissions = await apiRequest('/submissions/my-submissions');
      state.submissions = submissions;

      if (submissions.length === 0) {
        container.innerHTML = '<div class="text-muted" style="padding: 32px; text-align:center; border:1px dashed var(--border-strong); border-radius:8px;">You have not submitted any assignments yet.</div>';
        return;
      }

      container.innerHTML = `
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Assignment</th>
                <th>Submitted At</th>
                <th>Content & Attachment</th>
                <th>Status</th>
                <th>Score & Instructor Feedback</th>
              </tr>
            </thead>
            <tbody>
              ${submissions.map(s => `
                <tr>
                  <td>
                    <strong>${escapeHtml(s.assignmentTitle || 'Assignment')}</strong>
                    <div class="text-dim text-sm">${escapeHtml(s.courseTitle || '')}</div>
                  </td>
                  <td class="text-dim text-sm">${formatDate(s.submittedAt)}</td>
                  <td>
                    <div class="text-muted text-sm" style="max-width:240px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                      ${escapeHtml(s.textContent || '(No text content)')}
                    </div>
                    ${s.hasAttachment ? `
                      <button class="btn btn-secondary btn-sm mt-xs" onclick="downloadSubmissionFile(${s.id})">
                        📎 ${escapeHtml(s.originalFileName || 'attachment')} (${formatBytes(s.fileSize)})
                      </button>
                    ` : ''}
                  </td>
                  <td><span class="badge ${s.status === 'GRADED' ? 'badge-graded' : 'badge-submitted'}">${s.status}</span></td>
                  <td>
                    ${s.feedback ? `
                      <div class="text-mono" style="font-weight:600; color:var(--status-success-text);">
                        ${s.feedback.grade} / ${s.maxScore} pts
                      </div>
                      <div class="text-muted text-sm mt-xs" style="background:#f4f4f5; padding:4px 8px; border-radius:4px; font-style:italic;">
                        "${escapeHtml(s.feedback.comments || 'No comments')}"
                      </div>
                      <div class="text-dim" style="font-size:10px; margin-top:2px;">Graded by: ${escapeHtml(s.feedback.instructor ? s.feedback.instructor.fullName : 'Instructor')}</div>
                    ` : '<span class="text-dim text-sm">Pending Review</span>'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else {
      // Instructor / Admin view: Show list of courses and their assignments with submissions
      const courses = await apiRequest('/courses/my-courses');
      let html = '';

      for (const course of courses) {
        const asgs = await apiRequest(`/assignments/course/${course.id}`);
        if (asgs.length === 0) continue;

        html += `
          <div class="panel">
            <div class="panel-header">
              <div>
                <h3 class="panel-title">${escapeHtml(course.code)} - ${escapeHtml(course.title)}</h3>
                <p class="panel-subtitle">Select an assignment to view and grade student submissions</p>
              </div>
            </div>
            <div class="grid-cols-2">
              ${asgs.map(a => `
                <div style="border:1px solid var(--border-subtle); border-radius:6px; padding:12px; background:var(--bg-subtle);">
                  <div class="flex items-center justify-between">
                    <div>
                      <strong>${escapeHtml(a.title)}</strong>
                      <div class="text-dim text-sm mt-xs">Max: ${a.maxScore} pts</div>
                    </div>
                    <button class="btn btn-secondary btn-sm" onclick="viewSubmissionsForAssignment(${a.id}, '${escapeQuotes(a.title)}')">
                      Review Submissions
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      if (!html) {
        html = '<div class="text-muted" style="padding: 32px; text-align:center; border:1px dashed var(--border-strong); border-radius:8px;">No courses or assignments available for grading. Create assignments in your courses first.</div>';
      }

      container.innerHTML = html;
    }
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger">Failed to load submissions: ${escapeHtml(err.message)}</div>`;
  }
}

async function viewSubmissionsForAssignment(assignmentId, assignmentTitle) {
  try {
    const submissions = await apiRequest(`/submissions/assignment/${assignmentId}`);
    const assignment = await apiRequest(`/assignments/${assignmentId}`);

    document.getElementById('reviewModalTitle').textContent = `Submissions: ${assignmentTitle}`;
    const container = document.getElementById('assignmentSubmissionsList');

    if (submissions.length === 0) {
      container.innerHTML = '<div class="text-muted" style="padding:24px; text-align:center;">No students have submitted this assignment yet.</div>';
    } else {
      container.innerHTML = `
        <div class="table-wrapper">
          <table class="data-table">
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
              ${submissions.map(s => `
                <tr>
                  <td>
                    <strong>${escapeHtml(s.student ? s.student.fullName : 'Student')}</strong>
                    <div class="text-dim text-sm">${escapeHtml(s.student ? s.student.email : '')}</div>
                  </td>
                  <td>
                    <div class="text-muted text-sm" style="max-height:80px; overflow-y:auto; font-family:var(--font-mono); font-size:12px; background:#f4f4f5; padding:6px; border-radius:4px;">
                      ${escapeHtml(s.textContent || '(No text submitted)')}
                    </div>
                    <div class="text-dim text-sm mt-xs">Submitted: ${formatDate(s.submittedAt)}</div>
                  </td>
                  <td>
                    ${s.hasAttachment ? `
                      <button class="btn btn-secondary btn-sm" onclick="downloadSubmissionFile(${s.id})">
                        💾 Download ${escapeHtml(s.originalFileName || 'file')}
                      </button>
                    ` : '<span class="text-dim text-sm">No file</span>'}
                  </td>
                  <td>
                    <span class="badge ${s.status === 'GRADED' ? 'badge-graded' : 'badge-submitted'}">${s.status}</span>
                    ${s.feedback ? `
                      <div class="text-mono mt-xs" style="font-weight:600;">Score: ${s.feedback.grade} / ${assignment.maxScore}</div>
                    ` : ''}
                  </td>
                  <td>
                    <button class="btn btn-primary btn-sm" onclick="openGradeModal(${s.id}, ${assignment.maxScore}, ${s.feedback ? s.feedback.grade : "null"}, '${escapeQuotes(s.feedback ? s.feedback.comments || '' : '')}')">
                      ${s.feedback ? 'Update Grade' : 'Grade'}
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    openModal('reviewModal');
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

function openGradeModal(submissionId, maxScore, currentGrade, currentComments) {
  const form = document.getElementById('gradeForm');
  form.reset();
  form.submissionId.value = submissionId;
  form.grade.max = maxScore;
  document.getElementById('gradeMaxScoreHint').textContent = `Maximum permissible score: ${maxScore} points`;

  if (currentGrade !== null) {
    form.grade.value = currentGrade;
  }
  if (currentComments) {
    form.comments.value = currentComments;
  }

  openModal('gradeModal');
}

async function handleGradeSubmission(e) {
  e.preventDefault();
  const form = e.target;
  const submissionId = form.submissionId.value;

  const payload = {
    grade: parseFloat(form.grade.value),
    comments: form.comments.value.trim()
  };

  try {
    await apiRequest(`/submissions/${submissionId}/feedback`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });

    showToast('Grade and feedback saved successfully!', 'success');
    closeModal('gradeModal');
    closeModal('reviewModal');
    if (state.currentTab === 'submissions') loadSubmissions();
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

async function downloadSubmissionFile(submissionId) {
  try {
    const { blob, filename } = await apiRequest(`/submissions/${submissionId}/download`, { isDownload: true });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    showToast(`Downloaded ${filename}`, 'success');
  } catch (err) {
    showToast(`Download failed: ${err.message}`, 'danger');
  }
}

// ==========================================================================
// ADMIN USER MANAGEMENT
// ==========================================================================

async function loadUsers() {
  const container = document.getElementById('usersList');
  container.innerHTML = '<div class="text-muted">Loading user directory...</div>';

  try {
    const users = await apiRequest('/users');
    state.allUsers = users;

    container.innerHTML = `
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Assigned Role</th>
              <th>Account Created</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(u => `
              <tr>
                <td class="text-mono">#${u.id}</td>
                <td><strong>${escapeHtml(u.fullName)}</strong></td>
                <td class="text-mono">${escapeHtml(u.username)}</td>
                <td>${escapeHtml(u.email)}</td>
                <td>
                  <span class="badge badge-${u.role.replace('ROLE_', '').toLowerCase()}">
                    ${u.role.replace('ROLE_', '')}
                  </span>
                </td>
                <td class="text-dim text-sm">${formatDate(u.createdAt)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger">Failed to load users: ${escapeHtml(err.message)}</div>`;
  }
}

// ==========================================================================
// UI HELPERS & MODAL MANAGEMENT
// ==========================================================================

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('hidden');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('hidden');
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `alert alert-${type}`;
  toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
  toast.style.minWidth = '280px';
  toast.style.maxWidth = '400px';
  toast.textContent = message;

  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 4000);
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}

function escapeQuotes(str) {
  if (!str) return '';
  return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return dateStr;
  }
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// ==========================================================================
// INITIALIZATION
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  updateAuthUI();
  switchTab('courses');

  // Search filter debounce
  const searchInput = document.getElementById('courseSearchInput');
  if (searchInput) {
    let timeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        loadCourses(e.target.value);
      }, 300);
    });
  }

  // File upload input listener for custom label
  const fileInput = document.getElementById('submissionFileInput');
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const label = document.getElementById('selectedFileName');
      if (e.target.files && e.target.files.length > 0) {
        label.textContent = `Selected: ${e.target.files[0].name} (${formatBytes(e.target.files[0].size)})`;
      } else {
        label.textContent = 'No file selected (Optional, max 10MB)';
      }
    });
  }
});
