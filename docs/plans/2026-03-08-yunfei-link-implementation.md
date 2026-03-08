# 云飞互联企业官网实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为云飞互联打造完整的双语企业官网，包含首页、案例体系、表单提交、SEO优化，部署于Cloudflare Pages。

**Architecture:** 纯静态HTML/CSS/JS架构，表单通过Cloudflare Pages Functions处理，企业微信Webhook通知线索。所有页面采用内联样式单文件结构，无需构建工具。

**Tech Stack:** HTML5, CSS3, Vanilla JavaScript, Cloudflare Pages Functions, 企业微信 Webhook

---

## Task 1: 创建项目基础结构

**Files:**
- Create: `functions/api/lead.js`
- Create: `_headers`
- Create: `_redirects`

**Step 1: 创建 functions/api 目录**

```bash
mkdir -p functions/api
```

**Step 2: 创建表单处理函数 functions/api/lead.js**

```javascript
export async function onRequestPost(context) {
  try {
    const request = context.request;
    const contentType = request.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      return json(
        { success: false, message: "Invalid content type. Expected application/json." },
        400
      );
    }

    const data = await request.json();

    const company = safeText(data.company, 120);
    const contactName = safeText(data.contactName, 80);
    const phone = safeText(data.phone, 50);
    const requirement = safeText(data.requirement, 2000);
    const source = safeText(data.source, 200);
    const submittedAt = safeText(data.submittedAt, 80);

    if (!phone) {
      return json({ success: false, message: "Phone is required." }, 400);
    }

    const lead = {
      company,
      contactName,
      phone,
      requirement,
      source,
      submittedAt,
      ip:
        request.headers.get("CF-Connecting-IP") ||
        request.headers.get("x-forwarded-for") ||
        "",
      userAgent: request.headers.get("user-agent") || "",
      referer: request.headers.get("referer") || ""
    };

    console.log("New lead:", JSON.stringify(lead));

    await sendToWeCom(context, lead);

    return json({
      success: true,
      message: "Lead submitted successfully."
    });
  } catch (error) {
    return json(
      {
        success: false,
        message: "Server error.",
        error: error instanceof Error ? error.message : String(error)
      },
      500
    );
  }
}

async function sendToWeCom(context, lead) {
  const webhook =
    context.env.WECOM_WEBHOOK_URL ||
    "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=42c016bd-8c7e-4c8a-979b-df2a439dfe14";

  const content =
`【官网新留言通知】
企业名称：${lead.company || "未填写"}
联系人：${lead.contactName || "未填写"}
联系电话：${lead.phone || "未填写"}
对接需求：${lead.requirement || "未填写"}
来源页面：${lead.source || "未知"}
提交时间：${lead.submittedAt || "未知"}
访客 IP：${lead.ip || "未知"}
Referer：${lead.referer || "无"}`;

  const response = await fetch(webhook, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      msgtype: "text",
      text: {
        content
      }
    })
  });

  const result = await response.text();
  console.log("WeCom webhook response:", result);

  if (!response.ok) {
    throw new Error(`WeCom webhook request failed: ${response.status}`);
  }

  try {
    const parsed = JSON.parse(result);
    if (parsed.errcode !== 0) {
      throw new Error(`WeCom webhook error: ${parsed.errmsg || "unknown error"}`);
    }
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error("Invalid WeCom webhook response.");
  }
}

function safeText(value, maxLength = 255) {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/\r/g, " ")
    .trim()
    .slice(0, maxLength);
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}
```

**Step 3: 创建安全头配置 _headers**

```
/*
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
  X-XSS-Protection: 1; mode=block
```

**Step 4: 创建URL重定向配置 _redirects**

```
/en /en.html 200
```

**Step 5: 提交基础结构**

```bash
git add functions/api/lead.js _headers _redirects
git commit -m "feat: 添加Cloudflare Pages配置和表单API"
```

---

## Task 2: 创建SEO配置文件

**Files:**
- Create: `robots.txt`
- Create: `sitemap.xml`

**Step 1: 创建 robots.txt**

```
User-agent: *
Allow: /

Sitemap: https://www.oxyz.asia/sitemap.xml
```

**Step 2: 创建 sitemap.xml**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.oxyz.asia/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://www.oxyz.asia/en.html</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.oxyz.asia/cases.html</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.oxyz.asia/cases-tea-chain.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://www.oxyz.asia/cases-scenic-ticketing.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://www.oxyz.asia/cases-youzan-kingdee.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://www.oxyz.asia/cases-inbala-inventory.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://www.oxyz.asia/cases-bank-reconciliation.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>
```

**Step 3: 提交SEO配置**

```bash
git add robots.txt sitemap.xml
git commit -m "feat: 添加SEO配置文件"
```

---

## Task 3: 创建中文首页 index.html

**Files:**
- Modify: `index.html`

**Step 1: 替换联系电话**

将 `400-XXX-XXXX` 替换为 `13739185304`

**Step 2: 替换二维码**

将 CSS 占位二维码替换为实际图片：

```html
<img class="qrcode" src="docs/云飞企微.QRCODE.jpg" alt="微信二维码" />
```

**Step 3: 添加表单提交JavaScript**

在 `</body>` 前添加：

```html
<script>
const form = document.querySelector("form");
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitButton = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);

    const payload = {
      company: (formData.get("company") || formData.get("company") || "").toString().trim(),
      contactName: (formData.get("name") || "").toString().trim(),
      phone: (formData.get("phone") || "").toString().trim(),
      requirement: (formData.get("requirement") || "").toString().trim(),
      source: window.location.pathname,
      submittedAt: new Date().toISOString()
    };

    if (!payload.phone) {
      alert("请填写联系电话");
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "提交中...";

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "提交失败");
      }

      window.location.href = "/thanks.html";
    } catch (error) {
      alert(error.message || "提交失败，请稍后再试");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "提交需求，获取免费方案";
    }
  });
}
</script>
```

**Step 4: 给表单输入框添加name属性**

确保每个input有正确的name属性：
- company -> name="company"
- name -> name="name"  
- phone -> name="phone"
- requirement -> name="requirement"

**Step 5: 提交首页更新**

```bash
git add index.html
git commit -m "feat: 更新首页-添加表单提交和联系信息"
```

---

## Task 4: 创建英文首页 en.html

**Files:**
- Create: `en.html`

**Step 1: 创建完整的英文首页**

基于中文首页翻译，关键修改：
- `lang="zh-CN"` -> `lang="en"`
- 标题改为英文
- 内容翻译为英文
- 语言切换指向 `href="/"`
- 联系电话保持 `13739185304`
- 二维码路径 `docs/云飞企微.QRCODE.jpg`

**Step 2: 提交英文首页**

```bash
git add en.html
git commit -m "feat: 创建英文首页"
```

---

## Task 5: 创建案例列表页 cases.html

**Files:**
- Create: `cases.html`

**Step 1: 创建案例列表页**

包含5个案例入口卡片：
1. 全国连锁茶饮
2. 华东大型景区集团
3. 有赞对接金蝶ERP
4. 银豹POS实时库存同步
5. 银企直连自动对账

**Step 2: 提交案例列表页**

```bash
git add cases.html
git commit -m "feat: 创建案例列表页"
```

---

## Task 6: 创建案例详情页（5个）

**Files:**
- Create: `cases-tea-chain.html`
- Create: `cases-scenic-ticketing.html`
- Create: `cases-youzan-kingdee.html`
- Create: `cases-inbala-inventory.html`
- Create: `cases-bank-reconciliation.html`

**Step 1: 创建 cases-tea-chain.html（连锁茶饮案例）**

包含：项目背景、客户挑战、解决方案、交付过程、项目成果、适用企业、CTA

**Step 2: 创建 cases-scenic-ticketing.html（景区票务案例）**

**Step 3: 创建 cases-youzan-kingdee.html（有赞金蝶案例）**

**Step 4: 创建 cases-inbala-inventory.html（银豹库存案例）**

**Step 5: 创建 cases-bank-reconciliation.html（银企直连案例）**

**Step 6: 提交案例详情页**

```bash
git add cases-*.html
git commit -m "feat: 创建5个案例详情页"
```

---

## Task 7: 创建辅助页面

**Files:**
- Create: `thanks.html`
- Create: `404.html`

**Step 1: 创建提交成功页 thanks.html**

- 成功图标
- 成功消息
- 返回首页按钮
- 查看案例按钮
- 支持中英文（通过URL参数 ?lang=en）

**Step 2: 创建404页面 404.html**

- 404提示
- 返回首页按钮
- 英文站点入口

**Step 3: 提交辅助页面**

```bash
git add thanks.html 404.html
git commit -m "feat: 创建感谢页和404页面"
```

---

## Task 8: 最终检查与部署准备

**Step 1: 检查所有文件是否存在**

```bash
ls -la *.html functions/api/*.js *.txt *.xml _*
```

**Step 2: 检查联系电话和二维码**

确认所有页面中：
- 联系电话为 `13739185304`
- 二维码路径为 `docs/云飞企微.QRCODE.jpg`
- 域名为 `www.oxyz.asia`

**Step 3: 最终提交**

```bash
git add -A
git commit -m "feat: 云飞互联企业官网完整版本"
```

---

## 验收清单

- [ ] 所有HTML文件语法正确
- [ ] 表单提交功能正常
- [ ] 企业微信通知正常
- [ ] 联系电话已替换
- [ ] 二维码已替换
- [ ] 域名已配置
- [ ] sitemap.xml可访问
- [ ] robots.txt可访问
- [ ] 响应式布局正常
- [ ] 中英文切换正常