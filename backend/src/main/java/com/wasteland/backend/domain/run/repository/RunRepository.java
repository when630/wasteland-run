package com.wasteland.backend.domain.run.repository;

import com.wasteland.backend.domain.run.entity.RunData;
import com.wasteland.backend.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RunRepository extends JpaRepository<RunData, Long> {
    Optional<RunData> findByUser(User user);
}
