/* jshint strict: false */
//   __    __           ______   ______  _____    __  __     
//  /\ \  /\ \ /'\_/`\ /\  _  \ /\__  _\/\  __`\ /\ \/\ \    
//  \ `\`\\/'//\      \\ \ \/\ \\/_/\ \/\ \ \/\ \\ \ \ \ \   
//   `\ `\ /' \ \ \__\ \\ \  __ \  \ \ \ \ \ \ \ \\ \ \ \ \  
//     `\ \ \  \ \ \_/\ \\ \ \/\ \  \ \ \ \ \ \_\ \\ \ \_\ \ 
//       \ \_\  \ \_\\ \_\\ \_\ \_\  \ \_\ \ \_____\\ \_____\
//        \/_/   \/_/ \/_/ \/_/\/_/   \/_/  \/_____/ \/_____/
//                                                                   

/**
 * @name HUI是一个富客户端应用的前端MVC框架
 * @public
 * @author haiyang5210
 * @date 2014-11-14 10:48
 */

// 使用window.hui定义可能会导致速度下降约7倍
var hui = {};
hui.runWithoutStrict = function (key, data) {
    return (new Function('data', 'with(data){return ' + key + ';}'))(data);
};
'use strict';

// hui.require('./module')
hui.require = function (n, conf) {
    // conf is {source:'hjfile.com'} or callback function
    if (n && Object.prototype.toString.call(n) === '[object Array]') {
        hui.define('', n, conf);
    }
    else if (n && typeof n === 'string') {
        if (!hui.require.checkLoaded(n, conf)) {
            hui.require.loaded.push(n);
            var src = hui.require.parseModuleUrl(n, conf, 'js');
            var script = document.createElement('script');
            script.src = src + (~src.indexOf('?') ? '&' : '?') + 'random=' + String(Math.random()).substr(5, 4);
            document.getElementsByTagName('head')[0].appendChild(script);
        }
        else {
            var mod = hui.define.getModule(n);
            if (mod) {
                hui.define.loadModulesLeft(mod);
            }
        }
        if (conf) {
            hui.define('', [n], conf);
        }
    }

};
hui.require.loaded = [];
hui.require.checkLoaded = function (n, conf) {
    var loaded = !!hui.define.getModule(n, conf);
    if (!loaded) {
        for (var i = 0, len = hui.require.loaded.length; i < len; i++) {
            if (hui.require.loaded[i].split('@')[0].replace('./', '') === n) {
                loaded = true;
                break;
            }
        }
    }
    return loaded;
};
hui.require.parseModuleUrl = function (n, conf, type) {
    // var url;
    // var m = n.replace('./', '');
    var fname = n.split('@')[0].replace('./', '') + '.' + type;

    // if (n.indexOf('./') === 0) {
    //     url = (conf && conf.source ? conf.source : './') + 'hui_modules/' + m + '/' +
    //         (conf && conf.fileName ? conf.fileName : fname);
    // }
    // else {
    //     url = window.location.protocol + '//' + window.location.host + '/hui_modules/' + m + '/' +
    //         (conf && conf.fileName ? conf.fileName : fname);
    // }

    // return url;
    return 'hui_modules/' + String(fname).replace('.js', '') + '/' + fname;
};

// Nodejs support 'require' and does not support 'define', browser does not supported both. 

//define('lib_module',['lib@0.0.1','json@0.0.1'], function(exports){exports.todo='...';});
hui.define = function (name, deps, fun) {
    //Name missing. Allow for anonymous modules
    name = typeof name !== 'string' ? '' : String(name).toLowerCase();
    deps = deps && deps.splice && deps.length ? deps : [];
    var left = [];
    for (var i = 0, len = deps.length; i < len; i++) {
        left.push(String(deps[i]).toLowerCase());
    }
    hui.define.modules = hui.define.modules || [];
    var conf = {
        name: name,
        depend: deps,
        left: left,
        todo: fun,
        loaded: false,
        exports: {}
    };
    hui.define.modules.push(conf);

    hui.define.checkDepend();

    hui.define.loadModulesLeft(conf);
};
hui.define.loadModulesLeft = function (conf) {
    if (hui.define.autoload !== false) {
        for (var i = 0, len = conf.left.length; i < len; i++) {
            //'#/biz' need handle load.
            if (conf.left[i].indexOf('#/') == -1) {
                hui.require(conf.left[i]);
            }
        }
    }
};
hui.define.autoload = false;
hui.define.loaded = [];
hui.define.checkDepend = function () {
    hui.define.modules = hui.define.modules || [];
    // 注: 只能用倒序, 否则会碰到依赖项未定义的错误
    for (var i = hui.define.modules.length - 1; i > -1; i--) {
        var m = hui.define.modules[i];

        for (var j = 0, len2 = hui.define.loaded.length; j < len2; j++) {
            var n = hui.define.loaded[j];
            for (var k = m.left.length - 1; k > -1; k--) {
                if (m.left[k].replace('./', '').split('@')[0] == n) {
                    m.left.splice(k, 1);
                }
            }
        }

        if (!m.loaded && m.left.length < 1) {
            m.loaded = true;
            // 放在前面未执行todo就放到loaded中了，会误触其他函数的todo，只能放在后面
            // [注: push放在这里则后面检测依赖只能用倒序，放在后面不好实现][有误]
            m.todo(m.exports);
            // 放在todo前面有问题，依赖项刚加载还没来得及执行就触发了其他依赖此项的todo，会报依赖项未定义的错误
            m.name && hui.define.loaded.push(m.name);

            i = hui.define.modules.length;
        }
    }
};

hui.define.getModule = function (n) {
    n = n.split('@')[0].replace('./', '');
    var module = null;
    if (hui.define.modules) {
        for (var i = 0, len = hui.define.modules.length; i < len; i++) {
            if (hui.define.modules[i] && hui.define.modules[i].name === n) {
                module = hui.define.modules[i];
                break;
            }
        }
    }
    return module;
};

// 注：查看漏加载的模块!!
hui.define.left = function () {
    var left = [];
    for (var i = 0, len = hui.define.modules.length; i < len; i++) {
        left = left.concat(hui.define.modules[i].left);
    }
    return left;
};

hui.define.loadLeft = function () {
    var list = hui.define.left();
    for (var i = 0, len = list.length; i < len; i++) {
        hui.require(list[i]);
    }
};

// 注：加载并解析完本文件内后面的模块后需恢复define.autoload = true;
hui.define.autoload = false;

hui.define('hui', [], function () {
    // !!! global.hui = ...
    if (typeof window != 'undefined' && !window.hui) {
        window.hui = {};
    }
    if (window.hui) {
        window.hui.window = window; /*hui.bocument = document;//注：hui.bocument与document不相同!!*/
    }

    /** 
     * @name 为对象绑定方法和作用域
     * @param {Function|String} handler 要绑定的函数，或者一个在作用域下可用的函数名
     * @param {Object} obj 执行运行时this，如果不传入则运行时this为函数本身
     * @param {args* 0..n} args 函数执行时附加到执行时函数前面的参数
     * @returns {Function} 封装后的函数
     */
    hui.fn = function (func, scope) {
        if (Object.prototype.toString.call(func) === '[object String]') {
            func = scope[func];
        }
        if (Object.prototype.toString.call(func) !== '[object Function]') {
            throw 'Error "hui.util.fn()": "func" is null';
        }
        var xargs = arguments.length > 2 ? [].slice.call(arguments, 2) : null;
        return function () {
            var fn = '[object String]' == Object.prototype.toString.call(func) ? scope[func] : func,
                args = (xargs) ? xargs.concat([].slice.call(arguments, 0)) : arguments;
            return fn.apply(scope || fn, args);
        };
    };

    /**
 * @name 原型继承
 * @public
 * @param {Class} child 子类
 * @param {Class} parent 父类
 * @example 
    hui.ChildControl = function (options, pending) {
        //如果使用this.constructor.superClass.call将无法继续继承此子类,否则会造成死循环!!
        hui.ChildControl.superClass.call(this, options, 'pending');
        //进入控件处理主流程!
        if (pending != 'pending') {
            this.enterControl();
        }
    };
    hui.Form.prototype = {
        render: function () {
            hui.Form.superClass.prototype.render.call(this);
            //Todo...
        }
    };
    hui.inherits(hui.Form, hui.Control);
 */
    hui.inherits = function (child, parent) {
        var clazz = new Function();
        clazz.prototype = parent.prototype;

        var childProperty = child.prototype;
        child.prototype = new clazz();

        for (var key in childProperty) {
            if (childProperty.hasOwnProperty(key)) {
                child.prototype[key] = childProperty[key];
            }
        }

        child.prototype.constructor = child;

        //child是一个function
        //使用super在IE下会报错!!!
        child.superClass = parent;
    };

});