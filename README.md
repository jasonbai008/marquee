# marquee

一个纯 JavaScript 的走马灯（Marquee）实现。

**核心原理**
- 将原始内容包裹成一组（group）
- 复制（clone）同样的一组内容并追加在后面
- 使用 CSS 动画平移一组内容的宽度，实现无缝循环

## 快速开始

```html
<!-- 关键：容器作为 viewport，内部放任意条目 -->
<div class="marquee">
  <span>Apple</span>
  <span>Banana</span>
  <span>Cherry</span>
</div>

<!-- 关键：先引入 marquee.js，再初始化 -->
<script src="./marquee.js"></script>
<script>
  // 关键：创建实例（target 支持选择器或 HTMLElement）
  const marquee = new Marquee(".marquee", {
    speed: 90,
    gap: 12,
    pauseOnHover: true,
    direction: "left",
  });
</script>
```

## API

### new Marquee(target, options?)

- `target`: `string | HTMLElement`，选择器或元素
- `options`: 可选配置项

**options 参数表**

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| speed | number | 80 | 动画速度，单位 px/s（内部会最小限制为 1） |
| gap | number | 16 | 项目间距，单位 px（内部会最小限制为 0） |
| direction | "left" \| "right" | "left" | 滚动方向 |
| pauseOnHover | boolean | true | 鼠标悬停时暂停动画 |
| autoStart | boolean | true | 是否自动开始滚动 |

### marquee.start()

开始或恢复滚动（将动画播放状态设置为 running）。

### marquee.stop()

暂停滚动（将动画播放状态设置为 paused）。

### marquee.update()

重新计算滚动距离与时长（在容器尺寸或内容变化后可手动调用）。

说明：
- 滚动距离 = 第一组内容的宽度 + gap
- 动画时长 = 距离 / speed
- `direction: "right"` 通过 `animation-direction: reverse` 实现反向播放

### marquee.destroy()

销毁实例并尽量还原 DOM：
- 将 group 内的原内容搬回到容器元素
- 移除注入的 `<style>` 与悬停事件
- 断开 `ResizeObserver`（如果存在）

## 行为与注意事项

- 容器元素会被设置 `overflow: hidden`，作为可视窗口（viewport）。
- 组件会自动注入必要的基础样式和 `@keyframes` 到 `document.head`。
- 若浏览器支持 `ResizeObserver`，会在容器尺寸变化时自动触发 `update()`。
