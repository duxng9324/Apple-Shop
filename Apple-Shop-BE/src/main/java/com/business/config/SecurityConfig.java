package com.business.config;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.business.rest.CustomAccessDeniedHandler;
import com.business.rest.JwtAuthenticationTokenFilter;
import com.business.rest.RestAuthenticationEntryPoint;

@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {
	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();
		configuration.setAllowedOriginPatterns(Arrays.asList("*"));
		configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
		configuration.setAllowedHeaders(Arrays.asList("*"));
		configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));
		configuration.setAllowCredentials(false);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}
		
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
	  @Override
	  protected void configure(HttpSecurity http) throws Exception {
	    // Disable csrf for stateless api token flow
	    http.cors().and().csrf().ignoringAntMatchers("/api/**");
	    http.antMatcher("/api/**").httpBasic().authenticationEntryPoint(restServicesEntryPoint()).and()
	        .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS).and().authorizeRequests()
	        .antMatchers(HttpMethod.OPTIONS, "/**").permitAll()
	        .antMatchers("/api/login**", "/api/signup**").permitAll()
	        .antMatchers(HttpMethod.GET, "/api/vnpay/ipn").permitAll()
	        .antMatchers(HttpMethod.POST, "/api/vnpay/ipn").permitAll()
	        .antMatchers(HttpMethod.GET, "/api/product", "/api/product/*", "/api/product/code/*").permitAll()
	        .antMatchers("/api/warehouse/**", "/api/inventory/**", "/api/stock-receipt/**", "/api/stock-issue/**")
	            .hasAnyAuthority("ROLE_ADMIN", "PERM_WAREHOUSE")
	        .antMatchers("/api/accounting/**")
	            .hasAnyAuthority("ROLE_ADMIN", "PERM_ACCOUNTING")
	        .antMatchers(HttpMethod.POST, "/api/product")
	            .hasAnyAuthority("ROLE_ADMIN", "PERM_PRODUCT")
	        .antMatchers(HttpMethod.PUT, "/api/product/**")
	            .hasAnyAuthority("ROLE_ADMIN", "PERM_PRODUCT")
	        .antMatchers(HttpMethod.DELETE, "/api/product/**")
	            .hasAnyAuthority("ROLE_ADMIN", "PERM_PRODUCT")
	        .antMatchers(HttpMethod.PUT, "/api/order/confirm/**", "/api/order/change/**")
	            .hasAnyAuthority("ROLE_ADMIN", "PERM_WAREHOUSE")
	        .antMatchers(HttpMethod.PUT, "/api/order/payment/**")
	            .hasAnyAuthority("ROLE_ADMIN", "PERM_ACCOUNTING", "PERM_WAREHOUSE")
	        .antMatchers(HttpMethod.GET, "/api/order")
	            .hasAnyAuthority("ROLE_ADMIN", "PERM_ACCOUNTING", "PERM_WAREHOUSE")
	        .antMatchers(HttpMethod.DELETE, "/api/user/**")
	            .hasAuthority("ROLE_ADMIN")
	        .antMatchers(HttpMethod.GET, "/api/user")
	            .hasAuthority("ROLE_ADMIN")
	        .antMatchers(HttpMethod.PUT, "/api/user/*/role")
	            .hasAuthority("ROLE_ADMIN")
	        .antMatchers(HttpMethod.PUT, "/api/user/batch/role")
	            .hasAuthority("ROLE_ADMIN")
	        .anyRequest().authenticated().and()
	        .addFilterBefore(jwtAuthenticationTokenFilter(), UsernamePasswordAuthenticationFilter.class)
	        .exceptionHandling().accessDeniedHandler(customAccessDeniedHandler());
	  }
}
