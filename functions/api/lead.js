function safeText(str, maxLength = 255) {
  if (!str || typeof str !== 'string') return ''
  return str.trim().slice(0, maxLength)
}

export async function onRequestPost(context) {
  const { request } = context
  
  if (request.headers.get('content-type') !== 'application/json') {
    return new Response(JSON.stringify({ error: 'Content-Type must be application/json' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  let body
  try {
    body = await request.json()
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const company = safeText(body.company)
  const contactName = safeText(body.contactName)
  const phone = safeText(body.phone)
  const requirement = safeText(body.requirement)
  const source = safeText(body.source)
  const submittedAt = safeText(body.submittedAt)

  if (!phone) {
    return new Response(JSON.stringify({ error: 'Phone is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const ip = request.headers.get('cf-connecting-ip') || 
             request.headers.get('x-forwarded-for')?.split(',')[0] ||
             'Unknown'
  const userAgent = request.headers.get('user-agent') || 'Unknown'
  const referer = request.headers.get('referer') || 'Direct'

  const message = `【官网新留言通知】
企业名称：${company || '未填写'}
联系人：${contactName || '未填写'}
联系电话：${phone}
对接需求：${requirement || '未填写'}
来源页面：${source || '未填写'}
提交时间：${submittedAt || '未填写'}
访客 IP：${ip}
Referer：${referer}`

  const webhookUrl = context.env?.WECOM_WEBHOOK_URL
  
  // If no webhook configured, log and continue (for development/testing)
  if (!webhookUrl) {
    console.log('No WECOM_WEBHOOK_URL configured, skipping notification')
    console.log('Lead data:', { company, contactName, phone, requirement, source })
  } else {
    try {
      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          msgtype: 'text',
          text: { content: message }
        })
      })

      if (!webhookResponse.ok) {
        console.error('Webhook failed:', await webhookResponse.text())
      } else {
        console.log('Webhook sent successfully')
      }
    } catch (error) {
      console.error('Webhook error:', error)
    }
  }

  return new Response(JSON.stringify({ success: true, message: '提交成功' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}