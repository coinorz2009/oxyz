function safeText(str) {
  if (!str || typeof str !== 'string') return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim()
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
  if (!webhookUrl) {
    console.error('Missing WECOM_WEBHOOK_URL environment variable')
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Server configuration error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    })
  }

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
    }
  } catch (error) {
    console.error('Webhook error:', error)
  }

  return new Response(JSON.stringify({ success: true, message: '提交成功' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}