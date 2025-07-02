package com.viitorul.auth.exception;

public class EmailAlreadyInUseException extends RuntimeException {
    public EmailAlreadyInUseException() {
        super("This email is already in use.");
    }

    public EmailAlreadyInUseException(String message) {
        super(message);
    }
}
