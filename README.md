# enhance-computeb.com-ui-by-web-crawler

本專案以網站抓取與預渲染，離線化 `computeb.com` 的指定頁面，並提供「乾淨版」與「Clean Plus（低風險 UI 強化）」兩種輸出：

- static_site_clean：完全保留原站設計，只修正離線路徑與根導向
- static_site_clean_plus：在 clean 基礎上，加入不破壞功能的 UI 強化（焦點可視化、捲動陰影、懸浮回頂、影像 lazy 等）

## 使用需求
- Node.js 18+

## 核心指令
```bash
# 1) 抓取 + 預渲染（Puppeteer），輸出到 static_site_prerendered/
npm run scrape

# 2) 產出「乾淨版」：修正路徑/manifest/根導向，輸出到 static_site_clean/
npm run export:clean

# 3) 產出「Clean Plus」：在 clean 基礎上注入低風險 UI 強化
npm run export:clean-plus

# 4) 本機預覽
npx http-server static_site_clean_plus -p 8083
```

## 強化內容（Clean Plus）
- 導覽捲動陰影（視覺層級更清楚）
- 鍵盤/讀屏友善的 `:focus-visible` 樣式
- 主要內容寬度限制（不改 DOM，僅外觀）
- 影像/iframe 響應式、`loading="lazy"`
- 價格清單網格密度與行高微調
- 行動裝置按鈕點擊區域放大
- 適度 dark mode 美化（不動品牌色）
- Skip to content 便捷鏈結
- 回到頂部懸浮按鈕
- 離線路由備援（極少觸發）

## 目標頁面
- 主頁 `/主頁`
- 自選砌機 `/自選砌機`
- 腦細List `/腦細List`
- About Us `/About Us`

## 來源
- `computeb.com`（原站內容版權歸原站所有。本專案僅作技術示範與備援）

---
部署或商用請確保遵循原站條款與法規。


