package com.iot.ptit.base.security;

import com.iot.ptit.custom.security.jwt.JwtService;
import com.iot.ptit.custom.service.auth.UserPermissionService;
import io.jsonwebtoken.JwtException;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class StompJwtChannelInterceptor implements ChannelInterceptor {
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtService jwtService;
    private final UserPermissionService userPermissionService;
    private final Set<String> authenticatedSessionIds = ConcurrentHashMap.newKeySet();

    public StompJwtChannelInterceptor(JwtService jwtService, UserPermissionService userPermissionService) {
        this.jwtService = jwtService;
        this.userPermissionService = userPermissionService;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            accessor.setUser(authenticate(accessor.getFirstNativeHeader("Authorization")));
            authenticatedSessionIds.add(accessor.getSessionId());
            return MessageBuilder.createMessage(message.getPayload(), accessor.getMessageHeaders());
        }
        if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())
                && !authenticatedSessionIds.contains(accessor.getSessionId())) {
            throw new IllegalArgumentException("An authenticated STOMP connection is required.");
        }
        if (StompCommand.DISCONNECT.equals(accessor.getCommand())) {
            authenticatedSessionIds.remove(accessor.getSessionId());
        }
        return message;
    }

    private UsernamePasswordAuthenticationToken authenticate(String authorization) {
        if (authorization == null || !authorization.startsWith(BEARER_PREFIX)) {
            throw new IllegalArgumentException("A Bearer token is required for STOMP.");
        }
        try {
            UUID userId = jwtService.extractUserId(authorization.substring(BEARER_PREFIX.length()));
            if (!userPermissionService.isActiveUser(userId)) {
                throw new IllegalArgumentException("The user account is unavailable.");
            }
            return new UsernamePasswordAuthenticationToken(
                    userId,
                    null,
                    userPermissionService.findAuthoritiesByUserId(userId));
        } catch (JwtException | IllegalArgumentException exception) {
            throw new IllegalArgumentException("The STOMP access token is invalid.", exception);
        }
    }
}
