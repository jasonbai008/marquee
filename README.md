# marquee

一个纯 JavaScript 的无缝滚动走马灯（Marquee）插件。

**核心原理**
- 将原始内容包装在内部容器中。
- 克隆一份相同的内容并追加。
- 通过动态生成的 CSS 动画平移内容，实现无缝循环滚动。

## 模型比较

| 模型         | 代码质量 |
| ------------ | :------: |
| Claude 4     |   最高   |
| Gemini 3     |   不错   |
| Deepseek 3.1 |   一般   |
| GPT 5.2      |   一坨   |

## 快速开始

```html
<!-- 容器内部可以放置任意 HTML 内容 -->
<div class="marquee">
  <span>Apple</span>
  <span>Banana</span>
  <span>Cherry</span>
</div>

<!-- 引入 marquee.js 并初始化 -->
<script src="./marquee.js"></script>
<script>
  const marquee = new Marquee(".marquee", {
    speed: 60,
    gap: 20,
    pauseOnHover: true,
    direction: "left",
  });
</script>
```

## API

### new Marquee(selector, options?)

- `selector`: `string | HTMLElement`，选择器或 DOM 元素。
- `options`: 可选配置项。

**options 参数表**

| 参数         | 类型              | 默认值 | 说明                      |
| ------------ | ----------------- | ------ | ------------------------- |
| speed        | number            | 50     | 滚动速度，单位 px/s       |
| gap          | number            | 0      | 内容块之间的间距，单位 px |
| direction    | "left" \| "right" | "left" | 滚动方向                  |
| pauseOnHover | boolean           | false  | 鼠标悬停时是否自动暂停    |

### marquee.pause()

暂停滚动动画。

### marquee.resume()

恢复滚动动画。

### marquee.destroy()

销毁走马灯实例：
- 停止动画播放。
- 移除动态注入的 `<style>` 样式标签。

## 注意事项

- 容器元素会被自动设置 `overflow: hidden`、`white-space: nowrap` 和 `position: relative`。
- 组件会根据 `direction` 和 `speed` 动态生成 `@keyframes` 并注入到页面 `<head>` 中。
- 每个实例都会生成一个唯一的 ID，用于隔离不同走马灯的动画样式。
