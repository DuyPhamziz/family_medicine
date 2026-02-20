package com.familymed.careplan.repository;

import com.familymed.careplan.entity.CarePlanAction;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CarePlanActionRepository extends JpaRepository<CarePlanAction, UUID> {
    List<CarePlanAction> findByCarePlanId(UUID carePlanId);

    List<CarePlanAction> findByCarePlanIdIn(List<UUID> carePlanIds);
}
