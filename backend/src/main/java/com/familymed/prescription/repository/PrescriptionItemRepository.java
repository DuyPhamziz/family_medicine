package com.familymed.prescription.repository;

import com.familymed.prescription.entity.PrescriptionItem;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PrescriptionItemRepository extends JpaRepository<PrescriptionItem, UUID> {
    List<PrescriptionItem> findByPrescriptionId(UUID prescriptionId);

    long countByPrescriptionId(UUID prescriptionId);

    List<PrescriptionItem> findByPrescriptionIdIn(List<UUID> prescriptionIds);
}
