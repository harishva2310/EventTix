package com.ticketapp.EventSearch.util;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Supplier;

import co.elastic.clients.elasticsearch._types.query_dsl.Operator;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import co.elastic.clients.json.JsonData;

public class ElasticSearchUtil {

    public static Supplier<Query> createQuery(String searchQuery, String eventType, String city,
            String country, String eventDate) {
        List<Query> queries = new ArrayList<>();

        // Text search across event and venue fields
        if (searchQuery != null && !searchQuery.trim().isEmpty()) {
            queries.add(Query.of(q -> q.multiMatch(m -> m
                    .fields("event.event_name^2",
                            "event.event_description",
                            "event.event_type",
                            "event.event_details.headliner^2",
                            "event.event_details.supportingActs^1.5",
                            "event.event_details.amenities",
                            "venue.venue_name^1.5",
                            "venue.venue_address",
                            "venue.venue_type")
                    .query(searchQuery)
                    .minimumShouldMatch("50%")
                    .fuzziness("AUTO")
                    .operator(Operator.Or))));
        }

        // Filters for event fields
        if (eventType != null && !eventType.isEmpty()) {
            queries.add(Query.of(q -> q.match(m -> m.field("event.event_type").query(eventType))));
        }

        if (eventDate != null && !eventDate.isEmpty()) {
            queries.add(Query.of(q -> q.range(r -> r
                    .field("event.event_start_time")
                    .gte(JsonData.of(eventDate)))));
        }

        // Filters for venue fields with nested path
        if (city != null && !city.isEmpty()) {
            queries.add(Query.of(q -> q.match(m -> m.field("venue.venue_city").query(city))));
        }

        if (country != null && !country.isEmpty()) {
            queries.add(Query.of(q -> q.match(m -> m.field("venue.venue_country").query(country))));
        }

        // Return match_all if no queries
        if (queries.isEmpty()) {
            return () -> Query.of(q -> q.matchAll(m -> m));
        }

        // Combine all queries with AND operator
        return () -> Query.of(q -> q.bool(b -> b.must(queries)));
    }
}
