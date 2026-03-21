/*& tenant:'csdsj' */
WITH orgs AS (
  SELECT
    child_org_id
  FROM
    global_platform.org_relation
  WHERE
    org_id = 937920881522536
    AND child_type = 'project'
),
category AS (
  SELECT
    DISTINCT id,
    NAME,
    custome_code,
    material_unit,
    sort_code,
    LEVEL,
    full_id
  FROM
    g_statistic_category
  WHERE
    dict_type = 'mWriteOff'
    AND is_leaf = TRUE
    AND is_removed = FALSE
),
category1 AS (
  SELECT
    a.NAME,
    a.custome_code,
    b.first_level_code,
    a.material_unit,
    a.sort_code
  FROM
    category a
    INNER JOIN (
      SELECT
        id,
        custome_code first_level_code
      FROM
        g_statistic_category
      WHERE
        dict_type = 'mWriteOff'
        AND LEVEL = 1
        AND is_removed = FALSE
    ) b ON substring_index(a.full_id, '|', 1) = cast(b.id AS CHAR)
  GROUP BY
    NAME,
    custome_code,
    material_unit,
    sort_code,
    b.first_level_code
),
mWriteOffStatisticsMonth AS (
  SELECT
    c.custome_code category_code,
    ifnull(m.loss_rate, 0) rational_design
  FROM
    m_reasonable_loss m
    LEFT JOIN category c ON m.category_id = c.id
  WHERE
    m.is_removed = FALSE
),
statistic AS (
  SELECT
    a.material_id,
    b.NAME AS statistic_name,
    b.custome_code,
    b.material_unit,
    b.sort_code,
    a.statistic_id,
    b.full_id,
    ifnull(
      substring_index(
        substring_index(concat(b.full_id, REPEAT('|', 2)), '|', 2),
        '|',
        - 1
      ),
      ''
    ) class_two
  FROM
    g_statistic_category_material a
    INNER JOIN category b ON a.statistic_id = b.id
  WHERE
    a.is_removed = FALSE
),
rWriteClassItem AS (
  SELECT
    deducted_class_code,
    deducted_class_id,
    sum(ch_to_deducted_sum) ch_to_deducted_sum,
    sum(ch_in_deducted_sum) ch_in_deducted_sum,
    sum(subcontract_in_deducted_sum) subcontract_in_deducted_sum,
    sum(subcontract_to_deducted_sum) subcontract_to_deducted_sum,
    sum(ont_account) ont_account,
    sum(within_account_not_pay) within_account_not_pay,
    sum(outof_account_not_pay) outof_account_not_pay,
    sum(account_sum) account_sum
  FROM
    m_write_off_statistics_class_item
  WHERE
    org_id IN (
      SELECT
        child_org_id
      FROM
        orgs
    )
    AND is_removed = FALSE
    AND order_id IN (
      SELECT
        id
      FROM
        m_write_off_statistics
      WHERE
        org_id IN (
          SELECT
            child_org_id
          FROM
            orgs
        )
        AND order_date = '2025-06'
        AND is_submit = TRUE
        AND is_removed = FALSE
    )
  GROUP BY
    deducted_class_code,
    deducted_class_id
),
mWriteOffStatistics AS (
  SELECT
    material_id,
    material_unit,
    ifnull(month_start_inventory, 0) month_start_inventory,
    ifnull(month_receive, 0) month_receive,
    ifnull(main_design_quantity, 0) main_design_quantity,
    ifnull(design_quantity, 0) design_quantity,
    ifnull(up_settlement, 0) up_settlement,
    ifnull(down_settlement, 0) down_settlement,
    ifnull(month_use_quantity, 0) month_use_quantity,
    ifnull(real_loss, 0) real_loss,
    ifnull(super_sum, 0) super_sum,
    ifnull(real_use_sum, 0) real_use_sum,
    ifnull(month_end_inventory, 0) month_end_inventory,
    ifnull(purchase_difference, 0) purchase_difference
  FROM
    m_write_off_statistics_item
  WHERE
    order_id IN (
      SELECT
        id
      FROM
        m_write_off_statistics
      WHERE
        org_id IN (
          SELECT
            child_org_id
          FROM
            orgs
        )
        AND is_submit = TRUE
        AND is_removed = FALSE
        AND order_date = '2025-06'
    )
    AND org_id IN (
      SELECT
        child_org_id
      FROM
        orgs
    )
    AND is_removed = FALSE
),
mWriteOffStatistics2 AS (
  SELECT
    a.material_id,
    a.material_unit,
    ifnull(
      month_start_inventory / ifnull(conversion_factor, 1),
      0
    ) month_start_inventory,
    ifnull(month_receive / ifnull(conversion_factor, 1), 0) month_receive,
    ifnull(
      main_design_quantity / ifnull(conversion_factor, 1),
      0
    ) main_design_quantity,
    ifnull(
      design_quantity / ifnull(conversion_factor, 1),
      0
    ) design_quantity,
    ifnull(up_settlement / ifnull(conversion_factor, 1), 0) up_settlement,
    ifnull(
      down_settlement / ifnull(conversion_factor, 1),
      0
    ) down_settlement,
    ifnull(
      month_use_quantity / ifnull(conversion_factor, 1),
      0
    ) month_use_quantity,
    ifnull(real_loss / ifnull(conversion_factor, 1), 0) real_loss,
    ifnull(super_sum, 0) super_sum,
    ifnull(real_use_sum, 0) real_use_sum,
    ifnull(
      month_end_inventory / ifnull(conversion_factor, 1),
      0
    ) month_end_inventory,
    ifnull(purchase_difference, 0) purchase_difference
  FROM
    mWriteOffStatistics a
    LEFT JOIN statistic b ON a.material_id = b.material_id
    LEFT JOIN (
      SELECT
        statistic_id,
        conversion_unit,
        max(
          CASE
            WHEN conversion_factor = 0 THEN 1
            ELSE conversion_factor
          END
        ) AS conversion_factor
      FROM
        global_mtlp.g_statistic_category_unit
      WHERE
        is_removed = FALSE
        AND statistic_id IN (
          SELECT
            id
          FROM
            category
        )
      GROUP BY
        statistic_id,
        conversion_unit
    ) c ON b.statistic_id = c.statistic_id
    AND a.material_unit = c.conversion_unit
),
result9 AS (
  SELECT
    a.NAME material_name,
    a.custome_code AS category_code,
    a.first_level_code,
    a.material_unit,
    a.sort_code,
    b.class_two,
    cast(
      ifnull(sum(c.month_start_inventory), 0) AS DECIMAL (28, 4)
    ) month_start_inventory,
    cast(
      ifnull(sum(c.month_receive), 0) AS DECIMAL (28, 4)
    ) month_receive,
    cast(
      ifnull(sum(c.main_design_quantity), 0) AS DECIMAL (28, 4)
    ) main_design_quantity,
    cast(
      ifnull(sum(c.design_quantity), 0) AS DECIMAL (28, 4)
    ) design_quantity,
    cast(
      ifnull(sum(c.up_settlement), 0) AS DECIMAL (28, 4)
    ) up_settlement,
    cast(
      ifnull(sum(c.down_settlement), 0) AS DECIMAL (28, 4)
    ) down_settlement,
    cast(
      ifnull(sum(c.month_use_quantity), 0) AS DECIMAL (28, 4)
    ) month_use_quantity,
    cast(ifnull(sum(c.real_loss), 0) AS DECIMAL (28, 4)) real_loss,
    cast(
      ifnull(sum(c.month_end_inventory), 0) AS DECIMAL (28, 4)
    ) month_end_inventory,
    cast(
      ifnull(sum(c.super_sum), 0) / 10000 AS DECIMAL (28, 4)
    ) super_sum,
    cast(
      ifnull(sum(c.real_use_sum), 0) / 10000 AS DECIMAL (28, 4)
    ) real_use_sum,
    cast(
      ifnull(sum(c.purchase_difference), 0) / 10000 AS DECIMAL (28, 4)
    ) purchase_difference
  FROM
    category1 a
    LEFT JOIN statistic b ON a.custome_code = b.custome_code
    LEFT JOIN mWriteOffStatistics2 c ON b.material_id = c.material_id
  GROUP BY
    material_name,
    category_code,
    a.material_unit,
    a.sort_code,
    a.first_level_code,
    b.class_two
),
result8 AS (
  SELECT
    a.*,
    ifnull(ch_to_deducted_sum, 0) ch_to_deducted_sum,
    ifnull(ch_in_deducted_sum, 0) ch_in_deducted_sum,
    ifnull(subcontract_in_deducted_sum, 0) subcontract_in_deducted_sum,
    ifnull(subcontract_to_deducted_sum, 0) subcontract_to_deducted_sum,
    ifnull(ont_account, 0) ont_account,
    ifnull(within_account_not_pay, 0) within_account_not_pay,
    ifnull(outof_account_not_pay, 0) outof_account_not_pay,
    ifnull(account_sum, 0) account_sum
  FROM
    result9 a
    LEFT JOIN rWriteClassItem b ON a.class_two = b.deducted_class_id
),
list1 AS (
  SELECT
    a.*,
    row_number() over (
      PARTITION BY class_two
      ORDER BY
        ch_to_deducted_sum
    ) AS indexrows
  FROM
    result8 a
),
result1 AS (
  SELECT
    a.*,
    CASE
      WHEN indexrows > 1 THEN TRUE
      ELSE FALSE
    END is_state
  FROM
    list1 a
),
result5 AS (
  SELECT
    a.*,
    CASE
      WHEN is_state = TRUE THEN 0
      ELSE ifnull(ch_to_deducted_sum, 0)
    END ch_to_deducted_sum_1,
    CASE
      WHEN is_state = TRUE THEN 0
      ELSE ifnull(ch_in_deducted_sum, 0)
    END ch_in_deducted_sum_1,
    CASE
      WHEN is_state = TRUE THEN 0
      ELSE ifnull(subcontract_in_deducted_sum, 0)
    END subcontract_in_deducted_sum_1,
    CASE
      WHEN is_state = TRUE THEN 0
      ELSE ifnull(subcontract_to_deducted_sum, 0)
    END subcontract_to_deducted_sum_1,
    CASE
      WHEN is_state = TRUE THEN 0
      ELSE ifnull(ont_account, 0)
    END ont_account_1,
    CASE
      WHEN is_state = TRUE THEN 0
      ELSE ifnull(within_account_not_pay, 0)
    END within_account_not_pay_1,
    CASE
      WHEN is_state = TRUE THEN 0
      ELSE ifnull(outof_account_not_pay, 0)
    END outof_account_not_pay_1,
    CASE
      WHEN is_state = TRUE THEN 0
      ELSE ifnull(account_sum, 0)
    END account_sum_1
  FROM
    result1 a
),
result AS (
  SELECT
    material_name,
    category_code,
    first_level_code,
    material_unit,
    sort_code,
    ifnull(month_start_inventory, 0) month_start_inventory,
    ifnull(month_receive, 0) month_receive,
    ifnull(main_design_quantity, 0) main_design_quantity,
    ifnull(design_quantity, 0) design_quantity,
    ifnull(up_settlement, 0) up_settlement,
    ifnull(down_settlement, 0) down_settlement,
    ifnull(month_use_quantity, 0) month_use_quantity,
    ifnull(real_loss, 0) real_loss,
    ifnull(month_end_inventory, 0) month_end_inventory,
    ifnull(super_sum, 0) super_sum,
    ifnull(real_use_sum, 0) real_use_sum,
    ifnull(purchase_difference, 0) purchase_difference,
    ifnull(ch_to_deducted_sum, 0) ch_to_deducted_sum,
    ifnull(ch_in_deducted_sum, 0) ch_in_deducted_sum,
    ifnull(subcontract_in_deducted_sum, 0) subcontract_in_deducted_sum,
    ifnull(subcontract_to_deducted_sum, 0) subcontract_to_deducted_sum,
    ifnull(ont_account, 0) ont_account,
    ifnull(within_account_not_pay, 0) within_account_not_pay,
    ifnull(outof_account_not_pay, 0) outof_account_not_pay,
    ifnull(account_sum, 0) account_sum
  FROM
    result1
  UNION
  ALL
  SELECT
    '总计' material_name,
    '' category_code,
    '' first_level_code,
    '' material_unit,
    999999 AS sort_code,
    ifnull(sum(month_start_inventory), 0) month_start_inventory,
    ifnull(sum(month_receive), 0) month_receive,
    ifnull(sum(main_design_quantity), 0) main_design_quantity,
    ifnull(sum(design_quantity), 0) design_quantity,
    ifnull(sum(up_settlement), 0) up_settlement,
    ifnull(sum(down_settlement), 0) down_settlement,
    ifnull(sum(month_use_quantity), 0) month_use_quantity,
    ifnull(sum(real_loss), 0) real_loss,
    ifnull(sum(month_end_inventory), 0) month_end_inventory,
    ifnull(
      sum(
        CASE
          WHEN first_level_code IN ('mWriteOff_shuini', 'mWriteOff_dicai') THEN 0
          ELSE super_sum
        END
      ),
      0
    ) super_sum,
    ifnull(
      sum(
        CASE
          WHEN first_level_code IN ('mWriteOff_shuini', 'mWriteOff_dicai') THEN 0
          ELSE real_use_sum
        END
      ),
      0
    ) real_use_sum,
    ifnull(
      sum(
        CASE
          WHEN first_level_code IN ('mWriteOff_shuini', 'mWriteOff_dicai') THEN 0
          ELSE purchase_difference
        END
      ),
      0
    ) purchase_difference,
    ifnull(sum(ch_to_deducted_sum_1), 0) ch_to_deducted_sum,
    ifnull(sum(ch_in_deducted_sum_1), 0) ch_in_deducted_sum,
    ifnull(sum(subcontract_in_deducted_sum_1), 0) subcontract_in_deducted_sum,
    ifnull(sum(subcontract_to_deducted_sum_1), 0) subcontract_to_deducted_sum,
    ifnull(sum(ont_account_1), 0) ont_account,
    ifnull(sum(within_account_not_pay_1), 0) within_account_not_pay,
    ifnull(sum(outof_account_not_pay_1), 0) outof_account_not_pay,
    ifnull(sum(account_sum_1), 0) account_sum
  FROM
    result5
)
SELECT
  a.*,
  ifnull(c.rational_design, 0) rational_design,
  cast(
    CASE
      WHEN ifnull(a.main_design_quantity, 0) + ifnull(a.design_quantity, 0) = 0 THEN 0
      ELSE (
        ifnull(a.month_use_quantity, 0) - (
          ifnull(a.main_design_quantity, 0) + ifnull(a.design_quantity, 0)
        )
      ) / (
        ifnull(a.main_design_quantity, 0) + ifnull(a.design_quantity, 0)
      ) * 100
    END AS DECIMAL (28, 2)
  ) design_quantity_save
FROM
  result a
  LEFT JOIN (
    SELECT
      item_remark,
      category_code
    FROM
      m_write_off_statistics_item
    WHERE
      order_id IN (
        SELECT
          id
        FROM
          m_write_off_statistics
        WHERE
          org_id = 937920881522536
          AND is_submit = TRUE
          AND order_date = '2025-06'
          AND is_removed = FALSE
        ORDER BY
          id
        LIMIT
          1
      )
      AND is_removed = FALSE
    GROUP BY
      item_remark,
      category_code
  ) b ON a.category_code = b.category_code
  LEFT JOIN mWriteOffStatisticsMonth c ON a.category_code = c.category_code
ORDER BY
  sort_code
