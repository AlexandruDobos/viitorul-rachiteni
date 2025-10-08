package com.viitorul.donations.messaging;

import com.viitorul.common.events.SubscriptionPaymentCompletedEvent;
import com.viitorul.donations.config.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SubscriptionEventsPublisher {
    private final RabbitTemplate rabbit;

    public void publishPayment(SubscriptionPaymentCompletedEvent event) {
        rabbit.convertAndSend(
                RabbitMQConfig.APP_EXCHANGE,
                RabbitMQConfig.SUBSCRIPTION_PAYMENT_ROUTING_KEY,
                event
        );
    }
}
