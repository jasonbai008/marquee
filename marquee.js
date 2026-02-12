/**
 * 纯 JS 走马灯
 * 作者：Claude 4 & Jason Bai
 * 原理：把原内容包成一组(group)，再 clone 一份放在后面，动画平移一组的宽度实现无缝循环
 * 示例：const marquee = new Marquee(".marquee", { speed: 90, gap: 12, pauseOnHover: true, direction: "left" })
 *
 * 说明：
 * speed: 动画速度，单位 px/s
 * gap: 项目间距，单位 px
 * direction: 滚动方向，"left" 或 "right"
 * pauseOnHover: 悬停可暂停
 * autoStart: 自动开始
 *
 * 默认值：
 * speed: 80
 * gap: 16
 * direction: "left"
 * pauseOnHover: true
 * autoStart: true
 */
class Marquee {
  constructor(selector, options = {}) {
    this.element =
      typeof selector === "string"
        ? document.querySelector(selector)
        : selector;
    if (!this.element) return;

    // 生成唯一ID
    this.id = "marquee-" + Math.random().toString(36).substr(2, 9);

    this.options = {
      speed: 50,
      gap: 0,
      pauseOnHover: false,
      direction: "left",
      ...options,
    };

    this.init();
  }

  init() {
    // 设置容器样式
    this.element.style.cssText = `
      overflow: hidden;
      white-space: nowrap;
      position: relative;
    `;

    // 创建内容包装器
    this.wrapper = document.createElement("div");
    this.wrapper.style.cssText = `
      display: inline-flex;
      align-items: center;
      gap: ${this.options.gap}px;
      animation-timing-function: linear;
      animation-iteration-count: infinite;
    `;

    // 保存原始内容
    const originalContent = this.element.innerHTML;
    this.element.innerHTML = "";

    // 创建两组内容
    this.group1 = document.createElement("div");
    this.group1.style.cssText =
      "display: inline-flex; align-items: center; gap: inherit;";
    this.group1.innerHTML = originalContent;

    this.group2 = this.group1.cloneNode(true);

    this.wrapper.appendChild(this.group1);
    this.wrapper.appendChild(this.group2);
    this.element.appendChild(this.wrapper);

    // 启动动画
    this.start();

    // 悬停暂停
    if (this.options.pauseOnHover) {
      this.element.addEventListener("mouseenter", () => this.pause());
      this.element.addEventListener("mouseleave", () => this.resume());
    }
  }

  start() {
    const groupWidth = this.group1.offsetWidth + this.options.gap;
    const duration = groupWidth / this.options.speed;

    const animationName = `${this.id}-${this.options.direction}`;
    const keyframes =
      this.options.direction === "left"
        ? `@keyframes ${animationName} { from { transform: translateX(0); } to { transform: translateX(-${groupWidth}px); } }`
        : `@keyframes ${animationName} { from { transform: translateX(-${groupWidth}px); } to { transform: translateX(0); } }`;

    // 移除旧样式
    const oldStyle = document.getElementById(this.id);
    if (oldStyle) oldStyle.remove();

    // 添加新样式
    const style = document.createElement("style");
    style.id = this.id;
    style.textContent = keyframes;
    document.head.appendChild(style);

    this.wrapper.style.animation = `${animationName} ${duration}s linear infinite`;
  }

  pause() {
    this.wrapper.style.animationPlayState = "paused";
  }

  resume() {
    this.wrapper.style.animationPlayState = "running";
  }

  destroy() {
    this.wrapper.style.animation = "";
    const style = document.getElementById(this.id);
    if (style) style.remove();
  }
}
