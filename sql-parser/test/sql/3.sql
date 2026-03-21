/*& tenant:'chceg' */
with weight_order as(
  -- 收料明细台账
  select
    c.org_id,
    c.org_name,
    c.order_id,
    c.is_rds,
    c.order_date,
    c.order_code,
    c.order_origin,
    c.service_type,
    c.order_type,
    c.receive_type,
    c.rds_id,
    (
      case
        c.order_type
        when -2 then 1
        when 2 then 2
        when -1 then 3
        else 4
      end
    ) sort_order,
    c.is_red as is_red_item_data,
    c.maker,
    c.maker_date,
    c.auditor,
    c.audit_date,
    c.supplier_id,
    c.supplier_name,
    c.settlement_id,
    c.settlement_name,
    c.exit_time,
    c.plate_number,
    c.recorded_date,
    c.sort_order_code,
    d.enter_time,
    ifnull(d.rough_quantity, 0) rough_quantity,
    ifnull(d.tare_quantity, 0) tare_quantity,
    ifnull(
      (
        case
          when c.service_type * c.order_type > 0 then d.auxiliary_net_quantity
          else - d.auxiliary_net_quantity
        end
      ),
      0
    ) weight_auxiliary_net_quantity,
    d.is_affirm,
    d.is_use_ori_net_quantity,
    c.contract_id,
    c.contract_code,
    c.ori_order_id
  from
    (
      select
        org_id,
        org_name,
        id order_id,
        order_date,
        order_code,
        order_origin,
        service_type,
        order_type,
        is_red,
        maker,
        maker_date,
        auditor,
        audit_date,
        is_rds,
        supplier_id,
        supplier_name,
        settlement_id,
        settlement_name,
        exit_time,
        plate_number,
        recorded_date,
        sort_order_code,
        receive_type,
        rds_id,
        ori_order_id,
        contract_id,
        contract_code
      from
        q_receive
      where
        org_id in (
          1129776202125312,
          1358332754541568,
          1358332939638272,
          1468977132803584,
          1468977305129984,
          1468977448694784,
          1468977702723072,
          1476033007156736,
          1476033186583552,
          1633657074340352,
          1677679123118592
        )
        and exit_time >= '2005-01-01 00:00:00'
        and exit_time <= '2025-06-30 23:59:59'
        and service_type in (10, 20, -11, -21)
        and order_origin in(0)
        and order_code like '%%'
        and is_removed = false
        and is_audit = true
    ) c
    left join q_receive_weight d on c.org_id = d.org_id
    and c.order_id = d.id
    and d.org_id in (
      1129776202125312,
      1358332754541568,
      1358332939638272,
      1468977132803584,
      1468977305129984,
      1468977448694784,
      1468977702723072,
      1476033007156736,
      1476033186583552,
      1633657074340352,
      1677679123118592
    )
),
weight_order_affirm as (
  select
    c.org_id,
    c.org_name,
    c.order_id,
    c.is_rds,
    c.order_date,
    c.order_code,
    c.order_origin,
    c.service_type,
    c.order_type,
    c.receive_type,
    c.rds_id,
    (
      case
        c.order_type
        when -2 then 1
        when 2 then 2
        when -1 then 3
        else 4
      end
    ) sort_order,
    c.is_red as is_red_item_data,
    c.maker,
    c.maker_date,
    c.auditor,
    c.audit_date,
    c.supplier_id,
    c.supplier_name,
    c.settlement_id,
    c.settlement_name,
    c.exit_time,
    c.plate_number,
    c.recorded_date,
    c.sort_order_code,
    d.enter_time,
    ifnull(d.rough_quantity, 0) rough_quantity,
    ifnull(d.tare_quantity, 0) tare_quantity,
    ifnull(
      (
        case
          when c.service_type * c.order_type > 0 then d.auxiliary_net_quantity
          else - d.auxiliary_net_quantity
        end
      ),
      0
    ) weight_auxiliary_net_quantity,
    d.is_affirm,
    d.is_use_ori_net_quantity,
    c.contract_id,
    c.contract_code,
    c.ori_order_id
  from
    (
      select
        org_id,
        org_name,
        id order_id,
        order_date,
        order_code,
        order_origin,
        service_type,
        order_type,
        is_red,
        maker,
        maker_date,
        auditor,
        audit_date,
        is_rds,
        supplier_id,
        supplier_name,
        settlement_id,
        settlement_name,
        exit_time,
        plate_number,
        recorded_date,
        sort_order_code,
        receive_type,
        rds_id,
        ori_order_id,
        case
          when ifnull(ori_order_id, '') != '' then true
          when ifnull(ori_order_id, '') = ''
          and is_approved = true
          and approved_state = 1 then true
          when ifnull(ori_order_id, '') = ''
          and is_approved = true
          and approved_state = 0 then true
          else false
        end is_enabled,
        contract_id,
        contract_code
      from
        q_receive
      where
        org_id in (
          1129776202125312,
          1358332754541568,
          1358332939638272,
          1468977132803584,
          1468977305129984,
          1468977448694784,
          1468977702723072,
          1476033007156736,
          1476033186583552,
          1633657074340352,
          1677679123118592
        )
        and exit_time >= '2005-01-01 00:00:00'
        and exit_time <= '2025-06-30 23:59:59'
        and service_type in (10, 20, -11, -21)
        and order_origin in(0)
        and order_code like '%%'
        and is_removed = false
        and order_origin = 0
        and is_audit = false
    ) c
    left join q_receive_weight d on c.org_id = d.org_id
    and c.order_id = d.id
    and d.org_id in (
      1129776202125312,
      1358332754541568,
      1358332939638272,
      1468977132803584,
      1468977305129984,
      1468977448694784,
      1468977702723072,
      1476033007156736,
      1476033186583552,
      1633657074340352,
      1677679123118592
    )
  where
    d.is_affirm = true
    and c.is_enabled = true
),
temp_weight_order as (
  select
    c.org_id,
    c.org_name,
    c.order_id,
    c.is_rds,
    c.order_date,
    c.order_code,
    c.order_origin,
    c.service_type,
    c.order_type,
    c.receive_type,
    c.rds_id,
    (
      case
        c.order_type
        when -2 then 1
        when 2 then 2
        when -1 then 3
        else 4
      end
    ) sort_order,
    c.is_red as is_red_item_data,
    c.maker,
    c.maker_date,
    c.auditor,
    c.audit_date,
    c.supplier_id,
    c.supplier_name,
    c.settlement_id,
    c.settlement_name,
    c.exit_time,
    c.plate_number,
    c.recorded_date,
    c.sort_order_code,
    d.enter_time,
    ifnull(d.rough_quantity, 0) rough_quantity,
    ifnull(d.tare_quantity, 0) tare_quantity,
    ifnull(
      (
        case
          when c.service_type * c.order_type > 0 then d.auxiliary_net_quantity
          else - d.auxiliary_net_quantity
        end
      ),
      0
    ) weight_auxiliary_net_quantity,
    d.is_affirm,
    d.is_use_ori_net_quantity,
    c.contract_id,
    c.contract_code
  from
    (
      select
        org_id,
        org_name,
        id order_id,
        order_date,
        order_code,
        order_origin,
        service_type,
        order_type,
        is_red,
        maker,
        maker_date,
        auditor,
        audit_date,
        false is_rds,
        supplier_id,
        supplier_name,
        settlement_id,
        settlement_name,
        exit_time,
        plate_number,
        recorded_date,
        sort_order_code,
        receive_type,
        0 rds_id,
        contract_id,
        contract_code
      from
        q_receive_temp_data
      where
        org_id in (
          1129776202125312,
          1358332754541568,
          1358332939638272,
          1468977132803584,
          1468977305129984,
          1468977448694784,
          1468977702723072,
          1476033007156736,
          1476033186583552,
          1633657074340352,
          1677679123118592
        ) -- 查询条件处理
        and exit_time >= '2005-01-01 00:00:00'
        and exit_time <= '2025-06-30 23:59:59'
        and service_type in (10, 20, -11, -21)
        and order_origin in(0)
        and order_code like '%%'
        and is_removed = false
    ) c
    left join q_receive_weight d on c.org_id = d.org_id
    and c.order_id = d.id
    and d.org_id in (
      1129776202125312,
      1358332754541568,
      1358332939638272,
      1468977132803584,
      1468977305129984,
      1468977448694784,
      1468977702723072,
      1476033007156736,
      1476033186583552,
      1633657074340352,
      1677679123118592
    )
  where
    d.is_affirm = false
),
temp_data as (
  select
    a.*,
    b.*
  from
    temp_weight_order a
    inner join (
      select
        ori_order_id,
        org_id item_org_id,
        order_id item_order_id,
        order_type item_order_type,
        false item_is_red,
        0 tax_included_price,
        material_id,
        ifnull(material_name, '') material_name,
        ifnull(material_model, '') material_model,
        '' manufacturer,
        '' batch_no,
        storage_place,
        stockbin_full_name,
        '' test_report_no,
        ifnull(deduct_quantity, 0) deduct_quantity,
        ifnull(
          (
            case
              when service_type * order_type > 0 then waybill_weight
              else - waybill_weight
            end
          ),
          0
        ) waybill_weight,
        ifnull(
          (
            case
              when service_type * order_type > 0 then ori_net_quantity
              else - ori_net_quantity
            end
          ),
          0
        ) ori_net_quantity,
        ifnull(
          (
            case
              when service_type * order_type > 0 then main_net_quantity
              else - main_net_quantity
            end
          ),
          0
        ) main_net_quantity,
        ifnull(
          (
            case
              when service_type * order_type > 0 then auxiliary_net_quantity
              else - auxiliary_net_quantity
            end
          ),
          0
        ) auxiliary_net_quantity,
        ifnull(
          (
            case
              when service_type * order_type > 0 then net_quantity
              else - net_quantity
            end
          ),
          0
        ) net_quantity,
        auxiliary_unit,
        false is_marched,
        ifnull(conversion_rate, 1) conversion_rate,
        ifnull(deduct_rate, 0) deduct_rate,
        remark,
        id item_id,
        item_bar_code,
        0 receive_price,
        col_varchar_50_no_01,
        '' detail_remark,
        null is_accounted
      from
        q_receive_more_material_temp_data
      where
        org_id in (
          1129776202125312,
          1358332754541568,
          1358332939638272,
          1468977132803584,
          1468977305129984,
          1468977448694784,
          1468977702723072,
          1476033007156736,
          1476033186583552,
          1633657074340352,
          1677679123118592
        )
        and is_removed = false
        and is_marched = false
        and order_type > 0
        and ori_order_id not in (
          select
            ori_red_id
          from
            q_receive_weight
          where
            org_id in (
              1129776202125312,
              1358332754541568,
              1358332939638272,
              1468977132803584,
              1468977305129984,
              1468977448694784,
              1468977702723072,
              1476033007156736,
              1476033186583552,
              1633657074340352,
              1677679123118592
            )
        )
    ) b on a.org_id = b.item_org_id
    and a.order_id = b.item_order_id
  where
    1 = 1
),
materialDatas as (
  select
    a.*,
    b.*
  from
    (
      select
        *
      from
        weight_order
    ) a
    inner join (
      select
        org_id item_org_id,
        order_id item_order_id,
        order_type item_order_type,
        is_red item_is_red,
        ifnull(tax_included_price, 0) tax_included_price,
        material_id,
        ifnull(material_name, '') material_name,
        ifnull(material_model, '') material_model,
        manufacturer,
        batch_no,
        storage_place,
        stockbin_full_name,
        test_report_no,
        ifnull(deduct_quantity, 0) deduct_quantity,
        ifnull(
          (
            case
              when service_type * order_type > 0 then waybill_weight
              else - waybill_weight
            end
          ),
          0
        ) waybill_weight,
        ifnull(
          (
            case
              when service_type * order_type > 0 then ori_net_quantity
              else - ori_net_quantity
            end
          ),
          0
        ) ori_net_quantity,
        ifnull(
          (
            case
              when service_type * order_type > 0 then main_net_quantity
              else - main_net_quantity
            end
          ),
          0
        ) main_net_quantity,
        ifnull(
          (
            case
              when service_type * order_type > 0 then auxiliary_net_quantity
              else - auxiliary_net_quantity
            end
          ),
          0
        ) auxiliary_net_quantity,
        ifnull(
          (
            case
              when service_type * order_type > 0 then net_quantity
              else - net_quantity
            end
          ),
          0
        ) net_quantity,
        auxiliary_unit,
        true is_marched,
        ifnull(conversion_rate, 1) conversion_rate,
        ifnull(deduct_rate, 0) deduct_rate,
        remark,
        id item_id,
        item_bar_code,
        ifnull(receive_price, 0) receive_price,
        col_varchar_50_no_01,
        detail_remark,
        is_accounted
      from
        q_receive_more_material
      where
        org_id in (
          1129776202125312,
          1358332754541568,
          1358332939638272,
          1468977132803584,
          1468977305129984,
          1468977448694784,
          1468977702723072,
          1476033007156736,
          1476033186583552,
          1633657074340352,
          1677679123118592
        )
        and order_id in (
          select
            id
          from
            q_receive
          where
            org_id in (
              1129776202125312,
              1358332754541568,
              1358332939638272,
              1468977132803584,
              1468977305129984,
              1468977448694784,
              1468977702723072,
              1476033007156736,
              1476033186583552,
              1633657074340352,
              1677679123118592
            )
            and exit_time >= '2005-01-01 00:00:00'
            and exit_time <= '2025-06-30 23:59:59'
        )
        and is_removed = false
        and order_type > 0
        and is_red = false
        and ifnull(ori_order_id, '') not in (
          select
            ori_red_id
          from
            q_receive_weight
          where
            org_id in (
              select
                child_org_id
              from
                global_platform.org_relation
              where
                org_id in (
                  1129776202125312,
                  1358332754541568,
                  1358332939638272,
                  1468977132803584,
                  1468977305129984,
                  1468977448694784,
                  1468977702723072,
                  1476033007156736,
                  1476033186583552,
                  1633657074340352,
                  1677679123118592
                )
                and child_type = 'project'
            )
            and is_removed = false
            and ifnull(ori_red_id, '') != ''
        )
    ) b on a.org_id = b.item_org_id
    and a.order_id = b.item_order_id
  where
    1 = 1
),
materialDatas1 as (
  select
    org_id,
    org_name,
    order_id,
    is_rds,
    order_date,
    order_code,
    order_origin,
    service_type,
    order_type,
    receive_type,
    rds_id,
    sort_order,
    is_red_item_data,
    maker,
    maker_date,
    auditor,
    audit_date,
    supplier_id,
    supplier_name,
    settlement_id,
    settlement_name,
    exit_time,
    plate_number,
    recorded_date,
    sort_order_code,
    enter_time,
    rough_quantity,
    tare_quantity,
    weight_auxiliary_net_quantity,
    is_affirm,
    is_use_ori_net_quantity,
    contract_id,
    contract_code,
    ori_order_id,
    item_org_id,
    item_order_id,
    item_order_type,
    item_is_red,
    tax_included_price,
    material_id,
    manufacturer,
    batch_no,
    storage_place,
    stockbin_full_name,
    test_report_no,
    deduct_quantity,
    cast(ifnull(sum(waybill_weight), 0) as decimal(28, 8)) as waybill_weight,
    cast(ifnull(sum(ori_net_quantity), 0) as decimal(28, 8)) as ori_net_quantity,
    cast(
      ifnull(sum(main_net_quantity), 0) as decimal(28, 8)
    ) as main_net_quantity,
    cast(
      ifnull(sum(auxiliary_net_quantity), 0) as decimal(28, 8)
    ) as auxiliary_net_quantity,
    cast(ifnull(sum(net_quantity), 0) as decimal(28, 8)) as net_quantity,
    auxiliary_unit,
    is_marched,
    conversion_rate,
    deduct_rate,
    remark,
    item_id,
    item_bar_code,
    receive_price,
    col_varchar_50_no_01,
    detail_remark,
    is_accounted
  from
    materialDatas
  where
    order_origin = 0
    and service_type < 0
  GROUP BY
    material_id,
    order_id
),
materialDatas2 as (
  select
    org_id,
    org_name,
    order_id,
    is_rds,
    order_date,
    order_code,
    order_origin,
    service_type,
    order_type,
    receive_type,
    rds_id,
    sort_order,
    is_red_item_data,
    maker,
    maker_date,
    auditor,
    audit_date,
    supplier_id,
    supplier_name,
    settlement_id,
    settlement_name,
    exit_time,
    plate_number,
    recorded_date,
    sort_order_code,
    enter_time,
    rough_quantity,
    tare_quantity,
    weight_auxiliary_net_quantity,
    is_affirm,
    is_use_ori_net_quantity,
    contract_id,
    contract_code,
    ori_order_id,
    item_org_id,
    item_order_id,
    item_order_type,
    item_is_red,
    tax_included_price,
    material_id,
    manufacturer,
    batch_no,
    storage_place,
    stockbin_full_name,
    test_report_no,
    deduct_quantity,
    waybill_weight,
    ori_net_quantity,
    main_net_quantity,
    auxiliary_net_quantity,
    net_quantity,
    auxiliary_unit,
    is_marched,
    conversion_rate,
    deduct_rate,
    remark,
    item_id,
    item_bar_code,
    receive_price,
    col_varchar_50_no_01,
    detail_remark,
    is_accounted
  from
    materialDatas
  where
    NOT (
      order_origin = 0
      AND service_type < 0
    )
),
datas as (
  select
    *
  from
    materialDatas1
  union
  all
  select
    *
  from
    materialDatas2
),
receive_order as (
  -- 收料单据数
  select
    count(*) order_count,
    sum(weight_auxiliary_net_quantity) auxiliary_net_quantity
  from
    (
      select
        distinct org_id,
        order_id,
        weight_auxiliary_net_quantity,
        false is_temp
      from
        datas
      union
      all
      select
        distinct org_id,
        order_id,
        weight_auxiliary_net_quantity,
        true is_temp
      from
        temp_data
    ) a
),
receive_items as (
  -- 收料明细条数 收料数量
  select
    count(*) item_count,
    sum(net_quantity) receive_quantity
  from
    (
      select
        org_id,
        order_id,
        item_id,
        material_id,
        net_quantity,
        false is_temp
      from
        datas
      union
      all
      select
        org_id,
        order_id,
        item_id,
        material_id,
        net_quantity,
        true is_temp
      from
        temp_data
    ) a
),
ori as (
  -- 运单数量
  select
    sum(ori_net_quantity) ori_net_quantity
  from
    (
      select
        org_id,
        order_id,
        item_id,
        material_id,
        ori_net_quantity,
        false is_temp
      from
        datas
      union
      all
      select
        org_id,
        order_id,
        item_id,
        material_id,
        ori_net_quantity,
        true is_temp
      from
        temp_data
    ) a
),
deduct as (
  -- 扣重
  select
    sum(deduct_quantity) deduct_quantity
  from
    (
      select
        org_id,
        order_id,
        item_id,
        material_id,
        deduct_quantity,
        false is_temp
      from
        datas
      union
      all
      select
        org_id,
        order_id,
        item_id,
        material_id,
        deduct_quantity,
        true is_temp
      from
        temp_data
    ) a
)
select
  order_count,
  item_count,
  receive_quantity,
  ori_net_quantity,
  auxiliary_net_quantity,
  deduct_quantity
from
  receive_order,
  receive_items,
  ori,
  deduct
LIMIT
  0, 200
