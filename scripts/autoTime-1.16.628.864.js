/**
 * code by xyzsyx@163.com 发现bug或技术上的交流请发邮件到：xyzsyx@163.com
 * 本插件依赖jQuery库
 * 当前版本号：1.16.628.863
 *
 * PS:
 *    当插件父容器的宽度发生改变，且本插件没有自动调整布局时，请手动调用本插件重新布局方法  $.autoTime.reLayout(delay);
 *    参数delay为延迟执行的毫秒数（重新布局应在发生宽度改变动画结束时调用）
 *
 * 日志：
 *    【大版本号.年份.功能性版本号.bug版本号】
 *    【1.16.628.862】正式版发布版本
 *    【1.16.628.863】
 *          1、object初始化对象bug修复：未能在DOM中找到object所指定的元素时，caller被赋值为undefined，且未能即时终止插件运行
 *          2、当前刻度文本颜色高亮显示
 *          3、加入更新日志
 *    【1.16.628.864】 修复当时间条处于播放状态时点击上一个/下一个按钮失效的BUG。
 */

(function ($, window) {
    $.autoTime = {
        caller: undefined,
        version: "1.16.628.863",
        option: {
            autoPlay: true,//是否自动播放
            playOnce: false,//是否只自动播放一次,依赖autoPlay
            transition: false,//是否启用周期平滑过渡,依赖autoPlay（当游标到达时间轴末尾时，自动使用动画返回到时间轴起始位置）
            autoPlaySpeed: 4000,//播放一个完整刻度的时间（ms）,依赖autoPlay
            buttonPosition: "right",//操作按钮的位置（可选值“left”、“right”或“”）
            clickSpeed: 1000,//点击按钮最低时间间隔
            /**
             * rang array
             * 时间轴刻度值数组
             * 数组元素释义
             *    array[0] array 时间轴刻度值（支持三种时间格式，1970-1-1、1970/1/1或1970.1.1）
             *    array[1] string 时间显示类型（可选值“year”[默认]、“month”或“day”），缺省为“year”
             */
            range: [["2008-01-01", "2009-01-01", "2010-01-01", "2011-01-01", "2012-01-01", "2013-01-01", "2014-01-01", "2015-01-01", "2016-01-01"], "year"]
        },
        init: function (object, range, callback) {
            if (object instanceof $) {
                this.caller = object;
            } else {
                this.caller = $(object);
            }
            if (this.caller.length === 0) {
                console.log("时间播放条初始化失败，原因（按照指定的选择器 ‘" + this.caller.selector + "’ 未能找到DOM元素）");
                return;
            }
            if (typeof range !== "undefined" && range !== undefined && range[0] !== undefined && range[0].length > 0) {
                this.range = range;
            } else {
                this.range = this.option.range;
            }
            this.callback = callback;//回调函数
            this.lineWidth = undefined;//总宽度
            this.availableWidth = 0;//刻度尺播放区域宽度
            this.inoperable = false;//不可操作状态
            this.isPause = true;//是否暂停中
            this.isDownPause = undefined;//操作前是否处于暂停状态
            this.isDrag = false;//是否处于拖动状态
            this.isManually = false;//是否是手动切换刻度（通过点击上一个/下一个按钮对刻度进行切换）
            this.repeatScale = undefined;//重新执行一次当前刻度
            this.interval = 0;//刻度间距（不包括刻度本身的宽度）
            this.graduationCount = 0;//刻度数
            this.currentIndex = 0;//当前播放的刻度索引
            this.prevIndex = 0;//上一个被播放的刻度索引
            this.firstIndex = 0;//动画队列里第一个被播放的刻度索引
            this.graduationLeft = 0;//零刻度到当前游标所在位置的长度
            this.clickSpeed = isNaN(this.option.clickSpeed) ? 1000 : this.option.clickSpeed;
            this.autoPlaySpeed = isNaN(this.option.autoPlaySpeed) ? 10000 : this.option.autoPlaySpeed;
            this.autoPlay = !!this.option.autoPlay;
            this.playOnce = !!this.option.playOnce;
            this.transition = !!this.option.transition;
            this.buttonPosition = this.option.buttonPosition;

            this.layout();
            this._event();

            //启动播放
            this.start(0, false);
        },
        layout: function () {
            this.caller.find(".time-graduationCon").html("");
            //设置总宽度
            this.lineWidth = this.caller.parent().width();
            //设置操作按钮位置
            if (this.buttonPosition === "left") {
                this.caller.find(".time-left").before(this.caller.find(".time-oper"));
            } else if (this.buttonPosition === "right") {
                this.caller.find(".time-right").after(this.caller.find(".time-oper"));
            } else {
                this.caller.find(".time-oper").remove();
            }
            var oldAvailableWidth = this.availableWidth;
            //设置刻度尺播放区域宽度
            this.availableWidth = this.lineWidth - (this.caller.find(".time-left").width() + this.caller.find(".time-right").width() + this.caller.find(".time-oper").width() + 5);
            this.caller.find(".time-bg").width(this.availableWidth);
            //设置刻度
            var disFontArr = "",
                disFont = "",
                font = [["年", "月", "日"], ["year", "month", "day"]],
                disType = $.inArray(this.range[1], font[1]);
            disType = disType === -1 ? 0 : disType;
            for (var j = 0; j < this.range[0].length; j++) {
                disFontArr = this.range[0][j].split(/-|\.|\//, (disType + 1));
                disFont = "";
                $.each(disFontArr, function (i, v) {
                    disFont += parseInt(v) + font[0][i];
                });
                if (j < this.range[0].length - 1) {
                    this.caller.find(".time-graduationCon").append("<li class='time-graduation' data-time='" + this.range[0][j] + "'><i></i><p>" + disFont + "</p></li><li class='time-layout'></li>");
                } else {
                    this.caller.find(".time-graduationCon").append("<li class='time-graduation' data-time='" + this.range[0][j] + "'><i></i><p>" + disFont + "</p></li>");
                }
            }
            //刻度尺定位及刻度区域划分
            this.caller.find(".time-position").width(this.availableWidth).css("left", 14);
            this.graduationCount = this.caller.find(".time-graduation").length;
            this.interval = (this.availableWidth - this.graduationCount * 30) / (this.graduationCount - 1);
            this.caller.find(".time-layout").width(this.interval);
            //重新布局后，设置游标在新刻度尺中对应旧刻度尺的位置比例
            if (typeof this.isDownPause !== "undefined" && this.isDownPause !== undefined) {
                this.graduationLeft = this.graduationLeft / oldAvailableWidth * this.availableWidth;
                this.caller.find(".time-bg span").css("left", this.graduationLeft);
                this.caller.find('.time-graduation').eq(this.currentIndex).find('p').css({"fontSize": 14, "color": "#ff8400"});
            }
        },
        reLayout: function (delay) {
            var _this = this;
            _this.isDownPause = _this.isPause;
            if (!_this.isPause) {
                _this.pause();
            } else {
                _this.graduationLeft = this.caller.find(".time-bg span").position().left;
            }
            setTimeout(function () {
                _this.layout();
                if (!_this.isDownPause) {
                    _this.repeatScale = false;
                    _this.start(_this.currentIndex, true);
                }
                _this.isDownPause = undefined;
            }, delay || 0);
        },
        start: function (startIndex, isRestart) {
            if (this.autoPlay) {
                this.caller.find(".time-status").addClass("pause");
                this.graduationLeft = this.caller.find(".time-bg span").position().left;
                this.isPause = false;
                this.animationQueue(startIndex, isRestart);
            }
        },
        pause: function () {
            if (this.isPause) {
                this.start(this.currentIndex, true);
            } else {
                this.isPause = true;
                this.caller.find(".time-status").removeClass("pause");
                this.caller.find(".time-bg span").clearQueue().stop(true);
                this.graduationLeft = this.caller.find(".time-bg span").position().left;
            }
        },
        move: function () {
            var _this = this;
            if (!_this.inoperable) {
                $(document).on("mouseup", function () {
                    _this.mouseUp();
                });
                _this.isDownPause = _this.isPause;
                if (!_this.isPause) {
                    _this.pause();
                }
                _this.isDrag = true;
                $("body").addClass("selectnone");
                $(document).on("mousemove", function (e) {
                    _this.graduationLeft = e.pageX - _this.caller.find(".time-position").offset().left - 15;
                    _this.graduationLeft = _this.graduationLeft < 0
                        ? 0
                        : _this.graduationLeft;
                    _this.graduationLeft = _this.graduationLeft > _this.caller.find(".time-position").width() - 30
                        ? _this.caller.find(".time-position").width() - 30
                        : _this.graduationLeft;
                    _this.caller.find(".time-bg span").css("left", _this.graduationLeft);
                });
            }
        },
        mouseUp: function () {
            $(document).off("mousemove");
            $(document).off("mouseup");
            if (this.isDrag && !this.inoperable) {
                this.isDrag = false;
                this.currentIndex = this.closestGraduation();
            }
            this.resetGraduation();
        },
        resetGraduation: function () {
            if (!this.isDownPause) {
                this.pause();
            } else {
                this.graduationLeft = this.caller.find(".time-bg span").position().left;
                this.caller.find(".time-bg span").stop(true);
                this.animationFactory(this.currentIndex, true);
            }
        },
        closestGraduation: function (reverse) {
            reverse = !!reverse;
            var extent = -15;
            for (var i = 0; i < this.graduationCount; i++) {
                if (extent < this.graduationLeft && extent + 30 > this.graduationLeft) {
                    this.repeatScale = true;
                    if (reverse) {
                        return --i === -1 ? this.graduationCount - 1 : i;
                    } else {
                        return i;
                    }
                }
                extent += 30 + this.interval;
                if (extent > this.graduationLeft) {
                    this.repeatScale = reverse;
                    return i;
                }
            }
        },
        animationQueue: function (startIndex, isRestart) {
            var _this = this;
            if (isRestart) {
                if (typeof _this.repeatScale !== "undefined" && _this.repeatScale !== undefined && !_this.repeatScale) {
                    startIndex++;
                }
            }
            if (startIndex === _this.graduationCount) {
                _this._transition();
            } else {
                for (startIndex; startIndex <= _this.graduationCount - 1; startIndex++) {
                    _this.animationFactory(startIndex, isRestart);
                    isRestart = false;
                }
            }
        },
        animationFactory: function (index, isRestart) {
            var _this = this,
                interval = _this.interval + 30,
                delay = _this.autoPlaySpeed;
            if (isRestart) {
                if (((_this.prevIndex === 0 && index === _this.graduationCount - 1) || (_this.prevIndex === _this.graduationCount - 1 && index === 0)) && _this.isManually) {
                    delay = 0;
                } else {
                    if ((_this.isDownPause !== undefined && typeof _this.isDownPause !== "undefined" && _this.isDownPause) || _this.isManually) {
                        if (typeof _this.repeatScale !== "undefined" && _this.repeatScale !== undefined && !_this.repeatScale) {
                            index++;
                        }
                        delay /= 30;
                    } else {
                        delay = Math.abs((1 - ((_this.graduationLeft - (index - 1) * interval) / interval)) * delay);
                    }
                    _this.repeatScale = undefined;
                }
            } else {
                if (index === 0) {
                    delay = 0;
                }
            }
            _this.caller.find(".time-bg span").animate({left: index * (_this.interval + 30)}, delay, function () {
                _this.currentIndex = index;
                if ((_this.currentIndex === _this.graduationCount - 1 || (_this.currentIndex === 0 && _this.isManually)) && !_this.isDownPause) {
                    _this._transition();
                }
                _this.caller.find('.time-graduation').eq(_this.prevIndex).find('p').animate({"fontSize": 12}, 300).css("color", "#333333");
                _this.caller.find('.time-graduation').eq(_this.currentIndex).find('p').animate({"fontSize": 14}, 300).css("color", "#ff8400");
                _this.isManually = false;
                _this.isDownPause = undefined;
                _this.prevIndex = _this.currentIndex;
                //到达指定刻度，执行回调函数
                if (typeof _this.callback === "function") {
                    _this.callbackFun();
                }
            });
        },
        //动画过渡
        _transition: function () {
            var _this = this;
            if (!_this.playOnce) {
                if (_this.firstIndex == _this.graduationCount - 1) {
                    _this.caller.find(".time-bg span").css("left", 0);
                    _this.start(0, false);
                } else {
                    if (_this.transition) {
                        _this.inoperable = true;
                        _this.caller.find(".time-bg div").animate({opacity: 0.4}, 500);
                        setTimeout(function () {
                            _this.caller.find(".time-bg div").animate({opacity: 1}, 500, function () {
                                _this.inoperable = false;
                            });
                        }, _this.autoPlaySpeed - 500);
                        _this.start(0, false);
                    } else {
                        setTimeout(function () {
                            _this.caller.find(".time-bg span").css("left", 0);
                            _this.start(0, false);
                        }, _this.autoPlaySpeed);
                    }
                }
            } else {
                _this.autoPlay = false;
                _this.playOnce = false;
            }
        },
        callbackFun: function () {
            var time = this.caller.find('.time-graduation').eq(this.currentIndex).data("time");
            this.callback({
                date: time || "",
                dateArray: time.split(/-|\.|\//) || [],
                dateString: new Date(Date.parse(time)) || ""
            });
        },
        inoperableChange: function () {
            var _this = this;
            setTimeout(function () {
                _this.inoperable = false;
                _this.caller.find(".time-oper").animate({"opacity": 1}, 300);
            }, _this.autoPlaySpeed / 30 < _this.clickSpeed ? _this.clickSpeed : _this.autoPlaySpeed / 30);
        },
        _event: function () {
            var _this = this;

            $(window).resize(function (e) {
                _this.reLayout();
                e.stopPropagation();
            });

            _this.caller.find(".time-status").click(function (e) {
                if (_this.isPause) _this.repeatScale = false;
                else _this.repeatScale = undefined;
                _this.autoPlay = true;
                _this.firstIndex = _this.currentIndex;
                _this.pause();
                e.stopPropagation();
            });

            _this.caller.find(".time-prev").click(function (e) {
                if (!_this.inoperable) {
                    _this.caller.find(".time-oper").css("opacity", 0.1);
                    _this.inoperable = true;
                    _this.firstIndex = _this.currentIndex;
                    _this.isDownPause = _this.isPause;
                    _this.isManually = true;
                    if (!_this.isPause) {
                        _this.pause();
                        _this.currentIndex = _this.closestGraduation(true);
                    } else {
                        _this.currentIndex = --_this.currentIndex === -1 ? _this.graduationCount - 1 : _this.currentIndex;
                    }
                    _this.resetGraduation();
                    _this.inoperableChange();
                }
                e.stopPropagation();
            });

            _this.caller.find(".time-next").click(function (e) {
                if (!_this.inoperable) {
                    _this.caller.find(".time-oper").css("opacity", 0.1);
                    _this.inoperable = true;
                    _this.firstIndex = _this.currentIndex;
                    _this.isDownPause = _this.isPause;
                    _this.isManually = true;
                    if (!_this.isPause) {
                        _this.currentIndex++;
                        _this.pause();
                    } else {
                        _this.currentIndex = ++_this.currentIndex === _this.graduationCount ? 0 : _this.currentIndex;
                    }
                    _this.resetGraduation();
                    _this.inoperableChange();
                }
                e.stopPropagation();
            });

            _this.caller.find(".time-bg span").on("mousedown", function (e) {
                _this.move();
                e.stopPropagation();
            });

            _this.caller.find(".time-bg span").on("mouseup", function (e) {
                _this.mouseUp();
                e.stopPropagation();
            });
        }
    };
})($, window);