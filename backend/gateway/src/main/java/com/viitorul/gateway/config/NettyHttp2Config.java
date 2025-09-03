package com.viitorul.gateway.config;

import org.springframework.boot.web.embedded.netty.NettyReactiveWebServerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import reactor.netty.http.HttpProtocol;

@Configuration
public class NettyHttp2Config {
    @Bean
    NettyReactiveWebServerFactory nettyReactiveWebServerFactory() {
        NettyReactiveWebServerFactory factory = new NettyReactiveWebServerFactory();
        // Acceptă atât HTTP/1.1 cât și HTTP/2 cleartext (H2C)
        factory.addServerCustomizers(httpServer ->
                httpServer.protocol(HttpProtocol.HTTP11, HttpProtocol.H2C)
        );
        return factory;
    }
}
