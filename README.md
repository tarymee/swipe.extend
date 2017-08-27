# SWIPE JS – 移动WEB页面滑动JS库-增强版

###　update:
+ 添加：非循环滚动情况下，滑动超过第一张和最后一张边界时回调函数。
+ 修复：continue：true不能循环滑动的问题，同时改为无缝的循环方式。2.添加vertical：Boolen参数，支持垂直滑动。
+ 增加slidesNum、moveSlides参数，分别控制每屏滑块显示数量以及每次滑动的块数
+ 可通过滑块自定义属性- disableSlide 控制当前滑块是否可以滑动

### 基于swipe2.0进行了以下扩展：
+ nav：支持切换导航控制，可用于tab切换。
+ transitionStart：滑动过渡开始触发函数，多用于滑动按需操作。
+ 图片按需功能，默认将图片src2属性替换为真实路径，其他按需，如js按需加载或执行等，可在transitionStart函数中处理。
+ 增加slidesNum、moveSlides参数，分别控制每屏滑块显示数量以及每次滑动的块数
+ 通过滑块自定义属性“disableSlide”控制当前滑块是否可以滑动

## 使用

```
<!--CSS-->
<style>
.swipe-wrap > div:not(:first-child){display: none;}
</style>

<!--HTML-->
<div id="slider" class="swipe">
    <div class="swipe-wrap">
        <div>滑块1</div>
        <!--不可滑动，remove disableSlide属性可解除-->
        <div disableSlide>滑块2</div>
        <div>滑块3</div>
    </div>
    <div class="swipe-nav"></div>
</div>

<!--JS-->
new Swipe(document.getElementById('slider'))

```

### 参数设置

- **startSlide** Integer - 滑动块的索引值,即从*值开始滑动，默认为0
- **speed** Integer -滑动的速度，默认值300毫秒
- **auto** Integer - 自动滑动的时间间隔
- **nav** element - 指定切换导航DOM节点，如果为空元素，则自动生成（扩展）
- **continuous** Boolean  - 是否循环滑动，默认值为false
- **vertical:** Boolen - 是否垂直滑动，默认为false
- **slidesNum**:Number -控制每屏滑块显示数量
- **moveSlides**:Number -每次滑动的块数
- **disableScroll** Boolean  - 停止任何触及此容器滚动页面，默认值flase
- **stopPropagation** Boolean  - 停止事件冒泡,默认值flase
- **callback** Function -  手离开触发点且滑动块改变时触发
- **transitionStart** Function - 滑动过渡开始时触发（扩展）
- **transitionEnd** Function - 滑动过渡结束时触发
- **pastStart** Function - 非循环滚动情况下，滑动超过第一张时触发
- **pastEnd** Function - 非循环滚动情况下，滑动超过最后一张时触发


### API
- prev() 上一页
- next() 下一页
- start() 开始自动滑动
- stop() 结束自动滑动
- getPos() 获取当前索引位置
- getNumSlides() 获取所有滑块总数
- slide(index, duration) 滑动到所设置的索引位置


**[Example](index.html)**


## 常见问题

#### 1.切换后滑动块的高度取决于所有滑动块最大高度，如果某个滑动块无内容或者内容较少，则会出现一个空白区域
针对这种问题，可以通过callback函数动态设置滑动块外层高度
```
swipe(document.getElementById('slider'), {
    callback: function(index, elem) {
        elem.parentNode.style.height = (elem.clientHeight || elem.offsetHeight) + 'px'
    }
})
```




