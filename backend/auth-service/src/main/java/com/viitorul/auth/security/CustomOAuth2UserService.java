package com.viitorul.auth.security;

import com.viitorul.auth.entity.User;
import com.viitorul.auth.entity.enums.AuthProvider;
import com.viitorul.auth.repository.UserRepository;
import com.viitorul.auth.service.EventPublisher;
import com.viitorul.common.events.UserAccountActivatedEvent;
import com.viitorul.common.events.UserRegisteredEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final UserRepository userRepository;
    private final EventPublisher eventPublisher;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = new DefaultOAuth2UserService().loadUser(userRequest);

        String email = oAuth2User.getAttribute("email");
        String provider = userRequest.getClientRegistration().getRegistrationId(); // google/facebook

        Optional<User> existingUser = userRepository.findByEmail(email);

        if (existingUser.isPresent()) {
            return oAuth2User;
        }

        User newUser = User.builder()
                .email(email)
                .emailVerified(true)
                .name(oAuth2User.getAttribute("name"))
                .provider(AuthProvider.valueOf(provider.toUpperCase()))
                .registeredAt(LocalDateTime.now())
                .build();

        userRepository.save(newUser);

        //trimit mail de bun venit
        eventPublisher.sendUserAccountActivatedEvent(new UserAccountActivatedEvent(
                newUser.getName(),
                newUser.getEmail()
        ));

        return oAuth2User;
    }
}
