package com.voyageviet.backend.common.controller;

import com.voyageviet.backend.common.response.ApiResponse;
import com.voyageviet.backend.common.response.HomeResponse;
import com.voyageviet.backend.common.service.HomeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/home")
@RequiredArgsConstructor
public class HomeController {

    private final HomeService homeService;

    @GetMapping
    public ApiResponse<HomeResponse> getHomeData() {
        return ApiResponse.success("Get home data successfully", homeService.getHomeData());
    }
}