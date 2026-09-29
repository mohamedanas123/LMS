package com.lms.app;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lms.app.dto.LoginRequest;
import com.lms.app.dto.RegisterRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class LmsApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Context Loads Successfully")
    void contextLoads() {
    }

    @Test
    @DisplayName("Public can browse courses without authentication")
    void publicCanBrowseCourses() throws Exception {
        mockMvc.perform(get("/api/courses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("Successful login returns JWT token")
    void userCanLogin() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setUsername("student_alice");
        req.setPassword("Student@12345");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").isString())
                .andExpect(jsonPath("$.data.user.username").value("student_alice"))
                .andExpect(jsonPath("$.data.user.role").value("ROLE_STUDENT"));
    }

    @Test
    @DisplayName("Login with invalid credentials returns 401 Unauthorized without stack trace")
    void invalidLoginReturns401() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setUsername("student_alice");
        req.setPassword("WrongPassword!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }

    @Test
    @DisplayName("New student can register securely")
    void userCanRegister() throws Exception {
        String uniqueUser = "testuser_" + System.currentTimeMillis();
        RegisterRequest req = new RegisterRequest();
        req.setUsername(uniqueUser);
        req.setEmail(uniqueUser + "@student.edu");
        req.setPassword("CharlieSecure@123");
        req.setFullName("Charlie Test");
        req.setRole("ROLE_STUDENT");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").isString())
                .andExpect(jsonPath("$.data.user.username").value(uniqueUser));
    }
}
