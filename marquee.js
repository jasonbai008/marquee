/**
 * 纯 JS 走马灯
 * 作者：Claude 4 & Jason Bai
 * 原理：将内容包装在容器中并克隆一份，通过 CSS 动画平移实现无缝滚动
 * 示例：const marquee = new Marquee(".marquee", { speed: 60, gap: 20, pauseOnHover: true })
 *
 * 参数说明：
 * speed: 滚动速度，单位 px/s
 * gap: 内容块之间的间距，单位 px
 * direction: 滚动方向，可选 "left" 或 "right"
 * pauseOnHover: 鼠标悬停时是否暂停
 *
 * 默认配置：
 * speed: 50
 * gap: 0
 * direction: "left"
 * pauseOnHover: false
 */
class Marquee {
  /**
   * 构造函数
   * @param {string|HTMLElement} selector - 选择器或 DOM 元素
   * @param {Object} options - 配置项
   */
  constructor(selector, options = {}) {
    this.element =
      typeof selector === "string"
        ? document.querySelector(selector)
        : selector;
    if (!this.element) return;

    // 生成唯一ID，用于标识样式标签
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

  /**
   * 初始化走马灯 DOM 结构和基础样式
   */
  init() {
    // 设置容器样式，确保内容不溢出并水平排列
    this.element.style.cssText = `
      overflow: hidden;
      white-space: nowrap;
      position: relative;
    `;

    // 创建内容包装器，使用 flex 布局处理间距
    this.wrapper = document.createElement("div");
    this.wrapper.style.cssText = `
      display: inline-flex;
      align-items: center;
      gap: ${this.options.gap}px;
      animation-timing-function: linear;
      animation-iteration-count: infinite;
    `;

    // 保存并清空原始内容
    const originalContent = this.element.innerHTML;
    this.element.innerHTML = "";

    // 创建两组相同的内容以实现无缝衔接
    this.group1 = document.createElement("div");
    this.group1.style.cssText =
      "display: inline-flex; align-items: center; gap: inherit;";
    this.group1.innerHTML = originalContent;

    this.group2 = this.group1.cloneNode(true);

    this.wrapper.appendChild(this.group1);
    this.wrapper.appendChild(this.group2);
    this.element.appendChild(this.wrapper);

    // 启动动画计算
    this.start();

    // 绑定悬停暂停事件
    if (this.options.pauseOnHover) {
      // 获取所有子元素（包括克隆组的）
      const children = [...this.group1.children, ...this.group2.children];

      // 如果有子元素，则绑定事件到单个元素上
      if (children.length > 0) {
        children.forEach((child) => {
          child.addEventListener("mouseenter", () => this.pause());
          child.addEventListener("mouseleave", () => this.resume());
        });
      } else {
        // 如果没有子元素（例如纯文本），则绑定到内容组上，保持基本功能
        this.group1.addEventListener("mouseenter", () => this.pause());
        this.group1.addEventListener("mouseleave", () => this.resume());
        this.group2.addEventListener("mouseenter", () => this.pause());
        this.group2.addEventListener("mouseleave", () => this.resume());
      }
    }
  }

  /**
   * 计算动画参数并注入 CSS 动画
   */
  start() {
    // 动画位移距离为一组内容的宽度加上间距
    const groupWidth = this.group1.offsetWidth + this.options.gap;
    // 根据速度计算动画持续时间
    const duration = groupWidth / this.options.speed;

    const animationName = `${this.id}-${this.options.direction}`;
    // 根据方向生成 keyframes
    const keyframes =
      this.options.direction === "left"
        ? `@keyframes ${animationName} { from { transform: translateX(0); } to { transform: translateX(-${groupWidth}px); } }`
        : `@keyframes ${animationName} { from { transform: translateX(-${groupWidth}px); } to { transform: translateX(0); } }`;

    // 移除旧的样式标签（如果存在）
    const oldStyle = document.getElementById(this.id);
    if (oldStyle) oldStyle.remove();

    // 动态注入 keyframes 样式
    const style = document.createElement("style");
    style.id = this.id;
    style.textContent = keyframes;
    document.head.appendChild(style);

    // 应用动画
    this.wrapper.style.animation = `${animationName} ${duration}s linear infinite`;
  }

  /**
   * 暂停动画
   */
  pause() {
    this.wrapper.style.animationPlayState = "paused";
  }

  /**
   * 恢复动画
   */
  resume() {
    this.wrapper.style.animationPlayState = "running";
  }

  /**
   * 销毁走马灯，清除动画和样式
   */
  destroy() {
    this.wrapper.style.animation = "";
    const style = document.getElementById(this.id);
    if (style) style.remove();
  }
}
