package com.lms.app.service;

import com.lms.app.exception.AccessDeniedException;
import com.lms.app.exception.BadRequestException;
import com.lms.app.exception.FileValidationException;
import com.lms.app.exception.ResourceNotFoundException;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${lms.file.upload-dir:./uploads/submissions}")
    private String uploadDir;

    private Path fileStorageLocation;

    // Strict extension whitelist for academic submissions
    private static final Set<String> ALLOWED_EXTENSIONS = new HashSet<>(Arrays.asList(
            "pdf", "docx", "txt", "zip", "png", "jpg", "jpeg", "py", "java", "cpp", "c", "md"
    ));

    // Blocked dangerous executable extensions explicitly
    private static final Set<String> DANGEROUS_EXTENSIONS = new HashSet<>(Arrays.asList(
            "exe", "bat", "sh", "cmd", "ps1", "vbs", "jar", "war", "jsp", "php", "phtml", "asp", "aspx", "cgi", "pl", "dll", "so"
    ));

    // Maximum file size in bytes (10MB)
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

    @PostConstruct
    public void init() {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (IOException ex) {
            throw new RuntimeException("Could not create directory where the uploaded files will be stored.", ex);
        }
    }

    /**
     * Validates and securely saves the uploaded file.
     *
     * @param file uploaded MultipartFile
     * @return generated secure file name on disk
     */
    public String storeFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Cannot store empty or missing file.");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new FileValidationException("File size exceeds the 10MB limit.");
        }

        // 1. Sanitize original filename and check path traversal
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "unnamed_file");

        if (originalFilename.contains("..") || originalFilename.contains("/") || originalFilename.contains("\\")) {
            throw new FileValidationException("Filename contains invalid path sequence: " + originalFilename);
        }

        // 2. Validate extension
        String extension = getFileExtension(originalFilename).toLowerCase();
        if (DANGEROUS_EXTENSIONS.contains(extension)) {
            throw new FileValidationException("Executable or script file type (." + extension + ") is strictly forbidden.");
        }

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new FileValidationException("File extension ." + extension + " is not allowed. Allowed extensions: " + String.join(", ", ALLOWED_EXTENSIONS));
        }

        // 3. Generate unique, non-guessable storage filename to avoid collisions and LFI
        String secureFileName = UUID.randomUUID().toString() + "." + extension;

        try {
            Path targetLocation = this.fileStorageLocation.resolve(secureFileName).normalize();

            // Extra safety check to guarantee target is inside the intended root
            if (!targetLocation.startsWith(this.fileStorageLocation)) {
                throw new FileValidationException("Invalid storage path destination.");
            }

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
            }

            return secureFileName;
        } catch (IOException ex) {
            throw new RuntimeException("Failed to store file " + originalFilename, ex);
        }
    }

    /**
     * Loads a stored file as a Spring Resource for secure download.
     *
     * @param storedFileName stored UUID filename
     * @return Resource file
     */
    public Resource loadFileAsResource(String storedFileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(storedFileName).normalize();

            // Prevent path traversal outside storage directory
            if (!filePath.startsWith(this.fileStorageLocation)) {
                throw new AccessDeniedException("Unauthorized file access attempt.");
            }

            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("File not found on server: " + storedFileName);
            }
        } catch (MalformedURLException ex) {
            throw new ResourceNotFoundException("File not found: " + storedFileName);
        }
    }

    public void deleteFile(String storedFileName) {
        if (storedFileName == null || storedFileName.trim().isEmpty()) {
            return;
        }
        try {
            Path filePath = this.fileStorageLocation.resolve(storedFileName).normalize();
            if (filePath.startsWith(this.fileStorageLocation)) {
                Files.deleteIfExists(filePath);
            }
        } catch (IOException ignored) {
        }
    }

    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1 || lastDotIndex == filename.length() - 1) {
            return "";
        }
        return filename.substring(lastDotIndex + 1);
    }
}
