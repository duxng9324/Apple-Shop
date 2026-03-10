package com.business.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.multipart.commons.CommonsMultipartResolver;

@Configuration
@ConfigurationProperties(prefix = "spring.servlet.multipart")
public class FileUploadConfig {
	private int maxFileSize; // Kích thước tối đa của file (byte)
    private int maxRequestSize; // Kích thước tối đa của request (byte)

    public void setMaxFileSize(int maxFileSize) {
        this.maxFileSize = maxFileSize;
    }

    public void setMaxRequestSize(int maxRequestSize) {
        this.maxRequestSize = maxRequestSize;
    }

    @Bean
    public CommonsMultipartResolver multipartResolver() {
        CommonsMultipartResolver resolver = new CommonsMultipartResolver();
        resolver.setMaxUploadSize(maxFileSize);
        resolver.setMaxUploadSizePerFile(maxRequestSize);
        return resolver;
    }
}
