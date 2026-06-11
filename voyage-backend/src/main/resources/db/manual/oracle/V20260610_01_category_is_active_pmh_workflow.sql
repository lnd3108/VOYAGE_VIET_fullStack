-- Category isActive + PMH-style workflow hardening for VoyageViet.
-- Run manually on Oracle after V20260608_01_category_workflow_status_is_display.sql.
-- IS_ACTIVE is business active flag: 1 = active, 0 = inactive.
-- Inactive categories are always forced to IS_DISPLAY = 0.

SET DEFINE OFF;

DECLARE
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM USER_TAB_COLUMNS
    WHERE TABLE_NAME = 'CATEGORIES'
      AND COLUMN_NAME = 'IS_ACTIVE';

    IF v_count = 0 THEN
        EXECUTE IMMEDIATE 'ALTER TABLE CATEGORIES ADD IS_ACTIVE NUMBER(1) DEFAULT 1 NOT NULL';
    END IF;

    SELECT COUNT(*) INTO v_count
    FROM USER_TAB_COLUMNS
    WHERE TABLE_NAME = 'CATEGORIES'
      AND COLUMN_NAME = 'IS_DISPLAY';

    IF v_count = 0 THEN
        EXECUTE IMMEDIATE 'ALTER TABLE CATEGORIES ADD IS_DISPLAY NUMBER(1) DEFAULT 0 NOT NULL';
    END IF;

    SELECT COUNT(*) INTO v_count
    FROM USER_TAB_COLUMNS
    WHERE TABLE_NAME = 'CATEGORIES'
      AND COLUMN_NAME = 'NEW_DATA';

    IF v_count = 0 THEN
        EXECUTE IMMEDIATE 'ALTER TABLE CATEGORIES ADD NEW_DATA CLOB';
    END IF;

    SELECT COUNT(*) INTO v_count
    FROM USER_TAB_COLUMNS
    WHERE TABLE_NAME = 'CATEGORIES'
      AND COLUMN_NAME = 'REJECT_REASON';

    IF v_count = 0 THEN
        EXECUTE IMMEDIATE 'ALTER TABLE CATEGORIES ADD REJECT_REASON VARCHAR2(500)';
    END IF;
END;
/

DECLARE
    PROCEDURE drop_column_checks(p_table VARCHAR2, p_column VARCHAR2, p_keep_name VARCHAR2) IS
    BEGIN
        FOR c IN (
            SELECT DISTINCT uc.constraint_name
            FROM user_constraints uc
            JOIN user_cons_columns ucc ON ucc.constraint_name = uc.constraint_name
            WHERE uc.table_name = UPPER(p_table)
              AND ucc.column_name = UPPER(p_column)
              AND uc.constraint_type = 'C'
              AND uc.constraint_name <> UPPER(p_keep_name)
              AND (uc.search_condition_vc IS NULL OR UPPER(uc.search_condition_vc) NOT LIKE '%' || UPPER(p_column) || '%IS NOT NULL%')
        ) LOOP
            EXECUTE IMMEDIATE 'ALTER TABLE ' || p_table || ' DROP CONSTRAINT ' || c.constraint_name;
        END LOOP;
    END;

    PROCEDURE drop_constraint_if_exists(p_table VARCHAR2, p_name VARCHAR2) IS
        v_count NUMBER;
    BEGIN
        SELECT COUNT(*) INTO v_count
        FROM user_constraints
        WHERE table_name = UPPER(p_table)
          AND constraint_name = UPPER(p_name);

        IF v_count > 0 THEN
            EXECUTE IMMEDIATE 'ALTER TABLE ' || p_table || ' DROP CONSTRAINT ' || p_name;
        END IF;
    END;
BEGIN
    drop_constraint_if_exists('CATEGORIES', 'CK_CATEGORIES_STATUS');
    drop_column_checks('CATEGORIES', 'STATUS', 'CK_CATEGORIES_STATUS');

    drop_constraint_if_exists('CATEGORIES', 'CK_CATEGORIES_IS_DISPLAY');
    drop_column_checks('CATEGORIES', 'IS_DISPLAY', 'CK_CATEGORIES_IS_DISPLAY');

    drop_constraint_if_exists('CATEGORIES', 'CK_CATEGORIES_IS_ACTIVE');
    drop_column_checks('CATEGORIES', 'IS_ACTIVE', 'CK_CATEGORIES_IS_ACTIVE');
END;
/

UPDATE CATEGORIES
SET IS_ACTIVE = 1
WHERE IS_ACTIVE IS NULL;

UPDATE CATEGORIES
SET IS_DISPLAY = 0
WHERE IS_DISPLAY IS NULL
   OR IS_ACTIVE = 0
   OR STATUS <> 'APPROVED';

ALTER TABLE CATEGORIES MODIFY IS_ACTIVE DEFAULT 1;
ALTER TABLE CATEGORIES MODIFY IS_DISPLAY DEFAULT 0;

ALTER TABLE CATEGORIES ADD CONSTRAINT CK_CATEGORIES_STATUS
CHECK (STATUS IN ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'CANCEL_APPROVE'));

ALTER TABLE CATEGORIES ADD CONSTRAINT CK_CATEGORIES_IS_DISPLAY
CHECK (IS_DISPLAY IN (0, 1));

ALTER TABLE CATEGORIES ADD CONSTRAINT CK_CATEGORIES_IS_ACTIVE
CHECK (IS_ACTIVE IN (0, 1));

COMMIT;
