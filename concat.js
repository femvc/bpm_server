'use strict';
/*
 * GET home page.
 */
var http = require('http'),
    fs = require('fs'),
    path = require('path'),
    crypto = require('crypto'),
    iconv = require('iconv-lite'),
    UglifyJS = require('uglify-js'),
    cleanCSS = new require('clean-css')({
        noAdvanced: true
    }),
    BufferHelper = require('bufferhelper');

var bpm = {};
bpm.util = require('./bpm_util').util;

//压缩js
var minify = function (code) {
    return UglifyJS.minify(code, {
        fromString: true
    });
};
//压缩css
var minicss = function (source) {
    return cleanCSS.minify(source);
    // return cleanCSS.process(code);
};
//设置页面header
var setHeader = function (res) {
    var date = new Date();

    if (!res.getHeader('Accept-Ranges')) res.setHeader('Accept-Ranges', 'bytes');
    if (!res.getHeader('ETag')) res.setHeader('ETag', date.valueOf());
    if (!res.getHeader('Date')) res.setHeader('Date', date.toUTCString());
    if (!res.getHeader('Cache-Control')) res.setHeader('Cache-Control', 'public, max-age=' + (60 * 60 * 24 * 365));
    if (!res.getHeader('Last-Modified')) res.setHeader('Last-Modified', date.toUTCString());
};
//获取生成文件名和绝对路径
var getFileName = function (req) {
    var file = req.query.file;
    var name = [
        (req.query.order ? file : file.split(',').sort().join(',')),
        (req.query.n ? '_n_' + req.query.n.replace(/[^@0-9a-zA-Z\_\-\.\,]/ig, '') : '')
        ].join('');
    var filename = String(name).length < 200 ? name : crypto.createHash('md5').update(name).digest('hex');
    // var tide = parseInt(filename, 36) % 1000;
    return path.normalize('/tide/' + filename);
};
//获取文件夹路径
var getFolderPath = function (filePath) {
    return path.dirname(path.normalize(filePath));
};
//获取文件路径
var getFilePath = function (filename) {
    var url = path.normalize(path.join(__dirname.replace('routes', ''), filename)); // __dirname || process.cwd()
    return url;
};
//按照url获取文件内容
var getFile = function (index, url, callback) {
    var resultdata = '';
    // url = url.replace(/\.\.\//g, '').replace(/\.\//g, '').split('|');
    url = url.split('|');
    if (url[0].indexOf('http') === 0) {
        http.get(url[0], function (p_res) {
            var bfHelper = new BufferHelper();
            if (p_res.statusCode != 404) {
                p_res.on('data', function (chunk) {
                    bfHelper.concat(chunk);
                });
                p_res.on('end', function () {
                    resultdata = bfHelper.toBuffer();
                    resultdata = iconv.decode(resultdata, (url[1] || 'UTF8').toUpperCase());
                    resultdata = iconv.encode(resultdata, 'UTF8');
                    callback(index, '/*path --' + url[0] + '*/\r\n' + resultdata, true);
                });
            }
            else {
                callback(index, '/*Read Error(http) --' + url[0] + '*/\r\n', false);
            }
        });
    }
    else {
        var src = getFilePath(url[0]);
        resultdata = fs.readFile(src, function (err, data) {
            if (!err) {
                resultdata = iconv.encode(data, 'UTF8');
                callback(index, '/*path --' + src + '*/\r\n' + resultdata, true);
            }
            else {
                callback(index, '/*Read Error(file) --' + src + '*/\r\n', false);
            }
        });

    }
};
//合并文件
var mergeFile = function (query, callback) {
    var fsArray = query.filelist;
    var files = [],
        num = 0;
    var cb = function (index, text) {
        num++;
        files[index] = text;
        if (num === fsArray.length) {
            callback(files);
        }
    };
    for (var i=0,len=fsArray.length; i<len; i++) {
        if (query.host && fsArray[i].indexOf('http') !== 0) {
            fsArray[i] = query.host + fsArray[i];
        }
        getFile(i, fsArray[i], cb);
    }
};

//输出内容
var writeContent = function (req, res, type) {
    res.setHeader('Charset', 'utf-8');
    res.setHeader('Content-Type', (type === 'js' ? 'application/javascript;charset=UTF-8' : type === 'css' ? 'text/css;charset=UTF-8' : 'text/plain;charset=UTF-8'));
    if (!req.query || !req.query.filelist || !req.query.filelist.length) {
        res.end('concat abort');
        return;
    }
    if (req.query && req.query.filelist && req.query.filelist.length) {
        // 注：直接输出，不生成缓存文件
        if (req.query.debug && String(req.query.debug) !== 'undefined') {
            mergeFile(req.query, function (files) {
                var code = files.join('\n');
                res.end(code);
            });
        }
        // 注：生成缓存文件再输出
        else {
            var filename = getFileName(req) + '.' + type;
            var filepath = getFilePath(filename);
            fs.exists(filepath, function (exists) {
                if (!exists) {
                    mergeFile(req.query, function (files) {

                        var code = '/**<' + filepath + '>**/' + 
                            (type == 'js' ? minify(files.join('')).code : minicss(files.join('')));

                        var folderPath = getFolderPath(filepath);
                        fs.exists(folderPath, function (flag) {
                            function writeFile() {
                                fs.writeFile(filepath, code, 'utf8', function (err) {
                                    setHeader(res);
                                    res.setHeader('nodetype', 'write');
                                    res.end(code);
                                });
                            }
                            if (!flag) {
                                fs.mkdir(folderPath, function () {
                                    writeFile();
                                });
                            }
                            else {
                                writeFile();
                            }

                        });
                    });
                }
                else {
                    if (req.headers['if-modified-since'] && (new Date().valueOf() - new Date(req.headers['if-modified-since']).valueOf()) < 30 * 60 * 60 * 24) {
                        //exports.removeContentHeaders(res);
                        res.setHeader('nodetype', '');
                        res.statusCode = 304;
                        res.end();
                    }
                    else {
                        setHeader(res);
                        res.setHeader('nodetype', 'read');
                        fs.readFile(filepath, 'utf8', function (err, data) {
                            res.end(data);
                        });

                    }
                }
            });
        }

    }
};

exports.index = function (req, res) {
    res.end('Js minify And Css minify');
};

exports.js = function (req, res) {
    writeContent(req, res, 'js');
};


function getDep(req, cb) {
    
    fs.readFile(path.resolve(__dirname + '/packlist.txt'), function (err, data) {
        if (err) throw err;
        var jsonObj = JSON.parse(data + '}');

        //todo
        var list = [];
        var str = req.query.file || '';
        // {"hui": "*", "hui_control": "*"}

        if (str && str.indexOf('{') === 0) {
            var mod_dep = JSON.parse(String(decodeURIComponent(str)).toLowerCase());
            for (var i in mod_dep) {
                list.push(i + '@' + mod_dep[i]);
            }
        }
        else {
            list = str.split(',');
        }

        var lastVersion = {};
        for (var i in jsonObj) {
            var d = jsonObj[i];
            var m = lastVersion[d.name];
            if (!m || bpm.util.versionCompare(d.version, m.version)) {
                lastVersion[d.name] = d;
            }
        }

        var all_dep = {};
        var result = [];

        while (list.length) {
            var mod = list.pop();
            if (mod) {
                var result = [];
                var name = mod.split('@')[0];
                var version = (mod + '@*').split('@')[1];
                var m = version === '' || version === '*' ? lastVersion[name] : jsonObj[mod];

                all_dep[name] = m;

                if (m && m.dependencies) {
                    for (var i in m.dependencies) {
                        if (!all_dep[i]) {
                            result.push(i + '@' + m.dependencies[i]);
                        }
                    }
                    list = list.concat(result);
                }
            }
        }

        if (!all_dep['hui']) {
            all_dep['hui'] = lastVersion['hui'];
        }

        if (cb) {
            cb(all_dep);
        }
        else return all_dep;
    });
}

exports.getDep = getDep;

//http://localhost:3000/js?file=http://x.libdd.com/farm1/a05baa/fde6509f/jquery.mousewheel-3.0.6.pack.js,http://x.libdd.com/farm1/08871e/95134743/jquery.fancybox-buttons.js
//http://localhost:3000/css?file=http://s.libdd.com/css/base/dd.$7205.css,http://s.libdd.com/css/app/tagpro.$7164.css