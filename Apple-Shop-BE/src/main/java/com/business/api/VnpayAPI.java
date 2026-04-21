package com.business.api;

import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.business.dto.OrderDTO;
import com.business.dto.VnpayCreatePaymentRequestDTO;
import com.business.dto.VnpayCreatePaymentResponseDTO;
import com.business.entity.UserEntity;
import com.business.repository.UserRepository;
import com.business.service.impl.VnpayService;

@CrossOrigin
@RestController
public class VnpayAPI {

    @Autowired
    private VnpayService vnpayService;

    @Autowired
    private UserRepository userRepository;

    private UserEntity getCurrentUserOrThrow() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("Bạn chưa đăng nhập");
        }

        UserEntity currentUser = userRepository.findByUsername(authentication.getName());
        if (currentUser == null) {
            throw new RuntimeException("Bạn chưa đăng nhập");
        }
        return currentUser;
    }

    private boolean isAdmin(UserEntity user) {
        return user != null && user.getRole() == UserEntity.ROLE_ADMIN;
    }

    @PostMapping(value = "/api/vnpay/create-payment-url")
    public ResponseEntity<?> createPaymentUrl(@RequestBody VnpayCreatePaymentRequestDTO request,
            HttpServletRequest servletRequest) {
        try {
            UserEntity currentUser = getCurrentUserOrThrow();
            OrderDTO order = request.getOrder();
            if (order == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Thiếu dữ liệu đơn hàng");
            }

            if (!isAdmin(currentUser)) {
                order.setUserId(currentUser.getId());
            }

            String clientIp = servletRequest.getHeader("X-FORWARDED-FOR");
            if (clientIp == null || clientIp.trim().isEmpty()) {
                clientIp = servletRequest.getRemoteAddr();
            }

            VnpayCreatePaymentResponseDTO response = vnpayService.createPaymentUrl(request, clientIp);
            return ResponseEntity.ok(response);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        }
    }

    @RequestMapping(value = "/api/vnpay/ipn", method = { RequestMethod.GET, RequestMethod.POST })
    public ResponseEntity<?> ipn(@RequestParam Map<String, String> params) {
        try {
            return ResponseEntity.ok(vnpayService.processIpn(params));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        }
    }
}