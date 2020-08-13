+(function (w) {
  w.test = {};
  w.test.css = function (node, type, val) {
    if (typeof node === "object" && typeof node["transform"] === "undefined") {
      node["transform"] = {};
    }
    if (arguments.length >= 3) {
      // 设置
      var text = "";
      node["transform"][type] = val;
      for (item in node["transform"]) {
        if (node["transform"].hasOwnProperty(item)) {
          switch (item) {
            case "translateX":
            case "translateY":
            case "translateZ":
              text += item + "(" + node["transform"][item] + "px)";
              break;
            case "scale":
              text += item + "(" + node["transform"][item] + ")";
              break;
            case "rotate":
              text += item + "(" + node["transform"][item] + "deg)";
              break;
          }
        }
      }
      node.style.transform = node.style.webkitTransform = text;
    } else if (arguments.length == 2) {
      // 读取
      val = node["transform"][type];
      if (typeof val === "undefined") {
        switch (type) {
          case "translateX":
          case "translateY":
          case "rotate":
            val = 0;
            break;
          case "scale":
            val = 1;
            break;
        }
      }
      return val;
    }
  }

  w.test.carousel = function (arr) {
    // 布局
    var carouselWrap = document.querySelector(".carousel-wrap");
    if (carouselWrap) {
      var pointslength = arr.length;
      // 无缝
      var needCarousel = carouselWrap.getAttribute("needCarousel");
      needCarousel = needCarousel == null ? false : true;
      if (needCarousel) {
        arr = arr.concat(arr);
      }
      var ulNode = document.createElement("ul");
      test.css(ulNode, "translateZ", 0);
      var styleNode = document.createElement("style");
      ulNode.classList.add("list");
      for (var i = 0; i < arr.length; i++) {
        ulNode.innerHTML += '<li><a href="javascript:;"><img src="' + arr[i] + '"/></a></li>';
      }
      styleNode.innerHTML = ".carousel-wrap > .list > li{width: " + (1 / arr.length * 100) + "%;}.carousel-wrap > .list{width: " + arr.length + "00%}";
      carouselWrap.appendChild(ulNode);
      document.head.appendChild(styleNode);
      var imgNodes = document.querySelector(".carousel-wrap > .list > li > a >img");
      setTimeout(function () {
        carouselWrap.style.height = imgNodes.offsetHeight + "px";
      }, 100)
      var pointsWrap = document.querySelector(".carousel-wrap > .points-wrap");
      if (pointsWrap) {
        for (var i = 0; i < pointslength; i++) {
          if (i == 0) {
            pointsWrap.innerHTML += '<span class="active"></span>';
          } else {
            pointsWrap.innerHTML += '<span></span>';
          }
        }
        var pointsSpan = document.querySelectorAll(".carousel-wrap > .points-wrap > span");
      }

      /* 滑屏
       * 1.获取元素一开始的位置
       * 2.获取手指一开始点击的位置
       * 3.获取手指move的实时距离
       * 4.将手指移动的距离加给元素
       * */
      /*
       * 防抖动
       * 1.判断用户首次滑屏的方向
       * 2.如果是x轴则以后不管用户怎么滑都会抖动
       * 3.如果是y轴则以后不管用户怎么滑都不会抖动
       * */
      var index = 0;
      // 手指一开始的位置
      var startX = 0;
      var startY = 0;
      // 元素一开始的位置
      var elementX = 0;
      var elementY = 0;
      // 首次滑屏的方向
      var isX = true;
      var isFirst = true;

      carouselWrap.addEventListener("touchstart", function (ev) {
        ev = ev || event;
        var TouchC = ev.changedTouches[0];
        ulNode.style.transition = "none";
        // 无缝
        if (needCarousel) {
          var index = test.css(ulNode, "translateX") / document.documentElement.clientWidth;
          if (-index === 0) {
            index = -pointslength;
          } else if (-index == (arr.length - 1)) {
            index = -(pointslength - 1)
          }
          test.css(ulNode, "translateX", index * document.documentElement.clientWidth)
        }
        startX = TouchC.clientX;
        startY = TouchC.clientY;
        elementX = test.css(ulNode, "translateX");
        elementY = test.css(ulNode, "translateY");
        // 清除定时器
        clearInterval(timer);
        isX = true;
        isFirst = true;
      })

      carouselWrap.addEventListener("touchmove", function (ev) {
        // 二次以后的防抖动
        if (!isX) {
          // 获取
          return;
        }
        ev = ev || event;
        var TouchC = ev.changedTouches[0];
        var nowX = TouchC.clientX;
        var nowY = TouchC.clientY;
        var disX = nowX - startX;
        var disY = nowY - startY;
        // 首次判断用户的滑动方向
        if (isFirst) {
          isFirst = false;
          // 判断用户的滑动方向
          // x则放行，y则首次获取并且下次也获取
          if (Math.abs(disY) > Math.abs(disX)) {
            // y轴上滑
            isX = false;
            // 首次防抖动
            return;
          }
        }
        test.css(ulNode, "translateX", elementX + disX);
      })

      carouselWrap.addEventListener("touchend", function (ev) {
        ev = ev || event;
        index = test.css(ulNode, "translateX") / document.documentElement.clientWidth;
        index = Math.round(index);
        if (index > 0) {
          index = 0;
        } else if (index < 1 - arr.length) {
          index = 1 - arr.length;
        }
        littlePoint(index);
        ulNode.style.transition = ".5s transform";
        test.css(ulNode, "translateX", index * (document.documentElement.clientWidth));
        if (needAuto) {
          auto();
        }
      })

      // 自动轮播
      var timer = 0;
      var needAuto = carouselWrap.getAttribute("needAuto");
      needAuto = needAuto == null ? false : true;
      if (needAuto) {
        auto();
      }

      function auto() {
        clearInterval(timer);
        timer = setInterval(function () {
          if (index == 1 - arr.length) {
            ulNode.style.transition = "none";
            index = 1 - arr.length / 2;
            test.css(ulNode, "translateX", index * document.documentElement.clientWidth);
          }
          setTimeout(function () {
            index--;
            ulNode.style.transition = "1s transform";
            littlePoint(index);
            test.css(ulNode, "translateX", index * document.documentElement.clientWidth);
          }, 50)
        }, 2000)
      }

      function littlePoint(index) {
        if (!pointsWrap) {
          return;
        }
        for (var i = 0; i < pointsSpan.length; i++) {
          pointsSpan[i].classList.remove("active");
        }
        pointsSpan[-index % pointslength].classList.add("active");
      }
    }
  }

  w.test.dragNav = function () {
    // 滑屏区域
    var wrap = document.querySelector(".test-nav-drag-wrapper");
    // 滑屏元素
    var item = document.querySelector(".test-nav-drag-wrapper .list");
    // 元素一开始的位置和手指一开始的位置
    var startX = 0;
    var elementX = 0;
    var minX = wrap.clientWidth - item.offsetWidth;
    // 快速滑屏的必要参数
    var lastTime = 0;
    var lastPoint = 0;
    var timeDis = 1;
    var pointDis = 0;

    wrap.addEventListener("touchstart", function (ev) {
      ev = ev || event;
      var touchC = ev.changedTouches[0];
      startX = touchC.clientX;
      elementX = test.css(item, "translateX");
      item.style.transition = "none";
      lastTime = new Date().getTime();
      lastPoint = touchC.clientX;
      // 清除速度的残留
      pointDis = 0;
      item.handMove = false;
    })

    wrap.addEventListener("touchmove", function (ev) {
      ev = ev || event;
      var touchC = ev.changedTouches[0];
      var nowX = touchC.clientX;
      var disX = nowX - startX;
      var translateX = elementX + disX;
      var nowTime = new Date().getTime();
      var nowPoint = touchC.clientX;
      timeDis = nowTime - lastTime;
      pointDis = nowPoint - lastPoint;
      lastTime = nowTime;
      lastPoint = nowPoint;
      // 手动橡皮筋效果，在move的过程中每一次手指touchmove真正的有效距离慢慢变小，元素的滑动距离还是在变大
      if (translateX > 0) {
        item.handMove = true;
        var scale = document.documentElement.clientWidth / ((document.documentElement.clientWidth + translateX) * 1.5);
        translateX = test.css(item, "translateX") + pointDis * scale;
      } else if (translateX < minX) {
        item.handMove = true;
        var over = minX - translateX;
        var scale = document.documentElement.clientWidth / ((document.documentElement.clientWidth + over) * 1.5);
        translateX = test.css(item, "translateX") + pointDis * scale;
      }
      test.css(item, "translateX", translateX);
    })

    wrap.addEventListener("touchend", function (ev) {
      var translateX = test.css(item, "translateX");
      if (!item.handMove) {
        // 快速滑屏，速度越大位移越远
        var speed = pointDis / timeDis;
        speed = Math.abs(speed) < 0.5 ? 0 : speed;
        var targetX = translateX + speed * 200;
        var time = Math.abs(speed) * 0.2;
        time = time < 0.8 ? 0.8 : time;
        time = time > 2 ? 2 : time;
        // 快速滑屏的橡皮筋效果
        var bsr = "";
        if (targetX > 0) {
          targetX = 0;
          bsr = "cubic-bezier(.26,1.51,.68,1.54)";
        } else if (targetX < minX) {
          targetX = minX;
          bsr = "cubic-bezier(.26,1.51,.68,1.54)";
        }
        item.style.transition = time + "s " + bsr + " transform";
        test.css(item, "translateX", targetX);
      } else {
        // 手动橡皮筋效果
        item.style.transition = "1s transform";
        if (translateX > 0) {
          translateX = 0;
          test.css(item, "translateX", translateX);
        } else if (translateX < minX) {
          translateX = minX;
          test.css(item, "translateX", translateX);
        }
      }
    })
  }

  // 防抖动&即点即停
  /*
   * transiton的问题
   * 1.元素没有渲染完成时无法触发过渡
   * 2.在transform切换下，如果前后transform属性值、变换函数的位置个数不一样无法触发过渡
   * 3.没有办法拿到transition中任何一帧的状态
   * 4.Tween算法
   * */
  w.test.vMove = function (wrap, callBack) {
    // 滑屏区域
    // 滑屏元素
    var item = wrap.children[0];
    test.css(item, "translateZ", 0.1);
    // 元素一开始的位置和手指一开始的位置
    var start = {};
    var element = {};
    var minY = wrap.clientHeight - item.offsetHeight;
    // 快速滑屏的必要参数
    var lastTime = 0;
    var lastPoint = 0;
    var timeDis = 1;
    var pointDis = 0;
    var isY = true;
    var isFirst = true;
    // 即点即停
    var cleartime = 0;
    var Tween = {
      Linear: function (t, b, c, d) {
        return c * t / d + b;
      },
      back: function (t, b, c, d, s) {
        if (s == undefined) s = 1.70158;
        return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
      }
    }

    wrap.addEventListener("touchstart", function (ev) {
      ev = ev || event;
      var touchC = ev.changedTouches[0];
      // 重置minY
      minY = wrap.clientHeight - item.offsetHeight;
      start = {clientX: touchC.clientX, clientY: touchC.clientY};
      element.y = test.css(item, "translateY");
      element.x = test.css(item, "translateX");
      item.style.transition = "none";
      lastTime = new Date().getTime();
      lastPoint = touchC.clientY;
      // 清除速度的残留
      pointDis = 0;
      item.handMove = false;
      isY = true;
      isFirst = true;
      // 即点即停
      clearInterval(cleartime);
      if (callBack && typeof callBack["start"] === "function") {
        callBack["start"].call(item);
      }
    })

    wrap.addEventListener("touchmove", function (ev) {
      if (!isY) {
        return;
      }
      ev = ev || event;
      var touchC = ev.changedTouches[0];
      var now = touchC;
      var dis = {};
      dis.y = now.clientY - start.clientY;
      dis.x = now.clientX - start.clientX;
      var translateY = element.y + dis.y;
      if (isFirst) {
        isFirst = false;
        if (Math.abs(dis.x) > Math.abs(dis.y)) {
          isY = false;
          return;
        }
      }
      var nowTime = new Date().getTime();
      var nowPoint = touchC.clientY;
      timeDis = nowTime - lastTime;
      pointDis = nowPoint - lastPoint;
      lastTime = nowTime;
      lastPoint = nowPoint;
      // 手动橡皮筋效果
      if (translateY > 0) {
        item.handMove = true;
        var scale = document.documentElement.clientHeight / ((document.documentElement.clientHeight + translateY) * 1.5);
        translateY = test.css(item, "translateY") + pointDis * scale;
      } else if (translateY < minY) {
        item.handMove = true;
        var over = minY - translateY;
        var scale = document.documentElement.clientHeight / ((document.documentElement.clientHeight + over) * 1.5);
        translateY = test.css(item, "translateY") + pointDis * scale;
      }
      test.css(item, "translateY", translateY);
      if (callBack && typeof callBack["move"] === "function") {
        callBack["move"].call(item);
      }
    })

    wrap.addEventListener("touchend", function (ev) {
      var translateY = test.css(item, "translateY");
      if (!item.handMove) {
        // 快速滑屏，速度越大位移越远
        var speed = pointDis / timeDis;
        speed = Math.abs(speed) < 0.5 ? 0 : speed;
        var targetY = translateY + speed * 200;
        var time = Math.abs(speed) * 0.2;
        time = time < 0.8 ? 0.8 : time;
        time = time > 2 ? 2 : time;
        // 快速滑屏的橡皮筋效果
        var type = "Linear";
        if (targetY > 0) {
          targetY = 0;
          type = "back";
        } else if (targetY < minY) {
          targetY = minY;
          type = "back";
        }
        bsr(type, targetY, time);
      } else {
        // 手动橡皮筋效果
        item.style.transition = "1s transform";
        if (translateY > 0) {
          translateY = 0;
          test.css(item, "translateY", translateY);
        } else if (translateY < minY) {
          translateY = minY;
          test.css(item, "translateY", translateY);
        }
        if (callBack && typeof callBack["end"] === "function") {
          callBack["end"].call(item);
        }
      }
    })

    function bsr(type, targetY, time) {
      clearInterval(cleartime);
      // 当前次数
      var t = 0;
      // 初始位置
      var b = test.css(item, "translateY");
      // 最终位置-初始位置
      var c = targetY - b;
      // 总次数
      var d = time * 1000 / (1000 / 60);
      cleartime = setInterval(function () {
        t++;
        if (callBack && typeof callBack["autoMove"] === "function") {
          callBack["move"].call(item);
        }
        if (t > d) {
          clearInterval(cleartime);
          if (callBack && typeof callBack["end"] === "function") {
            callBack["end"].call(item);
          }
        }
        var point = Tween[type](t, b, c, d);
        test.css(item, "translateY", point);
      }, 1000 / 60);
    }
  }
})(window)
