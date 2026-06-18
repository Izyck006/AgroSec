package com.farmsecurity.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Configuration
public class SecurityConfig {

    @Component
    @Order(1)
    public static class ApiKeyFilter extends OncePerRequestFilter {

        @Value("${api.key:#{null}}")
        private String apiKey;

        @Override
        protected void doFilterInternal(HttpServletRequest request,
                                        HttpServletResponse response,
                                        FilterChain filterChain)
                throws ServletException, IOException {

            // Skip auth for GET requests (read-only) and OPTIONS (CORS preflight)
            String method = request.getMethod();
            if ("GET".equalsIgnoreCase(method) || "OPTIONS".equalsIgnoreCase(method)) {
                filterChain.doFilter(request, response);
                return;
            }

            // Only enforce API key on POST/PUT/DELETE to /api/** if key is configured
            String path = request.getRequestURI();
            if (path.startsWith("/api/") && apiKey != null && !apiKey.isBlank()) {
                String requestApiKey = request.getHeader("X-API-Key");
                if (requestApiKey == null || !requestApiKey.equals(apiKey)) {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\": \"Unauthorized: Invalid or missing API key\"}");
                    return;
                }
            }

            filterChain.doFilter(request, response);
        }

        @Override
        protected boolean shouldNotFilter(HttpServletRequest request) {
            // Only apply to /api/ paths
            return !request.getRequestURI().startsWith("/api/");
        }
    }
}
