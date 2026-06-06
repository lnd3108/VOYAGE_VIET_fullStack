package com.voyageviet.backend.common.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@RequiredArgsConstructor
@Slf4j
public class Phase8SchemaMigration implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        addColumnIfMissing("TOURS", "IS_DOMESTIC", "NUMBER(1)");
        addColumnIfMissing("TOURS", "AVG_RATING", "NUMBER(3,1) DEFAULT 0");
        addColumnIfMissing("TOURS", "TOTAL_REVIEWS", "NUMBER(10) DEFAULT 0 NOT NULL");
        addColumnIfMissing("TOURS", "HIGHLIGHT_TAGS", "CLOB");
        addColumnIfMissing("TOURS", "MIN_PRICE", "NUMBER(15,2)");
        addColumnIfMissing("TOUR_IMAGES", "SOURCE_TYPE", "VARCHAR2(30) DEFAULT 'DIRECT_UPLOAD' NOT NULL");
        addColumnIfMissing("TOUR_IMAGES", "MEDIA_ID", "NUMBER(19)");
    }

    private void addColumnIfMissing(String tableName, String columnName, String columnDefinition) {
        if (columnExists(tableName, columnName)) {
            return;
        }

        String sql = "ALTER TABLE " + tableName + " ADD " + columnName + " " + columnDefinition;
        log.info("Applying Phase 8 schema migration: {}", sql);
        jdbcTemplate.execute(sql);
    }

    private boolean columnExists(String tableName, String columnName) {
        Integer count = jdbcTemplate.queryForObject(
                """
                        SELECT COUNT(*)
                        FROM USER_TAB_COLUMNS
                        WHERE TABLE_NAME = ?
                          AND COLUMN_NAME = ?
                        """,
                Integer.class,
                tableName,
                columnName
        );

        return count != null && count > 0;
    }
}
