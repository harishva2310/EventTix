package com.ticketbooking.Event.util;

import java.util.function.Supplier;

import co.elastic.clients.elasticsearch._types.query_dsl.FuzzyQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.Operator;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;

public class ElasticSearchUtil {

    public static Supplier<Query> createQuery(String query) {
        if (query == null || query.trim().isEmpty()) {
            return () -> Query.of(q -> q.matchAll(m -> m));
        }
        
        return () -> Query.of(q -> q.multiMatch(m -> m
            .fields("event_name^2", "event_description", "event_type", "event_details.headliner^2","event_details.supportingActs^1.5", "event_details.amenities")
            .query(query)
            .minimumShouldMatch("30%")  // At least 30% of terms should match
            .fuzziness("AUTO")
            .operator(Operator.Or)
        ));
    }

    private static FuzzyQuery createFuzzyQuery(String query) {
        return new FuzzyQuery.Builder()
            .field("event_name")
            .field("event_description")
            .field("event_details")
            .field("event_type")
            .value(query)
            .build();
    }
}

