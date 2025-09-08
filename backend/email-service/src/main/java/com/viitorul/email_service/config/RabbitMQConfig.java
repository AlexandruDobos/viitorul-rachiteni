// src/main/java/com/viitorul/email_service/config/RabbitMQConfig.java
package com.viitorul.email_service.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // --- Auth (existente) ---
    public static final String REGISTER_QUEUE  = "user.registered.queue";
    public static final String RESET_QUEUE     = "auth.reset.queue";
    public static final String ACTIVATED_QUEUE = "user.activated.queue";
    public static final String AUTH_EXCHANGE   = "auth.exchange";

    // --- App (global) ---
    public static final String APP_EXCHANGE = "app.exchange";

    // --- Contact (existente) ---
    public static final String CONTACT_QUEUE       = "contact.message.queue";
    public static final String CONTACT_ROUTING_KEY = "contact.message";

    // --- Donații (noi) ---
    public static final String DONATION_QUEUE       = "donation.completed.queue";
    public static final String DONATION_ROUTING_KEY = "donations.completed";

    // Exchanges
    @Bean
    public Exchange authExchange() {
        return ExchangeBuilder.topicExchange(AUTH_EXCHANGE).durable(true).build();
    }

    @Bean
    public Exchange appExchange() {
        return ExchangeBuilder.topicExchange(APP_EXCHANGE).durable(true).build();
    }

    // Cozi
    @Bean public Queue registerQueue()      { return new Queue(REGISTER_QUEUE, true); }
    @Bean public Queue passwordResetQueue() { return new Queue(RESET_QUEUE, true); }
    @Bean public Queue activatedQueue()     { return new Queue(ACTIVATED_QUEUE, true); }
    @Bean public Queue contactQueue()       { return new Queue(CONTACT_QUEUE, true); }
    @Bean public Queue donationQueue()      { return new Queue(DONATION_QUEUE, true); }

    // Bindings
    @Bean
    public Binding bindingContactQueue() {
        return BindingBuilder
                .bind(contactQueue())
                .to(appExchange())
                .with(CONTACT_ROUTING_KEY)
                .noargs();
    }

    @Bean
    public Binding bindingDonationQueue() {
        return BindingBuilder
                .bind(donationQueue())
                .to(appExchange())
                .with(DONATION_ROUTING_KEY)
                .noargs();
    }

    @Bean
    public Binding bindingActivatedQueue() {
        return BindingBuilder
                .bind(activatedQueue())
                .to(authExchange())
                .with("auth.activated")
                .noargs();
    }

    @Bean
    public Binding bindingRegisterQueue() {
        return BindingBuilder
                .bind(registerQueue())
                .to(authExchange())
                .with("auth.registered")
                .noargs();
    }

    @Bean
    public Binding bindingPasswordResetQueue() {
        return BindingBuilder
                .bind(passwordResetQueue())
                .to(authExchange())
                .with("auth.reset")
                .noargs();
    }

    // Converter + listener factory (identic cu ce folosești deja)
    @Bean
    public MessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
            ConnectionFactory connectionFactory,
            MessageConverter messageConverter
    ) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(messageConverter);
        return factory;
    }
}
