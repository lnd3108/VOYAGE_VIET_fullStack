package com.voyageviet.backend.location.controller;

import com.voyageviet.backend.location.dto.VietnamProvinceResponse;
import com.voyageviet.backend.location.service.VietnamProvinceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/locations")
@RequiredArgsConstructor
public class AdminLocationController {

    private final VietnamProvinceService vietnamProvinceService;

    @GetMapping("/provinces")
    public List<VietnamProvinceResponse> getVietnamProvinces() {
        return vietnamProvinceService.getProvinces();
    }
}