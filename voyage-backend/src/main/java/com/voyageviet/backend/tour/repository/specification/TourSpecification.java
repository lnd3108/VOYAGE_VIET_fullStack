package com.voyageviet.backend.tour.repository.specification;

import com.voyageviet.backend.category.entity.Category;
import com.voyageviet.backend.destination.entity.Destination;
import com.voyageviet.backend.tour.dto.TourSearchCriteria;
import com.voyageviet.backend.tour.entity.Tour;
import com.voyageviet.backend.tour.entity.TourStatus;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class TourSpecification {

    private TourSpecification() {
    }

    public static Specification<Tour> publicSearch(TourSearchCriteria criteria) {
        return (root, query, criteriaBuilder) -> {
            Join<Tour, Category> category = root.join("category", JoinType.LEFT);
            Join<Tour, Destination> destination = root.join("destination", JoinType.LEFT);

            List<Predicate> predicates = new ArrayList<>();

            predicates.add(criteriaBuilder.equal(root.get("status"), TourStatus.PUBLISHED));

            if (hasText(criteria.keyword())) {
                String keyword = likePattern(criteria.keyword());

                Predicate titleLike = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("title")),
                        keyword
                );

                Predicate slugLike = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("slug")),
                        keyword
                );

                Predicate shortDescriptionLike = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("shortDescription")),
                        keyword
                );

                Predicate categoryNameLike = criteriaBuilder.like(
                        criteriaBuilder.lower(category.get("name")),
                        keyword
                );

                Predicate destinationNameLike = criteriaBuilder.like(
                        criteriaBuilder.lower(destination.get("name")),
                        keyword
                );

                predicates.add(criteriaBuilder.or(
                        titleLike,
                        slugLike,
                        shortDescriptionLike,
                        categoryNameLike,
                        destinationNameLike
                ));
            }

            if (hasText(criteria.categorySlug())) {
                predicates.add(criteriaBuilder.equal(
                        criteriaBuilder.lower(category.get("slug")),
                        criteria.categorySlug().trim().toLowerCase()
                ));
            }

            if (hasText(criteria.destinationSlug())) {
                predicates.add(criteriaBuilder.equal(
                        criteriaBuilder.lower(destination.get("slug")),
                        criteria.destinationSlug().trim().toLowerCase()
                ));
            }

            if (hasText(criteria.region())) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(destination.get("region")),
                        likePattern(criteria.region())
                ));
            }

            if (hasText(criteria.departureLocation())) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("departureLocation")),
                        likePattern(criteria.departureLocation())
                ));
            }

            Expression<BigDecimal> effectivePrice = getEffectivePrice(root, criteriaBuilder);

            if (criteria.minPrice() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                        effectivePrice,
                        criteria.minPrice()
                ));
            }

            if (criteria.maxPrice() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                        effectivePrice,
                        criteria.maxPrice()
                ));
            }

            if (criteria.minDurationDays() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                        root.get("durationDays"),
                        criteria.minDurationDays()
                ));
            }

            if (criteria.maxDurationDays() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                        root.get("durationDays"),
                        criteria.maxDurationDays()
                ));
            }

            if (criteria.people() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                        root.get("availableSeats"),
                        criteria.people()
                ));
            }

            applyOrder(root, query, criteriaBuilder, criteria);

            return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private static void applyOrder(
            Root<Tour> root,
            CriteriaQuery<?> query,
            CriteriaBuilder criteriaBuilder,
            TourSearchCriteria criteria
    ) {
        Class<?> resultType = query.getResultType();

        if (Long.class.equals(resultType) || long.class.equals(resultType)) {
            return;
        }

        String sortBy = hasText(criteria.sortBy())
                ? criteria.sortBy().trim()
                : "createdAt";

        String sortDir = hasText(criteria.sortDir())
                ? criteria.sortDir().trim()
                : "desc";

        Expression<?> sortExpression = switch (sortBy) {
            case "effectivePrice" -> getEffectivePrice(root, criteriaBuilder);
            case "minPrice" -> root.get("minPrice");
            case "originalPrice" -> root.get("originalPrice");
            case "salePrice" -> root.get("salePrice");
            case "durationDays" -> root.get("durationDays");
            case "availableSeats" -> root.get("availableSeats");
            case "id" -> root.get("id");
            default -> root.get("createdAt");
        };

        Order mainOrder = "asc".equalsIgnoreCase(sortDir)
                ? criteriaBuilder.asc(sortExpression)
                : criteriaBuilder.desc(sortExpression);

        query.orderBy(
                mainOrder,
                criteriaBuilder.desc(root.get("id"))
        );
    }

    private static Expression<BigDecimal> getEffectivePrice(
            Root<Tour> root,
            CriteriaBuilder criteriaBuilder
    ) {
        return criteriaBuilder.coalesce(
                root.<BigDecimal>get("minPrice"),
                criteriaBuilder.coalesce(
                        root.<BigDecimal>get("salePrice"),
                        root.<BigDecimal>get("originalPrice")
                )
        );
    }

    private static boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private static String likePattern(String value) {
        return "%" + value.trim().toLowerCase() + "%";
    }
}
