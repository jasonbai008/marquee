/**
 * 纯 JS 走马灯
 * 作者：GPT-5.2 & Jason Bai
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
(function () {
  let uid = 0;

  class Marquee {
    /**
     * @param {string|HTMLElement} target 选择器或元素
     * @param {{speed?:number,gap?:number,direction?:'left'|'right',pauseOnHover?:boolean,autoStart?:boolean}} [options]
     */
    constructor(target, options) {
      /** @type {HTMLElement|null} */
      this.root = typeof target === "string" ? document.querySelector(target) : target;
      if (!this.root) throw new Error("Marquee: target not found");

      this.options = Object.assign(
        {
          speed: 80,
          gap: 16,
          direction: "left",
          pauseOnHover: true,
          autoStart: true,
        },
        options || {},
      );

      this.id = `m${++uid}`;
      this._styleEl = null;
      this._baseCss = "";
      this._keyframesCss = "";
      this._animationName = "";
      this._trackEl = null;
      this._groupEl = null;
      this._cloneEl = null;
      this._resizeObserver = null;
      this._started = false;

      this._onEnter = null;
      this._onLeave = null;

      // 关键：初始化结构（包裹 + 克隆）
      this._mount();

      if (this.options.autoStart) this.start();
    }

    /**
     * 开始/恢复
     */
    start() {
      this._started = true;
      if (this._trackEl) this._trackEl.style.animationPlayState = "running";
    }

    /**
     * 暂停
     */
    stop() {
      this._started = false;
      if (this._trackEl) this._trackEl.style.animationPlayState = "paused";
    }

    /**
     * 重新计算距离与时长
     */
    update() {
      if (!this._trackEl || !this._groupEl) return;

      const speed = Math.max(1, Number(this.options.speed) || 80);
      const gap = Math.max(0, Number(this.options.gap) || 0);

      // 关键：滚动距离 = 第一组内容宽度 + gap
      const groupWidth = this._groupEl.getBoundingClientRect().width;
      const distance = groupWidth + gap;

      if (!distance || !Number.isFinite(distance)) {
        this._trackEl.style.animation = "none";
        return;
      }

      const duration = distance / speed;
      this._animationName = `marquee_${this.id}`;

      // 原来是：const toX = this.options.direction === "right" ? distance : -distance;
      const toX = -distance;

      // 原来 keyframes 不变
      this._keyframesCss = `@keyframes ${this._animationName}{from{transform:translateX(0)}to{transform:translateX(${toX}px)}}`;
      this._renderStyle();

      this._trackEl.style.animation = `${this._animationName} ${duration}s linear infinite`;

      // 新增这一句：向右时反向播放（从 -distance 开始），避免左侧空白
      this._trackEl.style.animationDirection = this.options.direction === "right" ? "reverse" : "normal";

      this._trackEl.style.animationPlayState = this._started ? "running" : "paused";
    }

    /**
     * 销毁并还原 DOM
     */
    destroy() {
      if (this._resizeObserver) this._resizeObserver.disconnect();

      if (this.root && this._groupEl) {
        // 关键：把原内容从 group 搬回 root
        const frag = document.createDocumentFragment();
        while (this._groupEl.firstChild) frag.appendChild(this._groupEl.firstChild);
        this.root.innerHTML = "";
        this.root.appendChild(frag);
        this.root.style.overflow = "";
        delete this.root.dataset.marqueeId;

        if (this._onEnter) this.root.removeEventListener("mouseenter", this._onEnter);
        if (this._onLeave) this.root.removeEventListener("mouseleave", this._onLeave);
      }

      if (this._styleEl && this._styleEl.parentNode) this._styleEl.parentNode.removeChild(this._styleEl);

      this._styleEl = null;
      this._trackEl = null;
      this._groupEl = null;
      this._cloneEl = null;
      this._resizeObserver = null;
      this._started = false;
      this._onEnter = null;
      this._onLeave = null;
    }

    _mount() {
      const root = this.root;

      root.dataset.marqueeId = this.id;

      // 关键：root 作为 viewport，隐藏溢出
      root.style.overflow = "hidden";

      const track = document.createElement("div");
      track.className = "js-marquee-track";

      const group = document.createElement("div");
      group.className = "js-marquee-group";

      // 关键：把原来的子节点整体搬到 group 内
      while (root.firstChild) group.appendChild(root.firstChild);

      // 关键：clone 一份 group，形成两组相同内容
      const clone = group.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");

      track.append(group, clone);
      root.appendChild(track);

      this._trackEl = track;
      this._groupEl = group;
      this._cloneEl = clone;

      this._baseCss = [
        `[data-marquee-id="${this.id}"]{position:relative}`,
        `[data-marquee-id="${this.id}"] .js-marquee-track{display:flex;width:max-content;will-change:transform}`,
        `[data-marquee-id="${this.id}"] .js-marquee-group{display:flex;align-items:center;white-space:nowrap}`,
      ].join("");

      this._applyGap();
      this._renderStyle();
      this._bindHover();
      this._bindResize();

      requestAnimationFrame(() => this.update());
    }

    _applyGap() {
      const gap = Math.max(0, Number(this.options.gap) || 0);
      if (this._trackEl) this._trackEl.style.gap = `${gap}px`;
      if (this._groupEl) this._groupEl.style.gap = `${gap}px`;
      if (this._cloneEl) this._cloneEl.style.gap = `${gap}px`;
    }

    _bindHover() {
      if (!this.options.pauseOnHover || !this.root || !this._trackEl) return;

      const track = this._trackEl;

      this._onEnter = () => {
        // 关键：悬停暂停
        track.style.animationPlayState = "paused";
      };
      this._onLeave = () => {
        track.style.animationPlayState = this._started ? "running" : "paused";
      };

      this.root.addEventListener("mouseenter", this._onEnter);
      this.root.addEventListener("mouseleave", this._onLeave);
    }

    _bindResize() {
      if (!("ResizeObserver" in window) || !this.root) return;
      this._resizeObserver = new ResizeObserver(() => this.update());
      this._resizeObserver.observe(this.root);
    }

    _renderStyle() {
      if (!this._styleEl) {
        this._styleEl = document.createElement("style");
        this._styleEl.setAttribute("data-marquee-style", this.id);
        document.head.appendChild(this._styleEl);
      }
      // 关键：基础样式 + keyframes 一起写入，保证不互相覆盖
      this._styleEl.textContent = (this._baseCss || "") + (this._keyframesCss || "");
    }
  }

  window.Marquee = Marquee;
})();
