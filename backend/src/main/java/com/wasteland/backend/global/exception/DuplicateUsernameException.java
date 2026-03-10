package com.wasteland.backend.global.exception;

import org.springframework.http.HttpStatus;

public class DuplicateUsernameException extends BusinessException {

    public DuplicateUsernameException(String message) {
        super(message, HttpStatus.CONFLICT);
    }
}
