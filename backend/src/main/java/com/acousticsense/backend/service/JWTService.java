package com.acousticsense.backend.service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import java.util.function.Function;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
@Service
public class JWTService {

@Value("${application.security.jwt.secret-key}")
private String secretKey;

//Generating token
public String generateToken(UserDetails userDetails){
    Map<String,Object> extraClaims= new HashMap<>();
    String role=userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse("USER");
       extraClaims.put("role", role);
  return generateToken(extraClaims, userDetails);
}
 
private String generateToken(Map<String,Object> extraClaims, UserDetails userDetails) {
  return Jwts.builder()
            .setClaims(extraClaims)
            .setSubject(userDetails.getUsername())
            .setIssuedAt(new Date(System.currentTimeMillis()))
            .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24)) 
            .signWith(getKey(), SignatureAlgorithm.HS256)
            .compact();
}

public boolean isTokenValid(String token, UserDetails userDetails){
  final String username= extractUsername(token);
  return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
}

public String extractUsername(String token) {
  
  return extractClaim(token, Claims::getSubject);
}

public boolean isTokenExpired(String token){
    return extractExpiration(token).before(new Date());
}
public Date extractExpiration(String token){
 return extractClaim(token, Claims::getExpiration);
}
 public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }
private Claims extractAllClaims(String token){
     return Jwts.parserBuilder()
            .setSigningKey(getKey())
            .build()
            .parseClaimsJws(token)
            .getBody();
}

private Key getKey(){
    byte[] keyBytes = Decoders.BASE64.decode(secretKey);
    return Keys.hmacShaKeyFor(keyBytes);
}
}
