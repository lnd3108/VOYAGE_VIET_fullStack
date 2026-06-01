package com.voyageviet.backend.common.paging;

import lombok.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;

import java.util.List;
import java.util.function.Function;
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageResponse<T> {

    private List<T> content;

    private int page;
    private int size;
    private long totalElements;
    private int totalPages;

    private boolean first;
    private boolean last;
    private boolean empty;

    private String sortBy;
    private String sortDir;

    public static <E, R> PageResponse<R> from(Page<E> pageData, Function<E, R> mapper) {
        String sortBy = null;
        String sortDir = null;

        if (pageData.getSort().isSorted()) {
            Sort.Order order = pageData.getSort().iterator().next();
            sortBy = order.getProperty();
            sortDir = order.getDirection().name().toLowerCase();
        }

        return PageResponse.<R>builder()
                .content(pageData.getContent().stream().map(mapper).toList())
                .page(pageData.getNumber())
                .size(pageData.getSize())
                .totalElements(pageData.getTotalElements())
                .totalPages(pageData.getTotalPages())
                .first(pageData.isFirst())
                .last(pageData.isLast())
                .empty(pageData.isEmpty())
                .sortBy(sortBy)
                .sortDir(sortDir)
                .build();
    }
}
