# 云飞互联企业官网开发设计文档

## 项目概述

为云飞互联打造一套完整的双语企业官网，包含首页、案例体系、表单提交系统、SEO优化等完整功能，部署于 Cloudflare Pages。

## 项目信息

- **域名：** www.oxyz.asia
- **联系电话：** 13739185304
- **二维码：** docs/云飞企微.QRCODE.jpg
- **部署平台：** Cloudflare Pages

## 项目结构

```
src/
├── index.html                      # 中文首页
├── en.html                         # 英文首页
├── cases.html                      # 案例列表页
├── cases-tea-chain.html            # 案例：连锁茶饮
├── cases-scenic-ticketing.html     # 案例：景区票务
├── cases-youzan-kingdee.html       # 案例：有赞对接金蝶
├── cases-inbala-inventory.html     # 案例：银豹库存同步
├── cases-bank-reconciliation.html  # 案例：银企直连
├── thanks.html                     # 提交成功页
├── 404.html                        # 404页面
├── robots.txt                      # SEO配置
├── sitemap.xml                     # 站点地图
├── _headers                        # Cloudflare安全头
├── _redirects                      # URL重定向规则
└── functions/
    └── api/
        └── lead.js                 # 表单提交API
```

## 功能模块

### 1. 首页模块

#### 中文首页 (index.html)
- 顶部导航栏（Logo + 导航链接 + CTA按钮）
- Hero 区域（标题 + 描述 + 数据指标）
- 对接生态表格
- 定制插件展示
- 技术优势介绍
- 成功案例摘要
- 服务流程时间线
- 联系表单 + 联系信息
- FAQ 模块
- Logo墙
- 页脚

#### 英文首页 (en.html)
- 完整翻译版本
- 保持中文版所有模块
- 适配英文表达习惯

### 2. 案例体系

#### 案例列表页 (cases.html)
- 展示所有案例入口
- 标签分类
- 响应式卡片布局

#### 案例详情页（5个）
1. **cases-tea-chain.html** - 全国连锁茶饮（300+门店）
   - 关键词：有赞对接、客如云、通联支付、会员同步
   - 成果：会员复购提升35%、对账缩短至15分钟

2. **cases-scenic-ticketing.html** - 华东大型景区集团
   - 关键词：票付通、景区系统、闸机核销
   - 成果：核销效率提升300%、投诉率下降82%

3. **cases-youzan-kingdee.html** - 有赞对接金蝶ERP
   - 关键词：有赞、金蝶、订单同步、库存同步
   - 成果：库存一致性提升99%、人工录单减少70%

4. **cases-inbala-inventory.html** - 银豹POS实时库存同步
   - 关键词：银豹POS、实时库存、多门店
   - 成果：超卖风险下降99%

5. **cases-bank-reconciliation.html** - 银企直连自动对账
   - 关键词：银企直连、自动对账、支付集成
   - 成果：人工核对成本接近归零

### 3. 表单系统

#### 前端表单
- 企业名称
- 联系人
- 电话（必填）
- 对接需求

#### 后端处理 (functions/api/lead.js)
- 接收POST请求
- 数据校验
- 企业微信Webhook通知
- 返回JSON响应

#### 企业微信通知格式
```
【官网新留言通知】
企业名称：xxx
联系人：xxx
联系电话：xxx
对接需求：xxx
来源页面：xxx
提交时间：xxx
访客IP：xxx
```

### 4. SEO配置

#### robots.txt
```
User-agent: *
Allow: /
Sitemap: https://www.oxyz.asia/sitemap.xml
```

#### sitemap.xml
- 首页（优先级1.0）
- 英文首页（优先级0.8）
- 案例列表页（优先级0.8）
- 5个案例详情页（优先级0.7）

#### Meta标签
- Title、Description、Keywords
- Canonical URL
- Open Graph标签
- 多语言alternate链接

### 5. 其他页面

#### thanks.html
- 提交成功提示
- 返回首页按钮
- 查看案例按钮
- 支持中英文切换

#### 404.html
- 友好的404提示
- 返回首页按钮
- 英文站点入口

## 技术规格

### CSS变量
```css
--bg: #07111f
--text: #e8f0fb
--muted: #9db0ca
--primary: #3b82f6
--accent: #22c55e
--radius: 20px
--shadow: 0 24px 80px rgba(0, 0, 0, 0.38)
```

### 响应式断点
- 桌面：> 1100px
- 平板：640px - 1100px
- 手机：< 640px

### 安全头 (_headers)
```
/*
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
  X-XSS-Protection: 1; mode=block
```

## 替换清单

| 位置 | 原值 | 新值 |
|------|------|------|
| 商务热线 | 400-XXX-XXXX | 13739185304 |
| 二维码图片 | CSS占位 | 云飞企微.QRCODE.jpg |
| 域名 | your-domain.com | www.oxyz.asia |
| Canonical URL | 待替换 | https://www.oxyz.asia/ |

## 部署配置

### Cloudflare Pages 设置
- Framework preset: None
- Build command: 留空
- Build output directory: / 或 src
- Root directory: / 或 src

### 环境变量
- `WECOM_WEBHOOK_URL`: 企业微信机器人Webhook地址

## 验收标准

1. 所有页面正常加载，无404错误
2. 表单提交成功，企业微信收到通知
3. 中英文切换正常
4. 移动端显示正常
5. SEO配置正确（sitemap可访问）
6. 联系电话、二维码替换完成

## 后续扩展建议

1. 接入 Cloudflare D1 数据库持久化存储线索
2. 添加百度统计/Google Analytics
3. 增加更多案例详情页
4. 制作英文版案例页面