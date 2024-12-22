package com.ticketapp.EventSearch.entity;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.DateFormat;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;

import lombok.Data;

@Data
@Document(indexName = "events")
@JsonIgnoreProperties(ignoreUnknown = true)
public class EventDocument {

    @Id
    @Field(type = FieldType.Long, name = "event_id")
    @JsonProperty("event_id")
    private Long eventId; // Use eventId as the unique identifier in Elasticsearch

    @Field(type = FieldType.Text, name = "event_name")
    @JsonProperty("event_name")
    private String eventName;

    @Field(type = FieldType.Long, name = "venue_id")
    @JsonProperty("venue_id")
    private Long venueId;

    @Field(type = FieldType.Date, name = "event_start_time", format = DateFormat.date_hour_minute_second)
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    @JsonProperty("event_start_time")
    private LocalDateTime eventStartTime;

    @Field(type = FieldType.Date, name = "event_end_time", format = DateFormat.date_hour_minute_second)
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    @JsonProperty("event_end_time")
    private LocalDateTime eventEndTime;

    @Field(type = FieldType.Text, name = "event_description")
    @JsonProperty("event_description")
    private String eventDescription;

    @Field(type = FieldType.Text, name = "event_type")
    @JsonProperty("event_type")
    private String eventType;

    @Field(type = FieldType.Text, name = "event_status")
    @JsonProperty("event_status")
    private String eventStatus;

    @Field(type = FieldType.Object, name = "event_details")
    @JsonProperty("event_details")
    private Map<String, Object> eventDetails;
}
