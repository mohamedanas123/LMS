package com.lms.app.model;

public enum Role {
    ROLE_STUDENT,
    ROLE_INSTRUCTOR,
    ROLE_ADMIN;

    public static Role fromString(String roleStr) {
        if (roleStr == null) {
            return ROLE_STUDENT;
        }
        String clean = roleStr.trim().toUpperCase();
        if (!clean.startsWith("ROLE_")) {
            clean = "ROLE_" + clean;
        }
        try {
            return Role.valueOf(clean);
        } catch (IllegalArgumentException e) {
            return ROLE_STUDENT;
        }
    }
}
