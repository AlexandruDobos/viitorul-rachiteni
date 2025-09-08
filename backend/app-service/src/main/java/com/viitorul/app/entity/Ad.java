package com.viitorul.app.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Data
@Entity
@Table(
        name = "ads",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_ads_bucket_order",
                        columnNames = {"position", "device_type", "order_index"}
                )
        }
)
public class Ad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    private String link;

    @Column(nullable = false)
    private String position; // "left" / "right"

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    @Enumerated(EnumType.STRING)
    @Column(name = "device_type", nullable = false, length = 12)
    private DeviceType deviceType = DeviceType.LAPTOP;

    private LocalDate startDate;
    private LocalDate endDate;
}
