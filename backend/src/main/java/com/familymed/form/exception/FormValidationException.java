package com.familymed.form.exception;

/**
 * Exception thrown when form validation fails during publish or other operations
 */
public class FormValidationException extends RuntimeException {

    public FormValidationException(String message) {
        super(message);
    }

    public FormValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}
