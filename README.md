
# autoTime 
##可回调时间拖动条

点击查看 [demo](http://www.xieyangogo.cn/autoTime)

---

#### 注意事项：
* 发现bug或技术上的交流请发邮件到：[xyzsyx@163.com]()
* 本插件依赖jQuery库
* 当插件父容器的宽度发生改变，且本插件没有自动调整布局时，请手动调用本插件重新布局方法：

		AutoTime.reLayout(delay);

	参数delay为延迟执行的毫秒数（如有动画，重新布局应在发生宽度改变动画结束后调用）

* 已知Bug

		transition: true //执行第一刻度时有延迟
        transition: false //游标到达最后一个刻度时刻度样式未变及未执行回调

-----
#### 使用方法：

1. 导入样式表
    ```HTML
    <link rel="stylesheet" type="text/css" href="styles/autoTime.css"></link>
    ```
    
2. 导入jquery库文件和autoTime.js
	```HTML
    <script src="http://code.jquery.com/jquery-1.9.1.min.js"></script>
    <script src="scripts/autoTime.js"></script>
    ```
3. DOM
	```HTML
    <div class="autoTime" id="autoTime1">
        <ul class="time-bgs">
            <li class="time-left"></li>
            <li class="time-bg">
                <div><span></span></div>
            </li>
            <li class="time-right"></li>
            <li class="time-oper">
                <i class="time-prev"></i>
                <i class="time-status"></i>
                <i class="time-next"></i>
            </li>
            <li class="time-position">
                <ul class="time-graduationCon"></ul>
            </li>
        </ul>
    </div>
    ```
4. 调用 / 初始化 
	```javaScript
	var autoTime = new AutoTime($("#autoTime"));
	```
---

* 参数

**AutoTime(object[,option][,callback]) {**

>**_object_** (必需): **_{jQuery | $}_**
>
>     jQuery对象 或 css选择器
>
>---
>
>**_option_** (可选): **_{Object}_**
>
>     配置参数集合
>
>>#####配置参数
>>##### **_autoPlay_**: *{boolean}* default true
>>
>>     载入时是否自动播放
>>
>>##### **_playOnce_**: *{boolean}* default false
>>     是否只自动播放一次，依赖 autoPlay=true
>>
>>##### **_transition_**: *{boolean}* default false
>>     是否启用周期倒退过渡，依赖 autoPlay=true
>>     当游标到达时间轴末尾时，自动使用动画回退游标到时间轴起始位置,否则直接跳到起始位置开始下一周期
>>
>>##### **_autoPlaySpeed_**: *{number}* default 4000ms
>>     播放一个完整刻度的时间（ms），依赖 autoPlay=true
>>
>>##### **_buttonPosition_**: *{string}* default "right"
>>     操作按钮相对于组件的位置（可选值“left”、“right”或“”）
>>
>>##### **_clickSpeed_**: *{number}* default 1000
>>     点击按钮最低时间间隔
>>
>>##### **_range_**: *{[Array, string]}*
>>     时间轴刻度值数组
>>>
>>>######数组元素释义
>>>    
>>>     Array 时间轴刻度值（支持三种时间格式，1970-1-1、1970/1/1或1970.1.1）
>>>     string 时间显示类型（可选值“year”[默认]、“month”或“day”）
>
>---
>
>**_callback_** (可选): **_{Object}_**
>
>     回调函数

---
* 方法

>**_reLayout([delay])_**
>
>     重新布局函数
>     参数delay可选，默认0
>
>**_pause()_**
>
>     暂停/继续
>     当处于播放状态时，调用此函数暂停
>     当处于暂停状态时，调用此函数继续播放
>
>**_resetGraduation()_**
>
>     重置刻度
>
>**_closestGraduation()_**
>
>     获取离游标最近的一个刻度点
