class Marquee {
  constructor(selector, options) {
    this.el = typeof selector === "string" ? document.querySelector(selector) : selector;
    if (!this.el) return;

    this.options = Object.assign(
      {
        speed: 50,
        gap: 20,
        pauseOnHover: true,
        direction: "left",
      },
      options,
    );

    this.offset = 0;
    this.lastTime = performance.now();
    this.paused = false;

    this.init();
  }

  /**
   * 初始化 DOM 结构和事件
   */
  init() {
    // 创建容器
    const track = document.createElement("div");
    track.className = "js-marquee-track";

    // 设置 track 样式
    track.style.display = "flex";
    track.style.width = "max-content";
    track.style.gap = this.options.gap + "px";
    track.style.willChange = "transform"; // 优化性能

    // 创建第一组内容
    const group = document.createElement("div");
    group.className = "js-marquee-group";
    group.style.display = "flex";
    group.style.gap = this.options.gap + "px";

    // 移动原有内容到 group
    while (this.el.firstChild) {
      group.appendChild(this.el.firstChild);
    }

    // 克隆组
    const cloneGroup = group.cloneNode(true);
    cloneGroup.setAttribute("aria-hidden", "true"); // 辅助功能

    // 组装 DOM
    track.appendChild(group);
    track.appendChild(cloneGroup);
    this.el.appendChild(track);

    // 设置 el 样式
    this.el.style.overflow = "hidden";
    // 为了配合 index.html 的 CSS 选择器 [data-marquee-id]
    if (!this.el.hasAttribute("data-marquee-id")) {
      this.el.setAttribute("data-marquee-id", Math.random().toString(36).substring(2));
    }

    this.track = track;
    this.group = group;

    // 计算尺寸
    this.updateMetrics();
    window.addEventListener("resize", () => this.updateMetrics());

    // 绑定事件
    if (this.options.pauseOnHover) {
      this.el.addEventListener("mouseenter", () => (this.paused = true));
      this.el.addEventListener("mouseleave", () => {
        this.paused = false;
        this.lastTime = performance.now();
        this.animate();
      });
    }

    // 初始位置设置
    if (this.options.direction === "right") {
      // 向右滚动，初始位置设为负的一组宽度
      this.offset = -this.contentWidth;
    }

    // 开始动画
    this.animate();
  }

  /**
   * 更新尺寸信息
   */
  updateMetrics() {
    // 计算一组内容的宽度 + gap
    const groupRect = this.group.getBoundingClientRect();
    this.contentWidth = groupRect.width + this.options.gap;

    // 如果方向是 right，且 offset 还没初始化好，重置一下
    // 但为了避免跳跃，尽量只更新 contentWidth
  }

  /**
   * 动画循环
   */
  animate() {
    if (this.paused) return;

    const now = performance.now();
    const dt = (now - this.lastTime) / 1000;
    this.lastTime = now;

    // 如果页面切后台，dt 可能会很大，导致跳跃。限制最大 dt。
    const safeDt = Math.min(dt, 0.1);

    const move = this.options.speed * safeDt;

    if (this.options.direction === "left") {
      this.offset -= move;
      // 当移动超过一组宽度时，重置
      if (Math.abs(this.offset) >= this.contentWidth) {
        this.offset += this.contentWidth;
      }
    } else {
      this.offset += move;
      // 当移动到 0 时，重置为负的一组宽度
      if (this.offset >= 0) {
        this.offset -= this.contentWidth;
      }
    }

    this.track.style.transform = `translate3d(${this.offset}px, 0, 0)`;

    requestAnimationFrame(() => this.animate());
  }
}
