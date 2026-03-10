package com.business.service.impl;

import java.util.Date;

import org.springframework.stereotype.Service;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSSigner;
import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;


@Service
public class JwtService {
	public static final String USERNAME = "username";
	public static final String ROLE = "role";
	public static final String NAME = "name";
	public static final String ID = "id";
	public static final String SECRET_KEY = "11111111111111111111111111111111";
	public static final int EXPIRE_TIME = 100000000;
	
	
	public String generateTokenLogin(String username, int role, String name, Long id) {
	    String token = null;
	    try {
	      // Create HMAC signer
	      JWSSigner signer = new MACSigner(generateShareSecret());
	      JWTClaimsSet.Builder builder = new JWTClaimsSet.Builder();
	      builder.claim(USERNAME, username);
	      builder.claim(NAME, name);
	      builder.claim(ROLE, role);
	      builder.claim(ID, id);
	      builder.expirationTime(generateExpirationDate());
	      JWTClaimsSet claimsSet = builder.build();
	      SignedJWT signedJWT = new SignedJWT(new JWSHeader(JWSAlgorithm.HS256), claimsSet);
	     
	      signedJWT.sign(signer);
	      
	      token = signedJWT.serialize();
	    } catch (Exception e) {
	      e.printStackTrace();
	    }
	    return token;
	  }
	
	 // lấy thông tin có chứa trong token
	  private JWTClaimsSet getClaimsFromToken(String token) {
		    JWTClaimsSet claims = null;
		    try {
		      SignedJWT signedJWT = SignedJWT.parse(token);
		      JWSVerifier verifier = new MACVerifier(generateShareSecret());
		      if (signedJWT.verify(verifier)) {
		        claims = signedJWT.getJWTClaimsSet();
		      }
		    } catch (Exception e) {
		      e.printStackTrace();
		    }
		    return claims;
		  }
	
	// tạo khóa bí mật
	 private byte[] generateShareSecret() {
		    // Generate 256-bit (32-byte) shared secret
	    byte[] sharedSecret = new byte[32];
	    sharedSecret = SECRET_KEY.getBytes();
	    return sharedSecret;
	 }
	 
	 //tính thời gian hết hạn của token
	 private Date generateExpirationDate() {
	    return new Date(System.currentTimeMillis() + EXPIRE_TIME);
	 }
	 
	 // lấy ra user_name từ token
	 public String getUsernameFromToken(String token) {
	    String username = null;
	    try {
	      JWTClaimsSet claims = getClaimsFromToken(token);
	      username = claims.getStringClaim(USERNAME);
	    } catch (Exception e) {
	      e.printStackTrace();
	    }
	    return username;
	 }
	 
	 // kiểm tra xem token còn hạn không
	 private Boolean isTokenExpired(String token) {
	    Date expiration = getExpirationDateFromToken(token);
	    return expiration.before(new Date());
	  }
	 
	 // lấy ra ngày hết hạn
	 private Date getExpirationDateFromToken(String token) {
	    Date expiration = null;
	    JWTClaimsSet claims = getClaimsFromToken(token);
	    expiration = claims.getExpirationTime();
	    return expiration;
	  }
	 
	 //kiểm tra tính hợp lệ của token
	 public Boolean validateTokenLogin(String token) {
		    if (token == null || token.trim().length() == 0) {
		      return false;
		    }
		    String username = getUsernameFromToken(token);
		    if (username == null || username.isEmpty()) {
		      return false;
		    }
		    if (isTokenExpired(token)) {
		      return false;
		    }
		    return true;
		  }
}
