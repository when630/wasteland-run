package com.wasteland.backend.global.exception;

import org.springframework.http.HttpStatus;

public class RunDataNotFoundException extends BusinessException {

    public RunDataNotFoundException(String message) {
        super(message, HttpStatus.NOT_FOUND);
    }
}
