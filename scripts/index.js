/**
 * @Author Oceanxy
 * @DateTime 2016/03/01
 * @Description autoTime plugs
 * @LastModifiedBy Oceanxy
 * @LastModifiedTime 2017/08/24
 * @Email xyzsyx@163.com
 * @EmailUsage Submit bugs or technical exchange
 * @Remind This plug-in relies on jQuery, the version number is 1.9.1 at development time
 *
 */

/**
 * 构造函数
 *
 * @param {jQuery | $} object jQuery调用对象
 * @param {Object=} option 可配置参数
 * @param {Function=} callback 回调函数
 * @constructor
 */
function Index(object, option, callback) {
  /**
   * 版本号
   * @type {string}
   */
  this.version = '2.16.1.0'
  /**
   * this的指向（指向一个jQuery对象）
   * @type {jQuery | $}
   */
  if(object instanceof $) {
    this.caller = object
  } else {
    this.caller = $(object)
  }

  if(this.caller.length === 0) {
    console.log('时间播放条初始化失败，原因（按照指定的选择器 ‘' + this.caller.selector + '’ 未能找到DOM元素）')
    return
  }

  /**
   * 可配置项参数
   * @type {Object}
   */
  this.option = this.defaultOption

  /**
   * 回调函数
   * @type {Function}
   */
  this.callback = function() {
    console.log('未设置回调函数')
  }

  if(arguments.length === 2) {
    if(typeof arguments[1] === 'object') {
      this.option = $.extend(
        {},
        this.defaultOption,
        option || {}
      )
    } else if(typeof arguments[1] === 'function') {
      this.callback = callback
    }
  } else if(arguments.length === 3) {
    this.option = option
    this.callback = callback
  }

  /**
   * 总宽度
   * @type {undefined | number}
   */
  this.lineWidth = undefined
  /**
   * 刻度尺播放区域宽度
   * @type {number}
   */
  this.availableWidth = 0
  /**
   * 不可操作状态
   * @type {boolean}
   */
  this.inoperable = false
  /**
   * 是否暂停中
   * @type {boolean}
   */
  this.isPause = true
  /**
   * 操作前是否处于暂停状态
   * @type {undefined | boolean}
   */
  this.isDownPause = undefined
  /**
   * 是否处于拖动状态
   * @type {boolean}
   */
  this.isDrag = false
  /**
   * 是否是手动切换刻度（通过点击上一个/下一个按钮对刻度进行切换）
   * @type {boolean}
   */
  this.isManually = false
  /**
   * 重新执行一次当前刻度
   * @type {undefined | boolean}
   */
  this.repeatScale = undefined
  /**
   * 刻度间距（不包括刻度本身的宽度）
   * @type {number}
   */
  this.interval = 0
  /**
   * 刻度数
   * @type {number}
   */
  this.graduationCount = 0
  /**
   * 当前播放的刻度索引
   * @type {number}
   */
  this.currentIndex = 0
  /**
   * 上一个被播放的刻度索引
   * @type {number}
   */
  this.prevIndex = 0
  /**
   * 动画队列里第一个被播放的刻度索引
   * @type {number}
   */
  this.firstIndex = 0
  /**
   * 零刻度到当前游标所在位置的长度
   * @type {number}
   */
  this.graduationLeft = 0

  /**
   * 点击按钮最低时间间隔
   * 默认1000
   *
   * @type {number}
   */
  this.clickSpeed = this.option.clickSpeed === undefined || isNaN(this.option.clickSpeed)
    ? 1000
    : this.option.clickSpeed
  /**
   * 播放一个完整刻度的时间（ms）
   * 依赖autoPlay=true
   *
   * @type {number}
   */
  this.autoPlaySpeed = this.option.autoPlaySpeed === undefined || isNaN(this.option.autoPlaySpeed)
    ? 10000
    : this.option.autoPlaySpeed
  /**
   * 是否自动播放
   * 默认true
   *
   * @type {boolean}
   */
  this.autoPlay = !!this.option.autoPlay
  /**
   * 是否只自动播放一次,依赖autoPlay
   * 默认true
   *
   * @type {boolean}
   */
  this.playOnce = !!this.option.playOnce
  /**
   * 是否启用周期平滑过渡,依赖autoPlay（当游标到达时间轴末尾时，自动使用动画返回到时间轴起始位置）
   * 默认false
   *
   * @type {boolean}
   */
  this.transition = !!this.option.transition
  /**
   * 操作按钮的位置（可选值“left”、“right”或“”）
   * @type {*|string}
   */
  this.buttonPosition = this.option.buttonPosition
  /**
   * 时间轴刻度值数组
   *
   * * @type {*|Array}
   *
   * 数组元素释义
   *    array[0] array 时间轴刻度值（支持三种时间格式，1970-1-1、1970/1/1或1970.1.1）
   *    array[1] string 时间显示类型（可选值“year”[默认]、“month”或“day”）
   */
  this.range = this.option.range

  /**
   * 布局
   */
  this.layout()
  /**
   * 事件
   */
  this._event()

  //启动
  this.start(0, false)
}

/**
 * 原型
 * @type {{
     *      constructor: Index,
     *      defaultOption: {
     *          autoPlay: boolean,
     *          playOnce: boolean,
     *          transition: boolean,
     *          autoPlaySpeed: number,
     *          buttonPosition: string,
     *          clickSpeed: number,
     *          range: [null,string]},
     *          layout: Index.layout,
     *          reLayout: Index.reLayout,
     *          start: Index.start,
     *          pause: Index.pause,
     *          move: Index.move,
     *          mouseUp: Index.mouseUp,
     *          resetGraduation: Index.resetGraduation,
     *          closestGraduation: Index.closestGraduation,
     *          animationQueue: Index.animationQueue,
     *          animationFactory: Index.animationFactory,
     *          _run: Index._run,
     *          _transition: Index._transition,
     *          transitionStatus: Index.transitionStatus,
     *          callbackFun: Index.callbackFun,
     *          inoperableChange: Index.inoperableChange,
     *          _event: Index._event
     *     }
     * }
 */
Index.prototype = {
  constructor: Index,
  /**
   * 默认参数值配置
   */
  defaultOption: {
    autoPlay: true,
    playOnce: false,
    transition: false,
    autoPlaySpeed: 4000,
    buttonPosition: 'right',
    clickSpeed: 1000,
    //TODO 自动获取当前时间之前的时间为默认值，并且可设置默认值的范围，并且可以精确到时分秒层级
    range: [['2008-01-01', '2009-01-01', '2010-01-01', '2011-01-01', '2012-01-01', '2013-01-01', '2014-01-01', '2015-01-01', '2016-01-01'], 'year']
  },
  /**
   * 初始化布局
   */
  layout: function() {
    this.caller
      .find('.time-graduationCon')
      .html('')

    //设置总宽度
    this.lineWidth = this.caller
      .parent()
      .width()

    //设置操作按钮位置
    if(this.buttonPosition === 'left') {
      this.caller
        .find('.time-left')
        .before(
          this.caller
            .find('.time-oper')
        )
    } else if(this.buttonPosition === 'right') {
      this.caller
        .find('.time-right')
        .after(
          this.caller
            .find('.time-oper')
        )
    } else {
      this.caller
        .find('.time-oper')
        .remove()
    }

    var oldAvailableWidth = this.availableWidth

    //设置刻度尺播放区域宽度
    this.availableWidth = this.lineWidth - (
      this.caller
        .find('.time-left')
        .width()
      + this.caller
        .find('.time-right')
        .width()
      + this.caller
        .find('.time-oper')
        .width()
      + 5
    )

    this.caller
      .find('.time-bg')
      .width(this.availableWidth)

    //设置刻度
    var disFontArr = '',
      disFont = '',
      font = [
        ['年', '月', '日'],
        ['year', 'month', 'day']
      ],
      disType = $.inArray(this.range[1], font[1])

    disType = disType === -1 ? 0 : disType

    this.range[0] = this.range[0].length > 0
      ? this.range[0]
      : [
        '2008-01-01',
        '2009-01-01',
        '2010-01-01',
        '2011-01-01',
        '2012-01-01',
        '2013-01-01',
        '2014-01-01',
        '2015-01-01',
        '2016-01-01'
      ]

    for(var j = 0, len = this.range[0].length; j < len; j++) {
      disFontArr = this.range[0][j]
        .split(/-|\.|\//, (disType + 1))

      disFont = ''

      $.each(disFontArr, function(i, v) {
        disFont += parseInt(v) + font[0][i]
      })

      if(j < this.range[0].length - 1) {
        this.caller
          .find('.time-graduationCon')
          .append('<li class=\'time-graduation\' data-time=\'' + this.range[0][j] + '\'>'
            + '<i></i>'
            + '<p>' + disFont + '</p>'
            + '</li>'
            + '<li class=\'time-layout\'></li>'
          )
      } else {
        this.caller
          .find('.time-graduationCon')
          .append(
            '<li class=\'time-graduation\' data-time=\'' + this.range[0][j] + '\'>' +
            '<i></i>' +
            '<p>' + disFont + '</p>' +
            '</li>'
          )
      }
    }

    //刻度尺定位及刻度区域划分
    this.caller
      .find('.time-position')
      .width(this.availableWidth)
      .css('left', 14)

    this.graduationCount = this.caller
      .find('.time-graduation')
      .length

    this.interval = (this.availableWidth - this.graduationCount * 30) / (this.graduationCount - 1)

    this.caller
      .find('.time-layout')
      .width(this.interval)

    //重新布局后，设置游标在新刻度尺中对应旧刻度尺的位置比例
    if(typeof this.isDownPause !== 'undefined'
      && this.isDownPause !== undefined
    ) {
      this.graduationLeft = this.graduationLeft / oldAvailableWidth * this.availableWidth

      this.caller
        .find('.time-bg span')
        .css('left', this.graduationLeft)
      this.caller
        .find('.time-graduation')
        .eq(this.currentIndex)
        .find('p')
        .css({
          'fontSize': 14,
          'color': '#ff8400'
        })
    }
  },
  /**
   * 重新布局
   * @param {number=} delay 重新布局时需要延迟的事件
   * 单位：毫秒
   */
  reLayout: function(delay) {
    var _this = this

    _this.isDownPause = _this.isPause

    if(!_this.isPause) {
      _this.pause()
    } else {
      _this.graduationLeft = this.caller
        .find('.time-bg span')
        .position().left
    }

    setTimeout(function() {
      _this.layout()
      if(!_this.isDownPause) {
        _this.repeatScale = false
        _this.start(_this.currentIndex, true)
      }

      _this.isDownPause = undefined
    }, delay || 0)
  },
  /**
   * 启动
   * @param {number} startIndex 开始刻度的索引
   * @param {boolean} isRestart 是否处于重启状态
   *      用于判断插件是初始启动还是经过暂停后再次启动
   *      以便在后续操作中控制刻度位置
   */
  start: function(startIndex, isRestart) {
    if(this.autoPlay) {
      this.caller
        .find('.time-status')
        .addClass('pause')

      this.graduationLeft = this.caller
        .find('.time-bg span')
        .position().left

      this.isPause = false

      this.animationQueue(startIndex, isRestart)
    }
  },
  /**
   * 暂停播放
   */
  pause: function() {
    if(this.isPause) {
      this.start(this.currentIndex, true)
    } else {
      this.isPause = true
      this.caller
        .find('.time-status')
        .removeClass('pause')

      this.caller
        .find('.time-bg span')
        .clearQueue()
        .stop(true)

      this.graduationLeft = this.caller
        .find('.time-bg span')
        .position().left
    }
  },
  /**
   * 拖动游标移动
   */
  move: function() {
    var _this = this
    if(!_this.inoperable) {
      $(document).on('mouseup', function() {
        _this.mouseUp()
      })

      _this.isDownPause = _this.isPause

      if(!_this.isPause) {
        _this.pause()
      }

      _this.isDrag = true

      $('body').addClass('selectnone')

      $(document).on('mousemove', function(e) {
        _this.graduationLeft = e.pageX - _this.caller
          .find('.time-position')
          .offset().left - 15

        _this.graduationLeft = _this.graduationLeft < 0
          ? 0
          : _this.graduationLeft

        _this.graduationLeft = _this.graduationLeft > _this.caller
          .find('.time-position')
          .width() - 30
          ? _this.caller.find('.time-position').width() - 30
          : _this.graduationLeft

        _this.caller
          .find('.time-bg span')
          .css('left', _this.graduationLeft)
      })
    }
  },
  /**
   * 释放鼠标
   */
  mouseUp: function() {
    $(document).off('mousemove')
    $(document).off('mouseup')

    if(this.isDrag && !this.inoperable) {
      this.isDrag = false
      this.currentIndex = this.closestGraduation()
    }
    this.resetGraduation()
  },
  /**
   * 重置刻度
   */
  resetGraduation: function() {
    if(!this.isDownPause) {
      this.pause()
    } else {
      this.graduationLeft = this.caller
        .find('.time-bg span')
        .position()
        .left

      this.caller
        .find('.time-bg span')
        .stop(true)

      this.animationFactory(this.currentIndex, true)
    }
  },
  /**
   * 获取离游标最近的一个刻度点
   * @param {boolean=} reverse 是否反向
   * @returns {number} 刻度索引
   */
  closestGraduation: function(reverse) {
    reverse = !!reverse
    var extent = -15

    for(var i = 0; i < this.graduationCount; i++) {
      if(extent < this.graduationLeft
        && extent + 30 > this.graduationLeft
      ) {
        this.repeatScale = true

        if(reverse) {
          return --i === -1
            ? this.graduationCount - 1
            : i
        } else {
          return i
        }
      }

      extent += 30 + this.interval

      if(extent > this.graduationLeft) {
        this.repeatScale = reverse
        return i
      }
    }
  },
  /**
   * 生成动画队列
   * @param {number} startIndex 开始刻度的索引
   * @param {boolean} isRestart 是否处于重启状态
   */
  animationQueue: function(startIndex, isRestart) {
    var _this = this

    if(isRestart) {
      if(typeof _this.repeatScale !== 'undefined'
        && _this.repeatScale !== undefined
        && !_this.repeatScale
      ) {
        startIndex++
      }
    }

    if(startIndex === _this.graduationCount) {
      _this._transition()
    } else {
      for(startIndex; startIndex <= _this.graduationCount - 1; startIndex++) {
        _this.animationFactory(startIndex, isRestart)
        isRestart = false
      }
    }
  },
  /**
   * 动画工厂
   * 生成动画函数
   * @param {number} index 刻度索引
   * @param {boolean} isRestart 是否处于重启状态
   */
  animationFactory: function(index, isRestart) {
    var _this = this,
      interval = _this.interval + 30,
      delay = _this.autoPlaySpeed

    if(isRestart) {
      if((
        (_this.prevIndex === 0
          && index === _this.graduationCount - 1
        ) || (_this.prevIndex === _this.graduationCount - 1
          && index === 0
        )
      ) && _this.isManually
      ) {
        delay = 0
      } else {
        if((_this.isDownPause !== undefined
          && typeof _this.isDownPause !== 'undefined'
          && _this.isDownPause
        ) || _this.isManually
        ) {
          if(typeof _this.repeatScale !== 'undefined'
            && _this.repeatScale !== undefined
            && !_this.repeatScale
          ) {
            index++
          }

          delay /= 30
        } else {
          delay = Math.abs((1 - ((_this.graduationLeft - (index - 1) * interval) / interval)) * delay)
        }

        _this.repeatScale = undefined
      }
    } else {
      if(index === 0 && !_this.transition) {
        delay = 0
      }
    }

    _this.caller
      .find('.time-bg span')
      .animate({
          left: index * (_this.interval + 30)
        },
        delay,
        function() {
          _this.currentIndex = index

          if((_this.currentIndex === _this.graduationCount - 1
            || (_this.currentIndex === 0
              && _this.isManually)
          ) && !_this.isDownPause
          ) {
            _this._transition()
          } else {
            _this._run()
          }
        })
  },
  /**
   * 执行
   * @private
   */
  _run: function() {
    this.caller
      .find('.time-graduation')
      .eq(this.prevIndex)
      .find('p')
      .animate(
        {'fontSize': 12},
        300)
      .css('color', '#333333')

    this.caller
      .find('.time-graduation')
      .eq(this.currentIndex)
      .find('p')
      .animate(
        {'fontSize': 14},
        300)
      .css('color', '#ff8400')

    this.isManually = false
    this.isDownPause = undefined
    this.prevIndex = this.currentIndex

    //到达指定刻度，执行回调函数
    if(typeof this.callback === 'function') {
      this.callbackFun()
    }
  },
  /**
   * 周期过渡（从最后一个刻度到第一个刻度的方式）
   * @private
   */
  _transition: function() {
    var _this = this
    if(!_this.playOnce) {
      if(_this.firstIndex === _this.graduationCount - 1) {
        if(this.transition) {
          _this.transitionStatus()
          _this._run()
        } else {
          _this.caller
            .find('.time-bg span')
            .css('left', 0)
        }

        _this.start(0, false)
      } else {
        if(_this.transition) {
          _this.transitionStatus()
          _this._run()
          _this.start(0, false)
        } else {
          setTimeout(
            function() {
              _this.caller
                .find('.time-bg span')
                .css('left', 0)

              _this.start(0, false)
            },
            _this.autoPlaySpeed
          )
        }
      }
    } else {
      _this.autoPlay = false
      _this.playOnce = false
    }
  },
  /**
   * 过渡状态
   */
  transitionStatus: function() {
    var _this = this
    _this.inoperable = true

    _this.caller
      .find('.time-bg div')
      .animate(
        {opacity: 0.4},
        500
      )

    setTimeout(function() {
        _this.caller
          .find('.time-bg div')
          .animate(
            {opacity: 1},
            500,
            function() {
              _this.inoperable = false
            }
          )
      },
      _this.autoPlaySpeed - 500)
  },
  /**
   * 回调函数初始化
   */
  callbackFun: function() {
    var time = this.caller
      .find('.time-graduation')
      .eq(this.currentIndex)
      .data('time')

    this.callback({
      date: time || '',
      dateArray: time.split(/[-./]/) || [],
      dateString: new Date(Date.parse(time)) || ''
    })
  },
  /**
   * 不可操作状态
   */
  inoperableChange: function() {
    var _this = this

    setTimeout(function() {
        _this.inoperable = false

        _this.caller
          .find('.time-oper')
          .animate(
            {'opacity': 1},
            300
          )
      },
      _this.autoPlaySpeed / 30 < _this.clickSpeed
        ? _this.clickSpeed
        : _this.autoPlaySpeed / 30
    )
  },
  /**
   * 事件
   * @private
   */
  _event: function() {
    var _this = this

    $(window).resize(function(e) {
      _this.reLayout()
      e.stopPropagation()
    })

    _this.caller
      .find('.time-status')
      .click(function(e) {
        if(_this.isPause) {
          _this.repeatScale = false
        } else {
          _this.repeatScale = undefined
        }

        _this.autoPlay = true
        _this.firstIndex = _this.currentIndex
        _this.pause()

        e.stopPropagation()
      })

    _this.caller
      .find('.time-prev')
      .click(function(e) {
        if(!_this.inoperable) {
          _this.caller
            .find('.time-oper')
            .css('opacity', 0.1)

          _this.inoperable = true
          _this.firstIndex = _this.currentIndex
          _this.isDownPause = _this.isPause
          _this.isManually = true

          if(!_this.isPause) {
            _this.pause()
            _this.currentIndex = _this.closestGraduation(true)
          } else {
            _this.currentIndex = --_this.currentIndex === -1
              ? _this.graduationCount - 1
              : _this.currentIndex
          }

          _this.resetGraduation()
          _this.inoperableChange()
        }

        e.stopPropagation()
      })

    _this.caller
      .find('.time-next')
      .click(function(e) {
        if(!_this.inoperable) {
          _this.caller
            .find('.time-oper')
            .css('opacity', 0.1)

          _this.inoperable = true
          _this.firstIndex = _this.currentIndex
          _this.isDownPause = _this.isPause
          _this.isManually = true

          if(!_this.isPause) {
            _this.currentIndex++
            _this.pause()
          } else {
            _this.currentIndex = ++_this.currentIndex === _this.graduationCount
              ? 0
              : _this.currentIndex
          }

          _this.resetGraduation()
          _this.inoperableChange()
        }

        e.stopPropagation()
      })

    _this.caller
      .find('.time-bg span')
      .on('mousedown', function(e) {
        _this.move()
        e.stopPropagation()
      })

    _this.caller
      .find('.time-bg span')
      .on('mouseup', function(e) {
        _this.mouseUp()
        e.stopPropagation()
      })
  }
}
