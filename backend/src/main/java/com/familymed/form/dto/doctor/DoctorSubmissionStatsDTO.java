package com.familymed.form.dto.doctor;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorSubmissionStatsDTO {
    
    /**
     * Tổng số submissions (tất cả trạng thái)
     */
    private Long totalSubmissions;
    
    /**
     * Số submissions đang chờ xử lý (PENDING)
     */
    private Long pendingSubmissions;
    
    /**
     * Số submissions đã phản hồi (RESPONDED)
     */
    private Long respondedSubmissions;
    
    /**
     * Số submissions hôm nay
     */
    private Long submissionsToday;
    
    /**
     * Số submissions nguy cơ cao
     */
    private Long highRiskSubmissions;
    
    /**
     * Số bệnh nhân unique (đếm theo email)
     */
    private Long uniquePatients;
}
