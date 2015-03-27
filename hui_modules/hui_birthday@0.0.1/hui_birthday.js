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
 * @name 生日选择控件
 * @public
 * @author haiyang5210
 * @date 2014-11-16 23:25
 */
hui.define('hui_birthday', ['hui_dropdown'], function () {
    hui.Birthday = function (options, pending) {
        hui.Birthday.superClass.call(this, options, 'pending');
        
        //进入控件处理主流程!
        if (pending != 'pending') {
            this.enterControl();
        }
    };

    hui.Birthday.prototype = {
        getTpl: function () {
            //<div ui="type:'BirthdayDropdown',formName:'birthday',rule:'birthday'">
            var tpl = [
                '<div ui="type:\'Dropdown\',formName:\'yy\',placeholder:\'- 年 -\',value:\'\',optionEnd:1900,optionStart:(new Date()).getFullYear(),optionStep:-1,size:{width:90,scrollTop:700}"></div>',
                '<div ui="type:\'Dropdown\',formName:\'mm\',placeholder:\'- 月 -\',value:\'\',optionStart:1,optionEnd:12,optionStep:1,size:{width:86}"></div>',
                '<div ui="type:\'Dropdown\',formName:\'dd\',placeholder:\'- 日 -\',value:\'\',optionStart:1,optionEnd:31,optionStep:1,size:{width:86}"></div>'
            ].join('\n');
            return tpl;
        },
        /**
         * @name 渲染控件
         * @public
         */
        render: function () {
            hui.Birthday.superClass.prototype.render.call(this);
            var me = this,
                main = me.getMain();
            me.setInnerHTML(me.getTpl());
            hui.Control.init(main);
        },
        initBehavior: function () {
            var me = this,
                yy = me.getByFormName('yy'),
                mm = me.getByFormName('mm');
            yy.onchange = hui.fn(me.updateMonth, me);
            mm.onchange = hui.fn(me.updateDay, me);
        },
        updateMonth: function () {
            var me = this,
                yy = me.getByFormName('yy'),
                dd = me.getByFormName('dd'),
                mm = me.getByFormName('mm'),
                y = yy.getValue(),
                now = !me.maxDate || me.maxDate === 'now' ? new Date() : hui.parseDate(me.maxDate);
            if (me.maxDate && y >= now.getFullYear()) {
                mm.optionEnd = now.getMonth() + 1;
                mm.setOptions();
            }

            if (!mm.getValue()) {
                mm.setValue(1);
            }
            if (!dd.getValue()) {
                dd.setValue(1);
            }
            me.updateDay();
        },
        updateDay: function () {
            var me = this,
                dd = me.getByFormName('dd'),
                mm = me.getByFormName('mm'),
                yy = me.getByFormName('yy'),
                y = yy.getValue() || 2000,
                m = Number(mm.getValue()),
                now = !me.maxDate || me.maxDate === 'now' ? new Date() : hui.parseDate(me.maxDate);
            if (m) {
                if (m === 2) {
                    if ((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0) {
                        dd.optionEnd = 29;
                    }
                    else {
                        dd.optionEnd = 28;
                    }
                }
                else {
                    if (m === 4 || m === 6 || m === 9 || m === 11) {
                        dd.optionEnd = 30;
                    }
                    else {
                        dd.optionEnd = 31;
                    }
                }
                if (me.maxDate && yy.getValue() >= now.getFullYear() && mm.getValue() >= now.getMonth() + 1) {
                    dd.optionEnd = now.getDate();
                }
                if (dd.getValue() > dd.optionEnd) {
                    dd.setValue(dd.optionEnd);
                }

                dd.setOptions();
            }
        },
        getValue: function () {
            var me = this,
                dd = me.getByFormName('dd'),
                mm = me.getByFormName('mm'),
                yy = me.getByFormName('yy'),
                d = dd.getValue(),
                m = mm.getValue(),
                y = yy.getValue();
            return y && m && d ? y + '-' + m + '-' + d : '';
        },
        setValue: function (v) {
            var me = this,
                dd = me.getByFormName('dd'),
                mm = me.getByFormName('mm'),
                yy = me.getByFormName('yy'),
                date = hui.util.parseDate(v);
            yy.setValue(date.getFullYear());
            mm.setValue(date.getMonth() + 1);
            dd.setValue(date.getDate());
        }
    };

    /* hui.Birthday 继承了 hui.Control */
    hui.inherits(hui.Birthday, hui.Control);
});