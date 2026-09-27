package com.lms.app.repository;

import com.lms.app.model.Assignment;
import com.lms.app.model.Submission;
import com.lms.app.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findByAssignment(Assignment assignment);
    List<Submission> findByAssignmentId(Long assignmentId);
    List<Submission> findByStudent(User student);
    Optional<Submission> findByAssignmentAndStudent(Assignment assignment, User student);
    boolean existsByAssignmentAndStudent(Assignment assignment, User student);
}
