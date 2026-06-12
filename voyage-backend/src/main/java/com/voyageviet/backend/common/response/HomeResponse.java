package com.voyageviet.backend.common.response;

import com.voyageviet.backend.category.dto.response.CategoryResponse;
import com.voyageviet.backend.destination.dto.response.DestinationResponse;
import com.voyageviet.backend.tour.dto.TourCardResponse;

import java.util.List;

public record HomeResponse(
        List<CategoryResponse> categories,
        List<DestinationResponse> destinations,
        List<TourCardResponse> featuredTours
) {
}
