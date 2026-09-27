package com.lms.app.repository;

import com.lms.app.model.Course;
import com.lms.app.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    Optional<Course> findByCode(String code);
    boolean existsByCode(String code);
    List<Course> findByInstructor(User instructor);
    List<Course> findByTitleContainingIgnoreCaseOrCodeContainingIgnoreCase(String title, String code);
}
