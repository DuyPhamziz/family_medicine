package com.familymed.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;
import com.familymed.file.entity.StoredFile;
import com.familymed.file.service.StoredFileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final StoredFileService storedFileService;

    // Đường dẫn thư mục lưu ảnh (Cấu hình trong application.properties)
    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) throws IOException {
        try {
            StoredFile storedFile = storedFileService.saveImage(file);
            return ResponseEntity.ok(Map.of(
                "fileId", storedFile.getFileId().toString(),
                "fileName", storedFile.getOriginalFileName(),
                "size", storedFile.getFileSize()
            ));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", ex.getMessage()));
        }
    }

    @GetMapping("/view/{fileName}")
    public ResponseEntity<?> getFile(@PathVariable String fileName) throws IOException {
        try {
            UUID fileId = UUID.fromString(fileName);
            StoredFile storedFile = storedFileService.getById(fileId);
            MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
            try {
                mediaType = MediaType.parseMediaType(storedFile.getContentType());
            } catch (Exception ignored) {
            }

            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, mediaType.toString())
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + storedFile.getOriginalFileName() + "\"")
                .body(storedFile.getFileData());
        } catch (IllegalArgumentException ex) {
            Path filePath = Paths.get(uploadDir).resolve(fileName);
            if (!Files.exists(filePath)) {
                return ResponseEntity.notFound().build();
            }
            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(filePath.toUri());
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "image/jpeg")
                .body(resource);
        }
    }

    @DeleteMapping("/{fileId}")
    public ResponseEntity<?> deleteFile(@PathVariable String fileId) {
        try {
            storedFileService.deleteById(UUID.fromString(fileId));
            return ResponseEntity.ok(Map.of("message", "File deleted"));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", "Invalid file id"));
        }
    }
}