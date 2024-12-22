package com.ticketbooking.Booking.config;
import java.io.IOException;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class InternalCallFilter implements Filter {
    
    private static final Logger logger = LoggerFactory.getLogger(InternalCallFilter.class);
    private final Set<String> publicPaths = Set.of(
        "/api/bookings/getBooking",

        "/api/bookings/getBookingByUserId"
    );
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) 
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        String requestUri = httpRequest.getRequestURI();
        logger.info("Request URI: {}", requestUri);
        logger.info("Internal Header: {}", httpRequest.getHeader("X-Internal-Call"));
        
        boolean isPublicPath = publicPaths.stream()
            .anyMatch(path -> new AntPathMatcher().match(path, requestUri));
        logger.info("Is Public Path: {}", isPublicPath);

        if (isPublicPath) {
            logger.info("Public path: {}", requestUri);
            chain.doFilter(request, response);

            return;
        }

        String internalHeader = httpRequest.getHeader("X-Internal-Call");
        if (internalHeader == null || !internalHeader.equals("internal-service-key")) {

            HttpServletResponse httpResponse = (HttpServletResponse) response;
            httpResponse.setStatus(HttpStatus.FORBIDDEN.value());
            logger.error(requestUri + ": Access denied: Internal call header required");
            
            httpResponse.getWriter().write("Access denied: Internal call header required");
            return;
        }
        
        chain.doFilter(request, response);
    }

}
