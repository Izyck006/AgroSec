package com.farmsecurity.backend.repository;

import com.farmsecurity.backend.model.IntrusionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface IntrusionRepository extends JpaRepository<IntrusionLog, Long> {
    // Custom query method to pull recent alerts for the frontend dashboard later
    List<IntrusionLog> findTop10ByOrderByTimestampDesc();
}