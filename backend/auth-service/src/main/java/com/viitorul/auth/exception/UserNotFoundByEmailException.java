package com.viitorul.auth.exception;

public class UserNotFoundByEmailException extends RuntimeException {
    public UserNotFoundByEmailException() {
        super("Nu există niciun cont asociat acestui email.");
    }
}

