package com.lms.app.repository;

import com.lms.app.model.Assignment;
import com.lms.app.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByCourse(Course course);
    List<Assignment> findByCourseId(Long courseId);
    List<Assignment> findByCourseIn(List<Course> courses);
}
