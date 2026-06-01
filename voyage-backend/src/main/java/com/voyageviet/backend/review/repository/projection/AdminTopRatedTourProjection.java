package com.voyageviet.backend.review.repository.projection;

public interface AdminTopRatedTourProjection {

    Long getTourId();

    String getTourTitle();

    String getTourSlug();

    Long getReviewCount();

    Double getAverageRating();
}