'use strict';
//   __    __           ______   ______  _____    __  __     
//  /\ \  /\ \ /'\_/`\ /\  _  \ /\__  _\/\  __`\ /\ \/\ \    
//  \ `\`\\/'//\      \\ \ \/\ \\/_/\ \/\ \ \/\ \\ \ \ \ \   
//   `\ `\ /' \ \ \__\ \\ \  __ \  \ \ \ \ \ \ \ \\ \ \ \ \  
//     `\ \ \  \ \ \_/\ \\ \ \/\ \  \ \ \ \ \ \_\ \\ \ \_\ \ 
//       \ \_\  \ \_\\ \_\\ \_\ \_\  \ \_\ \ \_____\\ \_____\
//        \/_/   \/_/ \/_/ \/_/\/_/   \/_/  \/_____/ \/_____/
//                                                                   

/**
 * @name 组件
 * @public
 * @author haiyang5210
 * @date 2014-11-15 19:28
 * @param {Object} options 控件初始化参数.
 */
hui.define('hui_boxpanel', ['hui_util', 'hui_control'], function () {
    hui.Boxpanel = function (options, pending) {
        this.isFormItem = false;
        hui.Boxpanel.superClass.call(this, options, 'pending');

        this.controlMap = [];

        // 进入控件处理主流程!
        if (pending != 'pending') {
            this.enterControl();
        }
    };

    hui.Boxpanel.prototype = {
        /**
         * @name 绘制对话框
         * @public
         */
        render: function (options) {
            hui.Boxpanel.superClass.prototype.render.call(this);
            var me = this;
            me.setSize();
            // 渲染对话框
            hui.Control.init(me.getMain(), {}, me);
        },
        initBehavior: function () {
            var me = this;
            me.onresizeHandler = hui.fn(me.onresize, me);
            if (!hui.cc(me.getClass('close'), me.getMain())) {
                me.addCloseButton();
            }
        },
        show: function () {
            var me = this;
            hui.on(window, 'resize', me.onresizeHandler);
            hui.addClass(document.documentElement, me.getClass('html'));

            hui.Mask && hui.Mask.show();
            me.getMain().style.display = 'block';
            me.onresizeCallback();
        },
        hide: function () {
            var me = this;
            hui.off(window, 'resize', me.onresizeHandler);
            hui.removeClass(document.documentElement, me.getClass('html'));
            me.getMain().style.display = 'none';
            hui.Mask && hui.Mask.hide();
        },
        onresize: function () {
            var me = this;
            if (me.onresizeTimer) {
                window.clearTimeout(me.onresizeTimer);
            }
            me.onresizeTimer = window.setTimeout(hui.fn(me.onresizeCallback, me), 30);
        },
        onresizeCallback: function () {
            var me = this,
                main = me.getMain();
            me.onresizeTimer = null;

            var top = Math.round(Math.max(0, (document.documentElement.clientHeight - main.clientHeight) * (me.top || 0.3)));
            var left = Math.round(Math.max(0, (document.documentElement.clientWidth - main.clientWidth) * (me.left || 0.5)));
            // IE6
            if (window.ActiveXObject && !window.XMLHttpRequest) {
                main.style.setExpression('top', 'eval(document.documentElement.scrollTop  + Math.max(0, (document.documentElement.clientHeight - 500)*0.4))');
                main.style.setExpression('left', 'eval(document.documentElement.scrollLeft + Math.max(0, (document.documentElement.clientWidth - 427))/2)');
            }
            else {
                hui.util.importCssString('.' + me.getClass() + '{top:' + top + 'px;left:' + left + 'px; margin-left:0px;}', me.getClass('7181549444794655'));
            }

            hui.Mask && hui.Mask.repaintMask();
        },
        addCloseButton: function () {
            var me = this,
                main = me.getMain(),
                btn_close = document.createElement('A');
            btn_close.href = 'javascript:';
            btn_close.innerHTML = '╳';
            btn_close.className = me.getClass('close');
            main.insertBefore(btn_close, main.firstChild);

            btn_close.onclick = hui.fn(function () {
                this.hide();
            }, me);
        },
        getValue: function () {
            return this.getParamMap();
        }

    };

    // hui.Boxpanel 继承了 hui.Control 
    hui.inherits(hui.Boxpanel, hui.Control);

    hui.util.importCssString(
        '.hui_boxpanel_html{background-image: url(#);background-attachment: fixed;}' +
        '.hui_boxpanel{z-index: 9000000;position: fixed; _position: absolute; _top: expression(document.documentElement.scrollTop + Math.max(0, (document.documentElement.clientHeight - 500)*0.3) + "px"); background-color:white;border: 5px solid #c6c6c6;border-color: rgba(0,0,0,0.3); border-color: #c6c6c6\\0;*border-color: #c6c6c6; border-radius: 5px; display: none;}' +
        '.hui_boxpanel_close{background-color: #8A8A8A;border-radius: 16px;color: #FFFFFF;display: block;font-family: Simsun;font-size: 14px; text-decoration:none; height: 24px;overflow: hidden;padding: 8px 0 0 10px;position: absolute;z-index:9999;right: -16px;top: -16px;width: 22px;}' +
        '.hui_boxpanel_close:hover{background-color: #f62626;color: #fff; }'
    );


});