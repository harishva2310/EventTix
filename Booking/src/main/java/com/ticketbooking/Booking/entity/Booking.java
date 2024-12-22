package com.ticketbooking.Booking.entity;

import java.util.Map;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;


@Entity
@Table(name = "booking")
@Data
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "booking_id")
    private Long bookingId;

    @Column(name = "user_id")
    private Long userId;

    @Column(name="ticket_id")
    private Long ticketId;

    @Column(name = "booking_date")
    private String bookingDate;

    @Column(name = "booking_time")
    private String bookingTime;

    @Column(name = "booking_status")
    private String bookingStatus;

    @Column(name="booking_details")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> bookingDetails;
}
