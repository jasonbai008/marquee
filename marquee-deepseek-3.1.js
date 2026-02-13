class Marquee {
  /**
   * 走马灯构造函数
   * @param {string|HTMLElement} selector - 选择器或DOM元素
   * @param {Object} options - 配置选项
   * @param {number} options.speed - 动画速度（像素/秒）
   * @param {number} options.gap - 内容之间的间距（像素）
   * @param {boolean} options.pauseOnHover - 鼠标悬停时是否暂停
   * @param {string} options.direction - 动画方向（'left' 或 'right'）
   */
  constructor(selector, options = {}) {
    // 合并默认配置
    this.options = {
      speed: 60,
      gap: 10,
      pauseOnHover: true,
      direction: "left",
      ...options,
    };

    // 获取容器元素
    this.container = typeof selector === "string" ? document.querySelector(selector) : selector;

    if (!this.container) {
      throw new Error("Marquee container not found");
    }

    // 初始化状态
    this.isPaused = false;
    this.animationId = null;
    this.position = 0;

    // 初始化走马灯
    this.init();
  }

  /**
   * 初始化走马灯
   */
  init() {
    // 保存原始内容
    const originalContent = this.container.innerHTML;

    // 创建包装器
    this.wrapper = document.createElement("div");
    this.wrapper.style.display = "flex";
    this.wrapper.style.flexWrap = "nowrap";
    this.wrapper.style.whiteSpace = "nowrap";

    // 创建内容组
    this.group = document.createElement("div");
    this.group.style.display = "flex";
    this.group.style.flexWrap = "nowrap";
    this.group.style.whiteSpace = "nowrap";
    this.group.innerHTML = originalContent;

    // 克隆内容组
    this.cloneGroup = this.group.cloneNode(true);

    // 设置间距
    const items = this.group.querySelectorAll("*");
    items.forEach((item) => {
      if (item.style) {
        item.style.marginRight = `${this.options.gap}px`;
      }
    });

    const cloneItems = this.cloneGroup.querySelectorAll("*");
    cloneItems.forEach((item) => {
      if (item.style) {
        item.style.marginRight = `${this.options.gap}px`;
      }
    });

    // 添加到包装器
    this.wrapper.appendChild(this.group);
    this.wrapper.appendChild(this.cloneGroup);

    // 清空容器并添加包装器
    this.container.innerHTML = "";
    this.container.appendChild(this.wrapper);

    // 设置容器样式
    this.container.style.overflow = "hidden";
    this.container.style.position = "relative";

    // 设置包装器样式
    this.wrapper.style.position = "absolute";
    this.wrapper.style.left = "0";
    this.wrapper.style.top = "0";

    // 计算组宽度
    this.groupWidth = this.group.offsetWidth + this.options.gap;

    // 设置鼠标事件
    if (this.options.pauseOnHover) {
      this.container.addEventListener("mouseenter", () => this.pause());
      this.container.addEventListener("mouseleave", () => this.resume());
    }

    // 开始动画
    this.startAnimation();
  }

  /**
   * 开始动画
   */
  startAnimation() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    const animate = () => {
      if (this.isPaused) {
        this.animationId = requestAnimationFrame(animate);
        return;
      }

      // 根据方向更新位置
      if (this.options.direction === "left") {
        this.position -= this.options.speed / 60;
        if (Math.abs(this.position) >= this.groupWidth) {
          this.position += this.groupWidth;
        }
      } else {
        this.position += this.options.speed / 60;
        if (this.position >= 0) {
          this.position -= this.groupWidth;
        }
      }

      // 应用变换
      this.wrapper.style.transform = `translateX(${this.position}px)`;

      this.animationId = requestAnimationFrame(animate);
    };

    animate();
  }

  /**
   * 暂停动画
   */
  pause() {
    this.isPaused = true;
  }

  /**
   * 恢复动画
   */
  resume() {
    this.isPaused = false;
    this.startAnimation();
  }

  /**
   * 销毁走马灯，恢复原始状态
   */
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    if (this.options.pauseOnHover) {
      this.container.removeEventListener("mouseenter", () => this.pause());
      this.container.removeEventListener("mouseleave", () => this.resume());
    }

    // 恢复原始内容
    const originalContent = this.group.innerHTML;
    this.container.innerHTML = originalContent;
    this.container.style.overflow = "";
    this.container.style.position = "";
  }

  /**
   * 更新配置
   * @param {Object} newOptions - 新的配置选项
   */
  updateOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };

    // 重新计算组宽度
    this.groupWidth = this.group.offsetWidth + this.options.gap;

    // 重新开始动画
    this.startAnimation();
  }
}

// 示例用法
/*
const marquee = new Marquee('.marquee', {
  speed: 90,
  gap: 12,
  pauseOnHover: true,
  direction: 'left'
});

// 暂停动画
// marquee.pause();

// 恢复动画
// marquee.resume();

// 更新配置
// marquee.updateOptions({ speed: 120, direction: 'right' });

// 销毁走马灯
// marquee.destroy();
*/
