package com.business.exception;

public class OptimisticLockException extends RuntimeException {

    private String code = "OPTIMISTIC_LOCK_FAIL";

    public OptimisticLockException(String message) {
        super(message);
    }

    public OptimisticLockException(String message, String code) {
        super(message);
        this.code = code;
    }

    public OptimisticLockException(String message, Throwable cause) {
        super(message, cause);
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}
