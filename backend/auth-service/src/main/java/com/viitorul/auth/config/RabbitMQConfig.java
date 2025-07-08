package com.viitorul.auth.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {
    public static final String REGISTER_QUEUE = "user.registered.queue";
    public static final String RESET_QUEUE = "auth.reset.queue";
    public static final String ACTIVATED_QUEUE = "user.activated.queue";
    public static final String AUTH_EXCHANGE = "auth.exchange";

    @Bean
    public Exchange authExchange() {
        return ExchangeBuilder.topicExchange(AUTH_EXCHANGE).durable(true).build();
    }

    @Bean
    public Queue registerQueue() {
        return new Queue(REGISTER_QUEUE, true);
    }

    @Bean
    public Queue passwordResetQueue() {
        return new Queue(RESET_QUEUE, true);
    }

    @Bean
    public Queue activatedQueue() {
        return new Queue(ACTIVATED_QUEUE, true);
    }

    @Bean
    public Binding bindingUserActivatedQueue() {
        return BindingBuilder
                .bind(activatedQueue())
                .to((TopicExchange) authExchange())
                .with("auth.activated");
    }

    @Bean
    public Binding bindingPasswordResetQueue() {
        return org.springframework.amqp.core.BindingBuilder
                .bind(passwordResetQueue())
                .to((org.springframework.amqp.core.TopicExchange) authExchange())
                .with("auth.reset");
    }

    @Bean
    public Binding bindingUserRegisteredQueue() {
        return BindingBuilder
                .bind(registerQueue())
                .to((TopicExchange) authExchange())
                .with("auth.registered");
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory,
                                         MessageConverter messageConverter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter);
        return template;
    }
}

