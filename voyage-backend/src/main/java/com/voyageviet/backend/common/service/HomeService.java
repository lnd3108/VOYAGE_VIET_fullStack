package com.voyageviet.backend.common.service;

import com.voyageviet.backend.category.service.CategoryService;
import com.voyageviet.backend.common.response.HomeResponse;
import com.voyageviet.backend.destination.service.DestinationService;
import com.voyageviet.backend.tour.service.TourService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class HomeService {

    private final CategoryService categoryService;
    private final DestinationService destinationService;
    private final TourService tourService;

    public HomeResponse getHomeData() {
        return new HomeResponse(
                categoryService.getActiveCategories(),
                destinationService.getActiveDestinations(),
                tourService.getFeaturedTours()
        );
    }
}