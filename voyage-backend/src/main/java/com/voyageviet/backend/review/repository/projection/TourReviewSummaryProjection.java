package com.voyageviet.backend.review.repository.projection;

public interface TourReviewSummaryProjection {

    Long getTourId();

    Long getReviewCount();

    Double getAverageRating();
}