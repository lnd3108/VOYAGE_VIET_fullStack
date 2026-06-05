package com.voyageviet.backend.location.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.voyageviet.backend.location.dto.VietnamProvinceResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class VietnamProvinceService {

    private static final String PROVINCES_API_URL = "https://provinces.open-api.vn/api/v2/";
    private static final Duration CACHE_TTL = Duration.ofHours(12);

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    private volatile List<VietnamProvinceResponse> cachedProvinces = List.of();
    private volatile Instant cacheExpiresAt = Instant.EPOCH;

    public List<VietnamProvinceResponse> getProvinces() {
        Instant now = Instant.now();

        if (!cachedProvinces.isEmpty() && now.isBefore(cacheExpiresAt)) {
            return cachedProvinces;
        }

        synchronized (this) {
            now = Instant.now();
            if (!cachedProvinces.isEmpty() && now.isBefore(cacheExpiresAt)) {
                return cachedProvinces;
            }

            try {
                List<VietnamProvinceResponse> provinces = fetchExternalProvinces();
                if (!provinces.isEmpty()) {
                    cachedProvinces = List.copyOf(provinces);
                    cacheExpiresAt = now.plus(CACHE_TTL);
                    return cachedProvinces;
                }
            } catch (Exception exception) {
                log.warn("Cannot load Vietnam provinces from external API: {}", exception.getMessage());
            }

            if (!cachedProvinces.isEmpty()) {
                return cachedProvinces;
            }

            cachedProvinces = fallbackProvinces();
            cacheExpiresAt = now.plus(Duration.ofMinutes(30));
            return cachedProvinces;
        }
    }

    private List<VietnamProvinceResponse> fetchExternalProvinces() throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder(URI.create(PROVINCES_API_URL))
                .timeout(Duration.ofSeconds(10))
                .GET()
                .build();
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new IOException("External provinces API returned HTTP " + response.statusCode());
        }

        JsonNode root = objectMapper.readTree(response.body());
        JsonNode listNode = root.isArray() ? root : root.path("data");

        if (!listNode.isArray()) {
            return List.of();
        }

        List<VietnamProvinceResponse> provinces = new ArrayList<>();
        for (JsonNode item : listNode) {
            Integer code = item.path("code").canConvertToInt() ? item.path("code").asInt() : null;
            String name = text(item, "name");

            if (code == null || name.isBlank()) {
                continue;
            }

            provinces.add(new VietnamProvinceResponse(
                    code,
                    name,
                    displayName(name),
                    text(item, "codename"),
                    text(item, "division_type")
            ));
        }

        provinces.sort(Comparator.comparing(VietnamProvinceResponse::displayName, String.CASE_INSENSITIVE_ORDER));
        return provinces;
    }

    private List<VietnamProvinceResponse> fallbackProvinces() {
        return List.of(
                new VietnamProvinceResponse(1, "Thành phố Hà Nội", "Hà Nội", "thanh_pho_ha_noi", "thành phố"),
                new VietnamProvinceResponse(48, "Thành phố Đà Nẵng", "Đà Nẵng", "thanh_pho_da_nang", "thành phố"),
                new VietnamProvinceResponse(79, "Thành phố Hồ Chí Minh", "TP. Hồ Chí Minh", "thanh_pho_ho_chi_minh", "thành phố"),
                new VietnamProvinceResponse(31, "Thành phố Hải Phòng", "Hải Phòng", "thanh_pho_hai_phong", "thành phố"),
                new VietnamProvinceResponse(92, "Thành phố Cần Thơ", "Cần Thơ", "thanh_pho_can_tho", "thành phố"),
                new VietnamProvinceResponse(11, "Tỉnh Điện Biên", "Điện Biên", "tinh_dien_bien", "tỉnh"),
                new VietnamProvinceResponse(56, "Tỉnh Khánh Hòa", "Khánh Hòa", "tinh_khanh_hoa", "tỉnh"),
                new VietnamProvinceResponse(75, "Tỉnh Đồng Nai", "Đồng Nai", "tinh_dong_nai", "tỉnh"),
                new VietnamProvinceResponse(89, "Tỉnh An Giang", "An Giang", "tinh_an_giang", "tỉnh"),
                new VietnamProvinceResponse(96, "Tỉnh Cà Mau", "Cà Mau", "tinh_ca_mau", "tỉnh")
        );
    }

    private String text(JsonNode item, String fieldName) {
        JsonNode value = item.path(fieldName);
        return value.isTextual() ? value.asText().trim() : "";
    }

    private String displayName(String name) {
        return name
                .replaceFirst("(?i)^Thành phố\\s+", "")
                .replaceFirst("(?i)^Tỉnh\\s+", "")
                .trim();
    }
}