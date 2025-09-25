package com.viitorul.app.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {
    public static final String APP_EXCHANGE = "app.exchange";
    public static final String CONTACT_QUEUE = "contact.message.queue";
    public static final String CONTACT_ROUTING_KEY = "contact.message";
    public static final String ANN_QUEUE = "announcements.published.queue";
    public static final String ANN_ROUTING_KEY = "announcements.published";

    @Bean
    public TopicExchange appExchange() {
        return ExchangeBuilder.topicExchange(APP_EXCHANGE).durable(true).build();
    }

    @Bean
    public Queue contactQueue() {
        return new Queue(CONTACT_QUEUE, true);
    }

    @Bean
    public Binding contactBinding() {
        return BindingBuilder.bind(contactQueue()).to(appExchange()).with(CONTACT_ROUTING_KEY);
    }

    @Bean
    public Queue announcementPublishedQueue() {
        return new Queue(ANN_QUEUE, true);
    }

    @Bean
    public Binding announcementPublishedBinding() {
        return BindingBuilder.bind(announcementPublishedQueue())
                .to(appExchange()).with(ANN_ROUTING_KEY);
    }

    @Bean
    public MessageConverter jsonConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory cf, MessageConverter conv) {
        RabbitTemplate t = new RabbitTemplate(cf);
        t.setMessageConverter(conv);
        return t;
    }
}

