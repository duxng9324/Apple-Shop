package com.business.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.business.rest.CustomAccessDeniedHandler;
import com.business.rest.JwtAuthenticationTokenFilter;
import com.business.rest.RestAuthenticationEntryPoint;

@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {
		
	@Bean
	  public JwtAuthenticationTokenFilter jwtAuthenticationTokenFilter() throws Exception {
	    JwtAuthenticationTokenFilter jwtAuthenticationTokenFilter = new JwtAuthenticationTokenFilter();
	    jwtAuthenticationTokenFilter.setAuthenticationManager(authenticationManager());
	    return jwtAuthenticationTokenFilter;
	  }
	  @Bean
	  public RestAuthenticationEntryPoint restServicesEntryPoint() {
	    return new RestAuthenticationEntryPoint();
	  }
	  @Bean
	  public CustomAccessDeniedHandler customAccessDeniedHandler() {
	    return new CustomAccessDeniedHandler();
	  }
	  @Bean
	  @Override
	  protected AuthenticationManager authenticationManager() throws Exception {
	    return super.authenticationManager();
	  }
	  protected void configure(HttpSecurity http) throws Exception {
	    // Disable crsf cho đường dẫn /rest/**
	    http.csrf().ignoringAntMatchers("/api/**");
	    http.authorizeRequests().antMatchers("/api/login**", "/api/signup**", "/api/product/{device}","/api/product/code/{code}","/api/product").permitAll();
	    http.antMatcher("/api/**").httpBasic().authenticationEntryPoint(restServicesEntryPoint()).and()
	        .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS).and().authorizeRequests()
	        .antMatchers(HttpMethod.GET, "/api/**").access("hasRole('ROLE_ADMIN') or hasRole('ROLE_USER')")
	        .antMatchers(HttpMethod.POST, "/api/**").access("hasRole('ROLE_ADMIN') or hasRole('ROLE_USER')")
	        .antMatchers(HttpMethod.PUT, "/api/**").access("hasRole('ROLE_ADMIN') or hasRole('ROLE_USER')")
	        .antMatchers(HttpMethod.DELETE, "/api/**").access("hasRole('ROLE_ADMIN') or hasRole('ROLE_USER')").and()
	        .addFilterBefore(jwtAuthenticationTokenFilter(), UsernamePasswordAuthenticationFilter.class)
	        .exceptionHandling().accessDeniedHandler(customAccessDeniedHandler());
	  }
}
