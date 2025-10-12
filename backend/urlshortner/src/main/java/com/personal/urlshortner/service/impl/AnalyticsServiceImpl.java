package com.personal.urlshortner.service.impl;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;

import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import com.personal.urlshortner.model.Link;
import com.personal.urlshortner.service.IAnalyticsService;
import static org.springframework.data.mongodb.core.aggregation.Aggregation.*;

@Service
public class AnalyticsServiceImpl implements IAnalyticsService {

        @Autowired
        private MongoTemplate mongoTemplate;

        @Override
        public Map<String, Object> getAnalytics(String workspaceId) {

                long total = mongoTemplate.count(new Query(Criteria.where("workspaceId").is(workspaceId)), Link.class);
                long active = mongoTemplate
                                .count(new Query(Criteria.where("workspaceId").is(workspaceId).and("active").is(true)),
                                                Link.class);

                Instant expiringIn = Instant.now().plus(7, ChronoUnit.DAYS);
                long expiring = mongoTemplate.count(
                                new Query(Criteria.where("workspaceId").is(workspaceId).and("expiresAt")
                                                .lte(expiringIn)),
                                Link.class);

                var aggregate = newAggregation(
                                match(Criteria.where("workspaceId").is(workspaceId)),
                                group().sum("clicks").as("clicks"));

                AggregationResults<Document> aggregationResult = mongoTemplate.aggregate(aggregate, "links",
                                Document.class);

                long clicks = aggregationResult.getUniqueMappedResult() == null ? 0L
                                : ((Long) aggregationResult.getUniqueMappedResult().get("clicks")).longValue();

                return Map.of("total", total, "active", active, "expiringSoon", expiring, "clicks", clicks);
        }

}
