function Swipe(container, options) {

    'use strict';

    // utilities
    var noop = function() {} // simple no operation function
    var offloadFn = function(fn) {
        setTimeout(fn || noop, 0)
    } // offload a functions execution

    // check browser capabilities
    var transitions = function(temp) {
        var props = ['transitionProperty', 'WebkitTransition', 'MozTransition', 'OTransition', 'msTransition']
        for (var i in props)
            if (temp.style[props[i]] !== undefined) return true
        return false
    }(document.createElement('swipe'))

    var browser = {
        addEventListener: !!window.addEventListener,
        touch: ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch,
        transitions: transitions
    }

    if (!container) return
    var element = container.children[0]
    var slides, slidePos, client, length, slidesNum, moveSlides, slideClient, navs
    options = options || {}
    var index = parseInt(options.startSlide, 10) || 0
    var speed = options.speed || 300
    options.continuous = options.continuous !== undefined ? options.continuous : false

    //滑动方式
    var transform = browser.transitions && (options.transform !== undefined ? options.transform : true)

    var isVertical = options.vertical

    //wh=>width/height tl=>top/left xy=>x/y
    var wh, tl, xy, yx

    if (isVertical) {
        wh = 'height',
            tl = 'top',
            xy = 'y',
            yx = 'x'
    } else {
        wh = 'width',
            tl = 'left',
            xy = 'x',
            yx = 'y'
    }

    var nav = options.nav
    navs = nav && nav.children
    if (nav) nav.__length__ = navs.length

    function setup() {

        // cache slides
        slides = element.children
        length = slides.length

        index = getTo(index)

        // 计算每个滑块的宽度
        slidesNum = options.slidesNum || 1

        if (isVertical) {
            client = (container.getBoundingClientRect().height || container.offsetHeight) / slidesNum
        } else {
            client = (container.getBoundingClientRect().width || container.offsetWidth) / slidesNum
        }


        //每次滑动的块数，循环滚动每次只能滑动一块
        moveSlides = options.continuous ? 1 : options.moveSlides || 1
        slideClient = client * moveSlides

        //导航
        if (navs) {
            if (nav.__length__ == 0) {
                var temp = ''
                each(slides, function(i, v) {
                    temp += '<span>' + (i + 1) + '</span>'
                })
                nav.innerHTML = temp
                navs = nav.children
            }

            each(navs, function(i, elem) {
                elem.addEventListener('click', function() {
                    stop()
                    slide(i, speed)
                }, false)

                if (i >= 0 && i < 0 + slidesNum) {
                    elem.className = 'current'
                } else {
                    elem.className = ''
                }
            })
        }


        // 一个滑块则不能循环滚动
        if (slides.length < 2) options.continuous = false

        //两个滑块 复制DOM
        if (browser.transitions && options.continuous && slides.length < 3) {
            element.appendChild(slides[0].cloneNode(true))
            element.appendChild(element.children[1].cloneNode(true))
            slides = element.children
        }

        // 用于保存每个滑块的对应滑动位置
        slidePos = new Array(slides.length)

        // container.style.overflow = 'hidden'

        element.style[wh] = (slides.length * client) + 'px'
        element.style.position = 'relative'
        // element.style.overflow = 'hidden'


        // 设置初始样式
        var pos = slides.length


        while (pos--) {

            var _slide = slides[pos]

            _slide.style[wh] = client + 'px'
            _slide.style.cssFloat = 'left'
            _slide.style.display = 'inline'
            _slide.setAttribute('data-index', pos)

            var position = (pos * -client)

            if (browser.transitions && options.continuous) {
                _slide.style[tl] = position + 'px'
                _slide.style.position = 'relative'
                move(pos, index > pos ? -client : (index < pos ? client : 0), 0)

            } else {
                slidePos[pos] = position
            }


        }


        // 重置滑块的前后位置
        if (options.continuous && browser.transitions) {
            move(circle(index - 1), -client, 0)
            move(circle(index + 1), client, 0)
        }

        if (!options.continuous) {

            if (transform) {

                translate(element, slidePos[index], 0)

            } else {
                element.style[tl] = slidePos[index] + 'px'
            }

        }

        container.style.visibility = 'visible'


        loadImg(index, slidesNum, true)
        callback(index, slides[index])


    }


    function each(elems, callback) {
        for (var i = 0, len = elems.length; i < len; i++) {
            callback.call(this, i, elems[i])
        }
    }

    function prev() {

        if (options.continuous) slide(index - 1)
        else if (index) slide(index - 1)

    }

    function next() {

        if (options.continuous) slide(index + 1)
        else if (index < slides.length - 1) slide(index + 1)

    }

    function circle(index) {

        // 获取循环滚动的目标索引
        return (slides.length + (index % slides.length)) % slides.length

    }

    //根据不同 slidesNum，转换不同目标索引 
    function getTo(to) {
        return (to > slides.length - 1 - slidesNum) ? slides.length - slidesNum : to
    }


    function move(index, dist, speed) {

        translate(slides[index], dist, speed)
        slidePos[index] = dist

    }

    function translate(slide, dist, speed) {

        //惰性载入，避免重复判断
        if (isVertical) {
            translate = function(slide, dist, speed) {
                var style = slide && slide.style

                if (!style) return

                style.webkitTransitionDuration =
                    style.MozTransitionDuration =
                    style.msTransitionDuration =
                    style.OTransitionDuration =
                    style.transitionDuration = speed + 'ms'

                style.webkitTransform = 'translate(0,' + dist + 'px)' + 'translateZ(0)'
                style.msTransform =
                    style.MozTransform =
                    style.OTransform = 'translateY(' + dist + 'px)'
            }
        } else {
            translate = function(slide, dist, speed) {
                var style = slide && slide.style

                if (!style) return

                style.webkitTransitionDuration =
                    style.MozTransitionDuration =
                    style.msTransitionDuration =
                    style.OTransitionDuration =
                    style.transitionDuration = speed + 'ms'

                style.webkitTransform = 'translate(' + dist + 'px,0)' + 'translateZ(0)'
                style.msTransform =
                    style.MozTransform =
                    style.OTransform = 'translateX(' + dist + 'px)'
            }
        }

        return translate(slide, dist, speed)


    }

    function animate(from, to, speed) {

        if (!speed) {

            element.style[tl] = to + 'px'
            return

        }

        var start = +new Date

        var timer = setInterval(function() {

            var timeElap = +new Date - start

            if (timeElap > speed) {

                element.style[tl] = to + 'px'

                if (delay) begin()

                options.transitionEnd && options.transitionEnd.call(event, index, slides[index])

                clearInterval(timer)
                return
            }

            element.style[tl] = (((to - from) * (Math.floor((timeElap / speed) * 100) / 100)) + from) + 'px'

        }, 4)

    }

    // setup auto slideshow
    var delay = options.auto || 0
    var interval

    function begin() {

        interval = setTimeout(next, delay)

    }

    function stop() {

        // delay = 0
        clearTimeout(interval)

    }


    var start = {}
    var delta = {}
    var isScrolling,
        isTransitionStart


    function slide(to, slideSpeed) {

        // do nothing if already on requested slide
        if (index == to) return

        if (browser.transitions && options.continuous) {

            var direction = Math.abs(index - to) / (index - to) // 1: backward, -1: forward

            // get the actual position of the slide
            var natural_direction = direction
            direction = -slidePos[circle(to)] / client


            // if going forward but to < index, use to = slides.length + to
            // if going backward but to > index, use to = -slides.length + to

            if (direction !== natural_direction) to = -direction * slides.length + to

            var diff = Math.abs(index - to) - 1

            // move all the slides between index and to in the right direction
            while (diff--) move(circle((to > index ? to : index) - diff - 1), client * direction, 0)

            to = circle(to)


            move(index, client * direction, slideSpeed || speed)
            move(to, 0, slideSpeed || speed)

            if (options.continuous) move(circle(to - direction), -(client * direction), 0) // we need to get the next in place

        } else {

            to = getTo(to)

            if (transform) {
                translate(element, slidePos[to], speed)
            } else {
                animate(slidePos[index], slidePos[to], speed)
            }
        }

        index = to

        transitionStart(to)
        callback(index)

    }

    function transitionStart(index) {
        loadImg(index, slidesNum, false)
        options.transitionStart && options.transitionStart(index, slides[index])
    }

    /*
     *@param flag Boolean 是否为初始加载
     */

    function loadImg(index, slidesNum, flag) {

        var trueSrc = options.imgSrc || 'lazy-src'

        var n = index
        var len = index + slidesNum + 1

        /*
        页面初始加载，只加载当前选项卡图片，页面onload完2s后加载第二张。
        之后滑动切换的时候，加载目标选项卡后一张图片，避免切换时图片加载导致的空白问题。
        */
        if (flag) {
            len = index + slidesNum

            window.addEventListener('load', function() {
                setTimeout(function() {
                    loadImg(index, slidesNum, false)
                }, 2000)
            }, false)
        }

        for (; n < len; n++) {

            if (!slides[n]) continue

            var imgs = slides[n].querySelectorAll('img[' + trueSrc + ']')

            if (!imgs) continue

            each(imgs, function(i, o) {
                var lazySrc = o.getAttribute('lazy-src'),
                    img = new Image()

                img.onload = function() {
                    o.setAttribute('src', lazySrc)
                    o.removeAttribute('lazy-src')
                }

                img.src = lazySrc
            })
        }


    }

    function callback(index) {
        var index = index % length

        options.nav && setNav(index, slidesNum)

        options.callback && options.callback(index, slides[index])
    }

    //设置导航
    function setNav(to, slidesNum) {
        each(navs, function(i, elem) {
            if (i >= to && i < to + slidesNum) {
                elem.className = 'current'
            } else {
                elem.className = ''
            }
        })
    }

    // setup event capturing
    var events = {

        handleEvent: function(event) {

            switch (event.type) {
                case 'touchstart':
                    this.start(event)
                    break
                case 'touchmove':
                    this.move(event)
                    break
                case 'touchend':
                    offloadFn(this.end(event))
                    break
                case 'webkitTransitionEnd':
                case 'msTransitionEnd':
                case 'oTransitionEnd':
                case 'otransitionend':
                case 'transitionend':
                    offloadFn(this.transitionEnd(event))
                    break
                case 'resize':
                    if (setup.timer) {
                        clearTimeout(setup.timer)
                    }
                    setup.timer = setTimeout(setup, 250)
                    break
            }

            if (options.stopPropagation) event.stopPropagation()

        },
        start: function(event) {
            var touches = event.touches[0]

            start = {

                x: touches.pageX,
                y: touches.pageY,

                time: +new Date

            }

            // 是否为第一次
            isScrolling = undefined
            isTransitionStart = false

            // reset delta and end measurements
            delta = {}

            // attach touchmove and touchend listeners
            element.addEventListener('touchmove', this, false)
            element.addEventListener('touchend', this, false)

        },
        move: function(event) {


            if (slides[index].hasAttribute('disableSlide')) return

            // ensure swiping with one touch and not pinching
            if (event.touches.length > 1 || event.scale && event.scale !== 1) return

            if (options.disableScroll) event.preventDefault()

            var touches = event.touches[0]

            // measure change in x and y
            delta = {
                x: touches.pageX - start.x,
                y: touches.pageY - start.y
            }

            // determine if scrolling test has run - one time test
            if (typeof isScrolling == 'undefined') {
                isScrolling = !!(isScrolling || Math.abs(delta[xy]) < Math.abs(delta[yx]))
            }

            // if user is not trying to scroll vertically
            if (!isScrolling) {

                // prevent native scrolling
                event.preventDefault()

                // stop slideshow
                stop()

                var lIndex, rIndex

                // increase resistance if first or last slide
                if (options.continuous) {

                    lIndex = circle(index - 1)
                    rIndex = circle(index + 1)

                    translate(slides[lIndex], delta[xy] + slidePos[circle(index - 1)], 0)
                    translate(slides[index], delta[xy] + slidePos[index], 0)
                    translate(slides[rIndex], delta[xy] + slidePos[circle(index + 1)], 0)


                } else {

                    delta[xy] =
                        delta[xy] /
                        ((!index && delta[xy] > 0 // if first slide and sliding left
                                || index == slides.length - slidesNum // or if last slide and sliding right
                                && delta[xy] < 0 // and if sliding at all
                            ) ?
                            (Math.abs(delta[xy]) / slideClient + 1) // determine resistance level
                            : 1) // no resistance if false

                    // translate 1:1
                    if (transform) {
                        translate(element, delta[xy] + slidePos[index], 0)
                    } else {
                        animate(slidePos[index], delta[xy] + slidePos[index], 0)
                    }

                }


                if (!isTransitionStart) {

                    if (!options.continuous) {
                        lIndex = ((index - moveSlides) <= 0) ? 0 : index - moveSlides
                        rIndex = getTo(index + moveSlides)
                    }

                    //right
                    if (delta[xy] < 0) {
                        transitionStart(rIndex)
                    }

                    //left
                    if (delta[xy] > 0) {
                        transitionStart(lIndex)

                    }

                    isTransitionStart = true

                }


            }


        },
        end: function(event) {

            // measure duration
            var duration = +new Date - start.time

            // determine if slide attempt triggers next/prev slide
            var isValidSlide =
                Number(duration) < 250 // if slide duration is less than 250ms
                && Math.abs(delta[xy]) > 20 // and if slide amt is greater than 20px
                || Math.abs(delta[xy]) > slideClient / 2 // or if slide amt is greater than half the width

            // 判断是否超过第一张或最后一张
            var isPastStart = !index && delta[xy] > 0, // 第一张且向正方向滑动
                isPastEnd = (index == slides.length - slidesNum && delta[xy] < 0) // 第一张且向负方向滑动

            var isPastBounds = options.continuous ? false : isPastStart || isPastEnd

            // 判断滑动方向 (true:right, false:left)
            var direction = delta[xy] < 0

            if (!isScrolling) {

                if (isValidSlide && !isPastBounds) {

                    if (direction) {

                        if (options.continuous) {

                            move(circle(index - 1), -client, 0)
                            move(circle(index + 2), client, 0)

                            move(index, slidePos[index] - client, speed)
                            move(circle(index + 1), slidePos[circle(index + 1)] - client, speed)
                            index = circle(index + 1)

                        } else {

                            var to = getTo(index + moveSlides)

                            if (transform) {
                                translate(element, slidePos[to], speed)
                            } else {
                                animate(delta[xy] + slidePos[index], slidePos[to], speed)
                            }

                            index = to

                        }


                    } else {

                        if (options.continuous) {

                            move(circle(index + 1), client, 0)
                            move(circle(index - 2), -client, 0)

                            move(index, slidePos[index] + client, speed)
                            move(circle(index - 1), slidePos[circle(index - 1)] + client, speed)

                            index = circle(index - 1)

                        } else {

                            var to = ((index - moveSlides) <= 0) ? 0 : index - moveSlides

                            if (transform) {
                                translate(element, slidePos[to], speed)
                            } else {
                                animate(delta[xy] + slidePos[index], slidePos[to], speed)
                            }

                            index = to

                        }


                    }

                    callback(index)

                } else {

                    if (options.continuous) {

                        move(circle(index - 1), -client, speed)
                        move(index, 0, speed)
                        move(circle(index + 1), client, speed)

                    } else {

                        if (transform) {
                            translate(element, slidePos[index], speed)
                        } else {
                            animate(delta[xy] + slidePos[index], slidePos[index], speed)
                        }

                        if (direction) {
                            options.pastEnd && options.pastEnd(index, slides[index])
                        } else {
                            options.pastStart && options.pastStart(index, slides[index])
                        }
                    }

                }

            }

            // kill touchmove and touchend event listeners until touchstart called again
            element.removeEventListener('touchmove', events, false)
            element.removeEventListener('touchend', events, false)

        },
        transitionEnd: function(event) {

            var isTransitionEnd

            if (options.continuous) {
                if (parseInt(event.target.getAttribute('data-index'), 10) == index) {

                    isTransitionEnd = true

                }
            } else {
                isTransitionEnd = true

            }

            if (isTransitionEnd) {
                if (delay) begin()
                options.transitionEnd && options.transitionEnd.call(event, index, slides[index])
            }



        }

    }

    // trigger setup
    setup()

    // 自动播放
    if (delay) begin()


    if (browser.addEventListener) {
        if (browser.touch) element.addEventListener('touchstart', events, false)

        if (transform) {
            element.addEventListener('webkitTransitionEnd', events, false)
            element.addEventListener('msTransitionEnd', events, false)
            element.addEventListener('oTransitionEnd', events, false)
            element.addEventListener('otransitionend', events, false)
            element.addEventListener('transitionend', events, false)
        }

        window.addEventListener('resize', events, false)

    } else {

        window.onresize = function() {
            setup()
        } // to play nice with old IE

    }

    // expose the Swipe API
    return {
        options: options,

        setup: function() {

            setup()

        },
        slide: function(to, speed) {

            // cancel slideshow
            stop()

            slide(to, speed)

        },
        prev: function() {

            // cancel slideshow
            stop()

            prev()

        },
        next: function() {

            // cancel slideshow
            stop()

            next()

        },
        stop: function() {

            // cancel slideshow
            stop()

        },
        start: function() {
            begin()
        },

        getPos: function() {

            // return current index position
            return index

        },
        getNumSlides: function() {

            // return total number of slides
            return length
        },
        kill: function() {

            // cancel slideshow
            stop()

            // reset element
            element.style[wh] = ''
            element.style[tl] = ''

            // reset slides
            var pos = slides.length
            while (pos--) {

                var slide = slides[pos]
                slide.style[wh] = ''
                slide.style[tl] = ''

                if (transform) translate(slides[pos], 0, 0)

            }

            // removed event listeners
            if (browser.addEventListener) {

                // remove current event listeners
                element.removeEventListener('touchstart', events, false)
                element.removeEventListener('webkitTransitionEnd', events, false)
                element.removeEventListener('msTransitionEnd', events, false)
                element.removeEventListener('oTransitionEnd', events, false)
                element.removeEventListener('otransitionend', events, false)
                element.removeEventListener('transitionend', events, false)
                window.removeEventListener('resize', events, false)

            } else {

                window.onresize = null

            }

        }
    }

}


if (window.jQuery || window.Zepto) {
    (function($) {
        $.fn.Swipe = function(params) {
            return this.each(function() {
                $(this).data('Swipe', new Swipe($(this)[0], params))
            })
        }
    })(window.jQuery || window.Zepto)
}