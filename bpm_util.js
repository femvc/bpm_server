'use strict';

var util = {
    /** 
     * @name 对目标字符串进行格式化
     * @public
     * @param {String} source 目标字符串
     * @param {Object|String...} opts 提供相应数据的对象或多个字符串
     * @return {String} 格式化后的字符串
     */
    format: function (source, opts) {
        source = String(source);
        var data = Array.prototype.slice.call(arguments, 1),
            toString = Object.prototype.toString;
        if (data.length) {
            data = (data.length == 1 ?
                /* ie 下 Object.prototype.toString.call(null) == '[object Object]' */
                (opts !== null && (/\[object (Array|Object)\]/.test(toString.call(opts))) ? opts : data) : data);
            return source.replace(/#\{(.+?)\}/g, function (match, key) {
                var parts = key.split('.'),
                    part = parts.shift(),
                    cur = data,
                    variable;
                while (part) {
                    if (cur[part] !== undefined) {
                        cur = cur[part];
                    }
                    else {
                        cur = undefined;
                        break;
                    }
                    part = parts.shift();
                }
                variable = cur;

                if ('[object Function]' === toString.call(variable)) {
                    variable = variable(key);
                }
                return (undefined === variable ? '' : variable);
            });
        }
        return source;
    },
    formatDate: function (date, fmt) {
        if (!date) date = new Date();
        fmt = fmt || 'yyyy-MM-dd HH:mm';
        var o = {
            'M+': date.getMonth() + 1, //月份      
            'd+': date.getDate(), //日      
            'h+': date.getHours() % 12 === 0 ? 12 : date.getHours() % 12, //小时      
            'H+': date.getHours(), //小时      
            'm+': date.getMinutes(), //分      
            's+': date.getSeconds(), //秒      
            'q+': Math.floor((date.getMonth() + 3) / 3), //季度      
            'S': date.getMilliseconds() //毫秒      
        };
        var week = {
            '0': '/u65e5',
            '1': '/u4e00',
            '2': '/u4e8c',
            '3': '/u4e09',
            '4': '/u56db',
            '5': '/u4e94',
            '6': '/u516d'
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
        }
        if (/(E+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? '/u661f/u671f' : '/u5468') : '') + week[date.getDay() + '']);
        }
        for (var k in o) {
            if (o.hasOwnProperty(k) && new RegExp('(' + k + ')').test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
            }
        }
        return fmt;
    },
    encode: function (str, decode) {
        str = String(str);
        // encodeURIComponent not encode '
        var fr = '%| |&|;|=|+|<|>|,|"|\'|#|/|\\|\n|\r|\t'.split('|'),
            to = '%25|%20|%26|%3B|%3D|%2B|%3C|%3E|%2C|%22|%27|%23|%2F|%5C|%0A|%0D|%09'.split('|');
        if (decode == 'decode') {
            for (var i = fr.length - 1; i > -1; i--) {
                str = str.replace(new RegExp('\\' + to[i], 'ig'), fr[i]);
            }
        }
        else {
            for (var i = 0, l = fr.length; i < l; i++) {
                str = str.replace(new RegExp('\\' + fr[i], 'ig'), to[i]);
            }
        }
        return str;
    },
    decode: function (str) {
        return this.encode(str, 'decode');
    },
    encodehtml: function (str, decode) {
        str = String(str);
        // encodeURIComponent not encode '
        var fr = '&|<|>| |\'|"|\\'.split('|'),
            to = '&amp;|&lt;|&gt;|&nbsp;|&apos;|&quot;|&#92;'.split('|');
        if (decode == 'decode') {
            for (var i = fr.length - 1; i > -1; i--) {
                str = str.replace(new RegExp('\\' + to[i], 'ig'), fr[i]);
            }
        }
        else {
            for (var i = 0, l = fr.length; i < l; i++) {
                str = str.replace(new RegExp('\\' + fr[i], 'ig'), to[i]);
            }
        }
        return str;
    },
    decodehtml: function (str) {
        return this.encodehtml(str, 'decode');
    },
    versionCompare: function (a, b) {
        var result = true;
        var m = String(a).split('.');
        var n = String(b).split('.');
        for (var i = 0, len = m.length; i < len; i++) {
            result = result && parseInt('0' + m[i], 10) >= parseInt('0' + n[i], 10);
        }
        return a === '*' || a === '' ? true : (b === '*' || b === '' ? false : result);
    }
};

exports.util = util;