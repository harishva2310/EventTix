package com.ticketbooking.Venue.util;

import java.util.function.Supplier;

import co.elastic.clients.elasticsearch._types.query_dsl.Operator;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
public class ElasticSearchUtil {
    public static Supplier<Query> createQuery(String query) {
        return () -> Query.of(q -> q.multiMatch(m -> m
            .fields("venue_name", "venue_city^1.5", "venue_state^1.5", "venue_country","venue_type","venue_address")
            .query(query)
            .fuzziness("AUTO")
            .operator(Operator.Or)
        ));
    }
}
