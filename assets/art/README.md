# 插画素材预留位

首页三张卡片右下角预留了插画位（样式见 `pages/home/home.wxss` 的 `.entry-art`）。
把图片放进本目录，然后在 `pages/home/home.wxml` 对应卡片内插入一行：

```xml
<image class="entry-art" src="/assets/art/ledger.png" mode="aspectFit" aria-hidden="true" />
```

建议规格：

- 格式：PNG（透明底）或 WebP，单张 ≤ 60KB
- 尺寸：256×256 px（按 2x 出图，展示 128rpx）
- 风格：与参考图一致的水墨线描，主墨绿 `#4F7261` / 装饰绿 `#7C9E8A`，点缀印章红 `#C0524A`

建议文件名：`ledger.png`、`meal.png`、`lottery.png`（分别对应记账、用餐、彩券）。

没放图也不会报错，卡片当前只有 SVG 线性图标。
