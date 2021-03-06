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
 * @date 2014-11-15 19:08
 * @param {Object} options 控件初始化参数.
 */
hui.define('hui_panel', ['hui_control'], function () {
    hui.Panel = function (options, pending) {
        this.isFormItem = false;
        hui.Panel.superClass.call(this, options, 'pending');

        this.controlMap = [];

        // 进入控件处理主流程!
        if (pending != 'pending') {
            this.enterControl();
        }
    };

    hui.Panel.prototype = {
        /**
         * @name 绘制对话框
         * @public
         */
        render: function (options) {
            hui.Panel.superClass.prototype.render.call(this);
            var me = this;
            // 渲染对话框
            hui.Control.init(me.getMain(), {}, me);
        }

    };

    // hui.Panel 继承了 hui.Control 
    hui.inherits(hui.Panel, hui.Control);

});