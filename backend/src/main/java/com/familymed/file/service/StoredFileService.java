package com.familymed.file.service;

import com.familymed.file.entity.StoredFile;
import com.familymed.file.repository.StoredFileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StoredFileService {

    private final StoredFileRepository storedFileRepository;

    @Value("${app.file.image.max-size-mb:5}")
    private long maxImageSizeMb;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    public StoredFile saveImage(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        String contentType = Optional.ofNullable(file.getContentType()).orElse("");
        if (!contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed");
        }

        long maxBytes = maxImageSizeMb * 1024 * 1024;
        if (file.getSize() > maxBytes) {
            throw new IllegalArgumentException("Image exceeds max size of " + maxImageSizeMb + "MB");
        }

        StoredFile storedFile = new StoredFile();
        storedFile.setOriginalFileName(Optional.ofNullable(file.getOriginalFilename()).orElse("image"));
        storedFile.setContentType(contentType);
        storedFile.setFileSize(file.getSize());
        storedFile.setFileData(file.getBytes());

        return storedFileRepository.save(storedFile);
    }

    public StoredFile getById(UUID fileId) {
        return storedFileRepository.findById(fileId)
            .orElseThrow(() -> new IllegalArgumentException("File not found"));
    }

    public void deleteById(UUID fileId) {
        if (storedFileRepository.existsById(fileId)) {
            storedFileRepository.deleteById(fileId);
        }
    }

    public byte[] getLegacyFileByName(String fileName) throws IOException {
        Path filePath = Paths.get(uploadDir).resolve(fileName);
        if (!Files.exists(filePath)) {
            throw new IllegalArgumentException("File not found");
        }
        return Files.readAllBytes(filePath);
    }
}
