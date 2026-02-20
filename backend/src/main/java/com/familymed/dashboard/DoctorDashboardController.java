package com.familymed.dashboard;

import com.familymed.dashboard.dto.DoctorDashboardResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DoctorDashboardController {

    private final DoctorDashboardService dashboardService;

    @GetMapping("/doctor")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<DoctorDashboardResponse> getDoctorDashboard() {
        return ResponseEntity.ok(dashboardService.getDashboard());
    }
}
