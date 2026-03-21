/*& tenant:'zt21' */
with orgs as (
  select
    child_org_id
  from
    global_platform.org_relation
  where
    org_id = 1759640090842647
    and child_type = 'project'
),
mReceive as (
  select
    org_id,
    supplier_id,
    order_date,
    0 receipts_type,
    ifnull(
      sum(
        case
          when a.service_type * a.order_type > 0 then tax_included_sum
          else - tax_included_sum
        end
      ),
      0
    ) tax_included_sum
  from
    (
      select
        a.order_date,
        a.org_id,
        a.supplier_id,
        a.service_type,
        a.order_type,
        tax_included_sum
      from
        (
          select
            a.id,
            a.order_date,
            a.org_id,
            supplier_id,
            a.service_type,
            a.order_type
          from
            m_receive_order a
            inner join orgs b on a.org_id = b.child_org_id
          where
            a.is_audit = true
            and a.is_removed = false
            and order_date <= '2025-04'
        ) as a
        inner join m_receive_order_item as b on a.id = b.order_id
      where
        b.is_removed = false
    ) a
  where
    a.service_type in (10, -11)
  group by
    org_id,
    supplier_id,
    order_date
),
tReceive as (
  select
    org_id,
    supplier_id,
    order_date,
    ifnull(
      sum(
        case
          when a.service_type * a.order_type > 0 then tax_included_sum
          else - tax_included_sum
        end
      ),
      0
    ) tax_included_sum
  from
    (
      select
        a.order_date,
        a.org_id,
        a.supplier_id,
        a.service_type,
        a.order_type,
        tax_included_sum
      from
        (
          select
            a.id,
            a.order_date,
            a.org_id,
            supplier_id,
            a.service_type,
            a.order_type
          from
            t_receive_order a
            inner join orgs b on a.org_id = b.child_org_id
          where
            a.is_submit = true
            and a.is_removed = false
            and order_date <= '2025-04'
        ) as a
        inner join t_receive_order_item as b on a.id = b.order_id
      where
        b.is_removed = false
    ) a
  where
    a.service_type in (10, -11)
  group by
    org_id,
    supplier_id,
    order_date
),
tSettlement as (
  select
    org_id,
    supplier_id,
    order_date,
    ifnull(sum(tax_included_sum), 0) tax_included_sum
  from
(
      select
        a.order_date,
        a.org_id,
        a.supplier_id,
        tax_included_sum
      from
        (
          select
            a.id,
            a.order_date,
            a.org_id,
            supplier_id
          from
            t_settlement_order a
            inner join orgs b on a.org_id = b.child_org_id
          where
            a.is_submit = true
            and a.is_removed = false
            and order_date <= '2025-04'
        ) as a
        inner join t_settlement_total_item as b on a.id = b.order_id
      where
        b.is_removed = false
    ) a
  group by
    org_id,
    supplier_id,
    order_date
),
receive as (
  select
    order_date,
    supplier_id,
    sum(tax_included_sum) tax_included_sum
  from
    (
      select
        order_date,
        supplier_id,
        tax_included_sum
      from
        mReceive
      where
        1 = 1
      union
      all
      select
        order_date,
        supplier_id,
        tax_included_sum
      from
        tReceive
      union
      all
      select
        order_date,
        supplier_id,
        tax_included_sum
      from
        tSettlement
    ) a
  group by
    order_date,
    supplier_id
),
payment as (
  select
    a.payment_date,
    a.org_id,
    supplier_id,
    sum(payment_sum) payment_sum
  from
    m_payment as a
    inner join orgs b on a.org_id = b.child_org_id
  where
    a.is_audit = true
    and a.is_removed = false
    and payment_date <= '2025-04-25'
  group by
    org_id,
    supplier_id,
    payment_date
),
companys as (
  select
    supplier_id,
    b.supplier_name
  from
    (
      select
        supplier_id
      from
        receive
      union
      select
        supplier_id
      from
        payment
    ) a
    left join (
      select
        id,
        name supplier_name
      from
        global_platform.company
      where
        is_removed = false
      group by
        id,
        supplier_name
    ) b on a.supplier_id = b.id
),
result as (
  select
    companys.*,
    cast(ifnull(curr_rec, 0) / 10000 as decimal(28, 4)) curr_rec,
    cast(ifnull(curr_pay, 0) / 10000 as decimal(28, 4)) curr_pay,
    cast(ifnull(kl_rec, 0) / 10000 as decimal(28, 4)) kl_rec,
    cast(ifnull(kl_pay, 0) / 10000 as decimal(28, 4)) kl_pay
  from
    companys
    left join (
      select
        supplier_id,
        cast(ifnull(sum(tax_included_sum), 0) as decimal(28, 2)) as curr_rec
      from
        receive
      where
        order_date = '2025-04'
      group by
        supplier_id
    ) as a on companys.supplier_id = a.supplier_id
    left join (
      select
        supplier_id,
        cast(ifnull(sum(tax_included_sum), 0) as decimal(28, 2)) as kl_rec
      from
        receive
      group by
        supplier_id
    ) as b on companys.supplier_id = b.supplier_id
    left join (
      select
        supplier_id,
        cast(ifnull(sum(payment_sum), 0) as decimal(28, 2)) as curr_pay
      from
        payment
      where
        payment_date <= '2025-04-25'
        and payment_date >= '2025-03-26'
      group by
        supplier_id
    ) as c on companys.supplier_id = c.supplier_id
    left join (
      select
        supplier_id,
        cast(ifnull(sum(payment_sum), 0) as decimal(28, 2)) as kl_pay
      from
        payment
      group by
        supplier_id
    ) as d on companys.supplier_id = d.supplier_id
),
initialResult as (
  select
    supplier_id,
    supplier_name,
    ifnull(curr_rec, 0) as curr_rec,
    curr_pay,
    ifnull(curr_rec, 0) - ifnull(curr_pay, 0) as curr_not_pay,
    ifnull(kl_rec, 0) as kl_rec,
    kl_pay,
    ifnull(kl_rec, 0) - ifnull(kl_pay, 0) as kl_not_pay,
    cast(
      case
        when ifnull(kl_rec, 0) = 0 then 0
        else kl_pay /(ifnull(kl_rec, 0)) * 100
      end as decimal(28, 2)
    ) payment_rate
  from
    result
)
select
  *
from
  (
    select
      1 type,
      supplier_id,
      supplier_name,
      curr_rec,
      curr_pay,
      curr_not_pay,
      kl_rec,
      kl_pay,
      kl_not_pay,
      payment_rate,
      1 count
    from
      initialResult
    union
    all
    select
      2 type,
      0,
      '合计',
      ifnull(sum(curr_rec), 0) curr_rec,
      ifnull(sum(curr_pay), 0) curr_pay,
      ifnull(sum(curr_not_pay), 0) curr_not_pay,
      ifnull(sum(kl_rec), 0) kl_rec,
      ifnull(sum(kl_pay), 0) kl_pay,
      ifnull(sum(kl_not_pay), 0) kl_not_pay,
      null payment_rate,
      count(supplier_id) count
    from
      initialResult
  ) a
order by
  type,
  payment_rate desc,
  supplier_name
LIMIT
  0, 200
