package com.viitorul.donations.messaging;

import com.viitorul.common.events.DonationCompletedEvent;
import com.viitorul.donations.config.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DonationEventsPublisher {

    private final RabbitTemplate rabbit;

    public void publishDonationCompleted(DonationCompletedEvent event) {
        rabbit.convertAndSend(
                RabbitMQConfig.APP_EXCHANGE,
                RabbitMQConfig.DONATION_ROUTING_KEY,
                event
        );
    }
}
