package com.lms.app.config;

import com.lms.app.model.*;
import com.lms.app.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@Slf4j
public class DataInitializer implements CommandLineRunner {

   private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);
   private final UserRepository userRepository;
   private final CourseRepository courseRepository;
   private final EnrollmentRepository enrollmentRepository;
   private final AssignmentRepository assignmentRepository;
   private final SubmissionRepository submissionRepository;
   private final FeedbackRepository feedbackRepository;
   private final PasswordEncoder passwordEncoder;

   public DataInitializer(UserRepository userRepository, CourseRepository courseRepository, EnrollmentRepository enrollmentRepository, AssignmentRepository assignmentRepository, SubmissionRepository submissionRepository, FeedbackRepository feedbackRepository, PasswordEncoder passwordEncoder) {
       this.userRepository = userRepository;
       this.courseRepository = courseRepository;
       this.enrollmentRepository = enrollmentRepository;
       this.assignmentRepository = assignmentRepository;
       this.submissionRepository = submissionRepository;
       this.feedbackRepository = feedbackRepository;
       this.passwordEncoder = passwordEncoder;
   }

   @Override
   public void run(String... args) {
       if (userRepository.count() > 0) {
           log.info("hello");
           return;
       }

       log.info("Initializing LMS seed data with default users, courses, and assignments...");

       // 1. Create Default Users with BCrypt Hashed Passwords
       User admin = userRepository.save(User.builder()
               .username("admin")
               .email("admin@lms-secure.edu")
               .fullName("System Administrator")
               .passwordHash(passwordEncoder.encode("Admin@12345"))
               .role(Role.ROLE_ADMIN)
               .build());



       User instructorAlan = userRepository.save(User.builder()
               .username("instructor_alan")
               .email("alan.turing@lms-secure.edu")
               .fullName("Prof. Alan Turing")
               .passwordHash(passwordEncoder.encode("Instructor@12345"))
               .role(Role.ROLE_INSTRUCTOR)
               .build());

       User instructorAda = userRepository.save(User.builder()
               .username("instructor_ada")
               .email("ada.lovelace@lms-secure.edu")
               .fullName("Dr. Ada Lovelace")
               .passwordHash(passwordEncoder.encode("Instructor@12345"))
               .role(Role.ROLE_INSTRUCTOR)
               .build());

       User studentAlice = userRepository.save(User.builder()
               .username("student_alice")
               .email("alice.smith@student.lms-secure.edu")
               .fullName("Alice Smith")
               .passwordHash(passwordEncoder.encode("Student@12345"))
               .role(Role.ROLE_STUDENT)
               .build());

       User studentBob = userRepository.save(User.builder()
               .username("student_bob")
               .email("bob.jones@student.lms-secure.edu")
               .fullName("Bob Jones")
               .passwordHash(passwordEncoder.encode("Student@12345"))
               .role(Role.ROLE_STUDENT)
               .build());

       // 2. Create Courses
       Course course1 = courseRepository.save(Course.builder()
               .title("Network Security & Applied Cryptography")
               .code("SEC-101")
               .description("Foundational principles of network defenses, symmetric/asymmetric encryption, PKI, and secure session management.")
               .instructor(instructorAlan)
               .build());

       Course course2 = courseRepository.save(Course.builder()
               .title("Web Application Security & OWASP Top 10")
               .code("SEC-202")
               .description("Hands-on exploration of web vulnerabilities: Stored/Reflected XSS, Broken Object Level Authorization (IDOR), SQL injection, and defensive coding.")
               .instructor(instructorAda)
               .build());

       Course course3 = courseRepository.save(Course.builder()
               .title("Cloud Infrastructure & Threat Modeling")
               .code("SEC-303")
               .description("Architecting zero-trust networks, STRIDE threat modeling, and secure CI/CD pipelines.")
               .instructor(instructorAlan)
               .build());

       // 3. Enroll Students
       enrollmentRepository.save(Enrollment.builder().student(studentAlice).course(course1).build());
       enrollmentRepository.save(Enrollment.builder().student(studentAlice).course(course2).build());
       enrollmentRepository.save(Enrollment.builder().student(studentBob).course(course1).build());

       // 4. Create Assignments
       Assignment asg1 = assignmentRepository.save(Assignment.builder()
               .course(course1)
               .title("Lab 1: Cryptographic Cipher Implementation & Analysis")
               .description("Implement AES-GCM and HMAC verification in Java/Python. Analyze resistance against chosen-ciphertext attacks.")
               .maxScore(100)
               .dueDate(LocalDateTime.now().plusDays(7))
               .build());

       Assignment asg2 = assignmentRepository.save(Assignment.builder()
               .course(course1)
               .title("Lab 2: TLS Handshake & Certificate Validation")
               .description("Inspect packet captures of TLS 1.3 negotiation and report on cipher suite negotiation and forward secrecy.")
               .maxScore(50)
               .dueDate(LocalDateTime.now().plusDays(14))
               .build());

       Assignment asg3 = assignmentRepository.save(Assignment.builder()
               .course(course2)
               .title("Lab 1: Stored XSS & Contextual Encoding Defense")
               .description("Demonstrate how untrusted input in comment fields can lead to session hijacking and implement server-side HTML policy sanitizer.")
               .maxScore(100)
               .dueDate(LocalDateTime.now().plusDays(10))
               .build());

       // 5. Seed a Sample Submission & Feedback for Alice
       Submission subAlice = submissionRepository.save(Submission.builder()
               .assignment(asg1)
               .student(studentAlice)
               .textContent("Here is my analysis of AES-256-GCM authentication tags and key rotation policies. All unit tests passed.")
               .originalFileName("Alice_Cipher_Report.pdf")
               .storedFileName(null)
               .fileContentType("application/pdf")
               .fileSize(1048576L)
               .status(SubmissionStatus.GRADED)
               .build());

       feedbackRepository.save(Feedback.builder()
               .submission(subAlice)
               .instructor(instructorAlan)
               .grade(96.5)
               .comments("Excellent report and thorough analysis of nonce uniqueness in Galois/Counter Mode.")
               .build());





       log.info("LMS Seed Data Initialized successfully.");
       log.info("Default Demo Credentials:");
       log.info("  Admin: admin / Admin@12345");
       log.info("  Instructor: instructor_alan / Instructor@12345");
       log.info("  Instructor: instructor_ada / Instructor@12345");
       log.info("  Student: student_alice / Student@12345");
       log.info("  Student: student_bob / Student@12345");
   }
}
