package com.business.dto;

import java.util.Date;

public class ApiErrorResponse {

    private String code;
    private String message;
    private String details;
    private Date timestamp;
    private String path;

    public ApiErrorResponse(String code, String message, String path) {
        this.code = code;
        this.message = message;
        this.path = path;
        this.timestamp = new Date();
        this.details = null;
    }

    public ApiErrorResponse(String code, String message, String details, String path) {
        this.code = code;
        this.message = message;
        this.details = details;
        this.path = path;
        this.timestamp = new Date();
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public Date getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Date timestamp) {
        this.timestamp = timestamp;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }
}
