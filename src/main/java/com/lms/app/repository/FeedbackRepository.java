package com.lms.app.repository;

import com.lms.app.model.Feedback;
import com.lms.app.model.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    Optional<Feedback> findBySubmission(Submission submission);
    Optional<Feedback> findBySubmissionId(Long submissionId);
}
