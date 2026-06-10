-- Destination workflow status + public display flag for VoyageViet.
-- Run manually on Oracle before deploying code that removes ACTIVE/INACTIVE from DestinationStatus.
-- Existing data mapping:
--   ACTIVE   -> STATUS = APPROVED, IS_DISPLAY = 1
--   INACTIVE -> STATUS = APPROVED, IS_DISPLAY = 0

SET DEFINE OFF;

DECLARE
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM USER_TAB_COLUMNS
    WHERE TABLE_NAME = 'DESTINATIONS'
      AND COLUMN_NAME = 'IS_DISPLAY';

    IF v_count = 0 THEN
        EXECUTE IMMEDIATE 'ALTER TABLE DESTINATIONS ADD IS_DISPLAY NUMBER(1) DEFAULT 1 NOT NULL';
    END IF;

    SELECT COUNT(*) INTO v_count
    FROM USER_TAB_COLUMNS
    WHERE TABLE_NAME = 'DESTINATIONS'
      AND COLUMN_NAME = 'NEW_DATA';

    IF v_count = 0 THEN
        EXECUTE IMMEDIATE 'ALTER TABLE DESTINATIONS ADD NEW_DATA CLOB';
    END IF;

    SELECT COUNT(*) INTO v_count
    FROM USER_TAB_COLUMNS
    WHERE TABLE_NAME = 'DESTINATIONS'
      AND COLUMN_NAME = 'REJECT_REASON';

    IF v_count = 0 THEN
        EXECUTE IMMEDIATE 'ALTER TABLE DESTINATIONS ADD REJECT_REASON VARCHAR2(500)';
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
    drop_constraint_if_exists('DESTINATIONS', 'CK_DESTINATIONS_STATUS');
    drop_column_checks('DESTINATIONS', 'STATUS', 'CK_DESTINATIONS_STATUS');

    drop_constraint_if_exists('DESTINATIONS', 'CK_DESTINATIONS_IS_DISPLAY');
    drop_column_checks('DESTINATIONS', 'IS_DISPLAY', 'CK_DESTINATIONS_IS_DISPLAY');
END;
/

UPDATE DESTINATIONS
SET IS_DISPLAY = 1
WHERE STATUS = 'ACTIVE';

UPDATE DESTINATIONS
SET IS_DISPLAY = 0
WHERE STATUS = 'INACTIVE';

UPDATE DESTINATIONS
SET STATUS = 'APPROVED'
WHERE STATUS IN ('ACTIVE', 'INACTIVE');

UPDATE DESTINATIONS
SET IS_DISPLAY = 0
WHERE IS_DISPLAY IS NULL;

ALTER TABLE DESTINATIONS MODIFY IS_DISPLAY DEFAULT 1;

ALTER TABLE DESTINATIONS ADD CONSTRAINT CK_DESTINATIONS_STATUS
CHECK (STATUS IN ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'CANCEL_APPROVE'));

ALTER TABLE DESTINATIONS ADD CONSTRAINT CK_DESTINATIONS_IS_DISPLAY
CHECK (IS_DISPLAY IN (0, 1));

COMMIT;
