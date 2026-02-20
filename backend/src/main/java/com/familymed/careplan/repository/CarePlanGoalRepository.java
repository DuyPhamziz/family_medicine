package com.familymed.careplan.repository;

import com.familymed.careplan.entity.CarePlanGoal;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CarePlanGoalRepository extends JpaRepository<CarePlanGoal, UUID> {
    List<CarePlanGoal> findByCarePlanId(UUID carePlanId);

    List<CarePlanGoal> findByCarePlanIdIn(List<UUID> carePlanIds);
}
