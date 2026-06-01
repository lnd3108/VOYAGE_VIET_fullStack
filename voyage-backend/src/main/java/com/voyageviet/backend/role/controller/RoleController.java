package com.voyageviet.backend.role.controller;

import com.voyageviet.backend.common.response.ApiResponse;
import com.voyageviet.backend.role.dto.RoleResponse;
import com.voyageviet.backend.role.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;

    @GetMapping
    public ApiResponse<List<RoleResponse>> getAllRoles() {
        return ApiResponse.success("Get roles successfully", roleService.getAllRoles());
    }
}