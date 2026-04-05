package com.acousticsense.backend.config;



import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.acousticsense.backend.service.JWTService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class JWTFilter extends OncePerRequestFilter{
  private final JWTService jwtService;
  private final UserDetailsService userDetailsService;

  @Override
  protected void doFilterInternal(
    @NonNull HttpServletRequest request,
    @NonNull HttpServletResponse response,
    @NonNull FilterChain filterChain
  )throws ServletException , IOException{

    String authHeader = request.getHeader("Authorization");
    String jwt = null;
    String userEmail = null;

    // Priority 1: Check Authorization header (traditional HTTP header)
    if (authHeader != null && authHeader.startsWith("Bearer ")) {
        jwt = authHeader.substring(7);
    }

    // Priority 2: Check query parameter (for EventSource/SSE which can't set headers)
    if (jwt == null) {
        String tokenParam = request.getParameter("token");
        if (tokenParam != null && !tokenParam.isEmpty()) {
            jwt = tokenParam;
            log.debug("JWT token found in query parameter for SSE stream");
        }
    }

    // If no token found, continue filter chain
    if (jwt == null) {
        filterChain.doFilter(request, response);
        return;
    }

    try {
        userEmail = jwtService.extractUsername(jwt);
    } catch (Exception e) {
        log.debug("Failed to extract username from JWT: {}", e.getMessage());
        filterChain.doFilter(request, response);
        return;
    }

    if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
        try {
             UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
        if (jwtService.isTokenValid(jwt, userDetails)) {

            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    userDetails,
                    null,
                    userDetails.getAuthorities()
            );

            authToken.setDetails(
                    new WebAuthenticationDetailsSource().buildDetails(request)
            );
            SecurityContextHolder.getContext().setAuthentication(authToken);
            log.debug("JWT authenticated user: {}", userEmail);
        }

        } catch (Exception e) {

        log.debug("Cannot set user authentication: " + e.getMessage());
        }
    }

    filterChain.doFilter(request, response);
  }
}
