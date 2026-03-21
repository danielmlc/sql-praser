/*& tenant:'sxlq' */ with publish as (
      select msg_id,effective_time,tenant_id,tenant_name, is_include, case when is_include = 1 then case when locate( "#10001#",	ifnull(tenant_id,"")) > 0 or ifnull(tenant_id,"") ="" then 1 else 0 end
        else case when locate( "#10001#",	ifnull(tenant_id,"")) <= 0 then 1 else 0 end
        end include_num
      from msg_publish )
      SELECT record.id,record.is_agenda,record.is_read,record.template_code,user_id,record.title,
      record.msg_content,record.flag,record.received_object,record.created_at,record.app_url,record.pc_url,record.msg_dispose_result,record.business_data_id
      ,template.msg_type, template.is_need_dispose
      ,publish.effective_time,publish.tenant_id,publish.tenant_name, publish.is_include
      FROM msg_record as record
      left join msg_template template
      on record.template_code = template.code
       left join publish on record.id = publish.msg_id
      where record.is_removed=0 and record.is_status=1
       and ifnull(publish.include_num,1) > 0
        and template.msg_type = "sysmsg" and record.flag = 1   order by created_at desc  limit 1 offset 0
