/*
酷狗大字版
Last Modified: 2025-10-16
[task_local]
#酷狗大字版
10 0,8,12,18 * * * https://gist.githubusercontent.com/Alex0510/8b958bcf53ed1271e03bb5130b2206ec/raw/kugou_cookie.js, tag=酷狗大字版, img-url=https://raw.githubusercontent.com/Orz-3/mini/master/Color/kugou.png, enabled=true
*/

const $ = new Env('酷狗大字版');
const notify = $.isNode() ? require('./sendNotify') : '';
//Node.js用户请在jdCookie.js处填写酷狗大字版ck;
const kugou_cookie = $.isNode() ? (process.env.kugou_cookie ? process.env.kugou_cookie : "") : ($.getdata('kugou_cookie') ? $.getdata('kugou_cookie') : "");

// ================================= 【新增代码】持久化缓存模块 =================================
// 引入Node.js内置模块
const fs = $.isNode() ? require('fs') : null;
const path = $.isNode() ? require('path') : null;

// 定义缓存文件路径，将其放在脚本相同目录下
const cachePath = $.isNode() ? path.join(__dirname, 'kugou_cache.json') : null;

/**
 * 读取本地缓存文件
 * @returns {object} 解析后的JSON对象，如果失败则返回空对象
 */
function readCache() {
    if (!$.isNode() || !fs) return {}; // 非Node.js环境直接返回
    try {
        if (fs.existsSync(cachePath)) {
            const data = fs.readFileSync(cachePath, 'utf8');
            return JSON.parse(data);
        }
    } catch (e) {
        console.log('读取缓存失败:', e);
    }
    return {}; // 文件不存在或解析失败，返回空对象
}

/**
 * 将数据写入本地缓存文件
 * @param {string} key 要写入的键
 * @param {any} value 要写入的值
 */
function writeCache(key, value) {
    if (!$.isNode() || !fs) return; // 非Node.js环境直接返回
    const cache = readCache();
    cache[key] = value;
    try {
        // 将更新后的对象转换为格式化的JSON字符串并写入文件
        fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2), 'utf8');
    } catch (e) {
        console.log('写入缓存失败:', e);
    }
}
// ================================= 【新增代码结束】 =================================


class KuGou {
    constructor(ck) {
        this.ck = ck;
        this.info_headers = {
            'User-Agent': 'Android7.1.2-AndroidPhone-8250-135-0-V3.3.2-alpha'
        }
        this.headers = {
            'User-Agent': 'okhttp/3.12.1',
            'mid': '2333333333333333',
            'content-type': 'application/json'
        }
        this.time = new Date().getTime();
        this.money = 0
        this.total_money = 0
    }

    async main() {
        if (!this.ck) {
            console.log('未填写ck,退出');
            return;
        }

        // ================================= 【修改代码】读取并展示缓存 =================================
        const cachedUser = readCache()[`user_data`]; // 使用一个固定的key
        if (cachedUser && cachedUser.nickname) {
            const cacheTime = new Date(cachedUser.last_update).getTime();
            const nowTime = new Date().getTime();
            const hoursDiff = (nowTime - cacheTime) / (1000 * 60 * 60);

            console.log(`\n============== [缓存信息] ==============`);
            console.log(`👤 昵称: ${cachedUser.nickname}`);
            console.log(`💰 金币: ${cachedUser.money}`);
            console.log(`上次更新: ${hoursDiff.toFixed(1)} 小时前`);
            console.log(`========================================\n`);
        }
        // ================================= 【修改代码结束】 =================================


        await this.user_info();
        if (this.ck_status) {
            await this.get_ad('video');
            await this.get_ad('welfare');
            await this.listen_song();
            await this.sleep();
            await this.question();
            await this.walk();
        }
    }

    //用户信息
    async user_info() {
        let body = {"appid":0,"clienttime":this.time,"mid":"2333333333333333","key":"1234567890123456"}
        let data = await this.task_info('https://gateway.kugou.com/v1/login/token_login', JSON.stringify(body))
        if (data.status == 1) {
            this.ck_status = true
            this.info_headers['kugoo-sound-server-token'] = data.data.token
            this.headers['token'] = data.data.token
            console.log(`\n欢迎您: ${data.data.nickname}`)
            this.money = data.data.money
            this.total_money = data.data.total_money

            // ================================= 【修改代码】写入缓存 =================================
            const userInfoToCache = {
                nickname: data.data.nickname,
                money: data.data.money,
                total_money: data.data.total_money,
                last_update: new Date().toISOString() // 记录更新时间
            };
            writeCache('user_data', userInfoToCache);
            console.log(`✅ 用户信息已成功缓存至本地`);
            // ================================= 【修改代码结束】 =================================

        } else {
            this.ck_status = false
            console.log('ck失效')
            $.msg('酷狗大字版', "‼️ck失效", `请重新获取酷狗ck`);
        }
    }


    //看视频,福利
    async get_ad(name) {
        let url = ''
        if (name == 'video') {
            url = 'https://gateway.kugou.com/v1/reward/watch_video_new'
        } else if (name == 'welfare') {
            url = 'https://gateway.kugou.com/v1/reward/welfare_center_watch_video'
        }

        for (let i = 0; i < 5; i++) {
            let body = {"time":60,"stay_page":1,"type":1}
            let data = await this.task_info(url, JSON.stringify(body))
            if (data.errcode == 0) {
                this.money = data.data.money
                console.log(`✅看视频成功,获得金币: ${data.data.reward_money}, 当前金币: ${this.money}`)
            } else {
                console.log(`第${i + 1}次看视频: ${data.error_msg}`)
                break
            }
            await $.wait(2000)
        }
    }

    //听歌
    async listen_song() {
        console.log('\n开始执行听歌任务')
        for (let i = 0; i < 10; i++) {
            let body = {"time":300}
            let data = await this.task_info('https://gateway.kugou.com/v1/reward/listen_song', JSON.stringify(body))
            if (data.errcode == 0) {
                this.money = data.data.money
                console.log(`✅听歌成功,获得金币: ${data.data.reward_money}, 当前金币: ${this.money}`)
            } else {
                console.log(`第${i+1}次听歌: ${data.error_msg}`)
                break
            }
            await $.wait(2000)
        }
    }

    //睡觉
    async sleep() {
        console.log('\n开始执行睡觉任务')
        let data = await this.task_info('https://gateway.kugou.com/v1/reward/sleep_new', '{}')
        if (data.errcode == 0) {
            this.money = data.data.money
            console.log(`✅睡觉任务成功,获得金币: ${data.data.reward_money}, 当前金币: ${this.money}`)
        } else {
            console.log(`睡觉任务: ${data.error_msg}`)
        }
        await $.wait(2000)
    }

    //答题
    async question() {
        console.log('\n开始执行答题任务')
        for (let i = 0; i < 5; i++) {
            let data = await this.task_info('https://gateway.kugou.com/v1/reward/question_new', '{"answers":"1"}')
            if (data.errcode == 0) {
                this.money = data.data.money
                console.log(`✅第${i+1}次答题成功,获得金币: ${data.data.reward_money}, 当前金币: ${this.money}`)
            } else {
                console.log(`第${i+1}次答题: ${data.error_msg}`)
                break
            }
            await $.wait(2000)
        }

    }
    //走路
    async walk() {
        console.log('\n开始执行走路任务')
        await this.task_info('https://gateway.kugou.com/v1/reward/walk/sync', '{"step":5000}')
        await $.wait(2000)
        let data = await this.task_info('https://gateway.kugou.com/v1/reward/walk/exchange', '{"step":5000}')
        if (data.errcode == 0) {
            this.money = data.data.money
            console.log(`✅走路任务成功,获得金币: ${data.data.reward_money}, 当前金币: ${this.money}`)
        } else {
            console.log(`走路任务: ${data.error_msg}`)
        }
        await $.wait(2000)
    }



    async task_info(url, body) {
        let GUA_POST_BODY = body
        let new_headers = this.headers
        new_headers['Gua-Post-Body'] = GUA_POST_BODY
        let req = {
            url: url,
            headers: new_headers,
            body: GUA_POST_BODY
        }
        if (url.indexOf('token_login') != -1) {
            req.headers = this.info_headers
            req.headers['content-type'] = 'application/json'
            req.headers['Gua-Post-Body'] = body
        }

        return new Promise((resolve) => {
            $.post(req, (err, resp, data) => {
                if (err) {
                    console.log(err)
                }
                resolve(JSON.parse(data));
            })
        })
    }
}


// Env.js
function Env(t, e) {
    "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0);
    class s {
        constructor(t) {
            this.env = t
        }
        send(t, e = "GET") {
            t = "string" == typeof t ? {
                url: t
            } : t;
            let s = this.get;
            return "POST" === e && (s = this.post), new Promise((e, i) => {
                s.call(this, t, (t, s, r) => {
                    t ? i(t) : e(s)
                })
            })
        }
        get(t) {
            return this.send.call(this.env, t)
        }
        post(t) {
            return this.send.call(this.env, t, "POST")
        }
    }
    return new class {
        constructor(t, e) {
            this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`)
        }
        isNode() {
            return "undefined" != typeof module && !!module.exports
        }
        isQuanX() {
            return "undefined" != typeof $task
        }
        isSurge() {
            return "undefined" != typeof $httpClient && "undefined" == typeof $loon
        }
        isLoon() {
            return "undefined" != typeof $loon
        }
        toObj(t, e = null) {
            try {
                return JSON.parse(t)
            } catch {
                return e
            }
        }
        toStr(t, e = null) {
            try {
                return JSON.stringify(t)
            } catch {
                return e
            }
        }
        getjson(t, e) {
            let s = e;
            const i = this.getdata(t);
            if (i) try {
                s = JSON.parse(this.getdata(t))
            } catch {}
            return s
        }
        setjson(t, e) {
            try {
                return this.setdata(JSON.stringify(t), e)
            } catch {
                return !1
            }
        }
        getScript(t) {
            return new Promise(e => {
                this.get({
                    url: t
                }, (t, s, i) => e(i))
            })
        }
        runScript(t, e) {
            return new Promise(s => {
                let i = this.getdata("@chavy_boxjs_userCfgs.httpapi");
                i = i ? i.replace(/\n/g, "").trim() : i;
                let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");
                r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r;
                const [o, h] = i.split("@"), n = {
                    url: `http://${h}/v1/scripting/evaluate`,
                    body: {
                        script_text: t,
                        mock_type: "cron",
                        timeout: r
                    },
                    headers: {
                        "X-Key": o,
                        Accept: "*/*"
                    }
                };
                this.post(n, (t, e, i) => s(i))
            }).catch(t => this.logErr(t))
        }
        loaddata() {
            if (!this.isNode()) return {}; {
                this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path");
                const t = this.path.resolve(this.dataFile),
                    e = this.path.resolve(process.cwd(), this.dataFile),
                    s = this.fs.existsSync(t),
                    i = !s && this.fs.existsSync(e);
                if (!s && !i) return {}; {
                    const i = s ? t : e;
                    try {
                        return JSON.parse(this.fs.readFileSync(i))
                    } catch (t) {
                        return {}
                    }
                }
            }
        }
        writedata() {
            if (this.isNode()) {
                this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path");
                const t = this.path.resolve(this.dataFile),
                    e = this.path.resolve(process.cwd(), this.dataFile),
                    s = this.fs.existsSync(t),
                    i = !s && this.fs.existsSync(e),
                    r = JSON.stringify(this.data);
                s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r)
            }
        }
        lodash(t, e) {
            const s = this.getdata("lodash_㸽");
            if (s) try {
                return eval(s)(t, e)
            } catch (t) {
                return
            }
        }
        getkey() {
            const t = (new Date).getTime();
            return `nodegua_${t}_${Math.floor(1e3*Math.random())}`
        }
        getdata(t) {
            let e = this.getval(t);
            if (/^@/.test(t)) {
                const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : "";
                if (r) try {
                    const t = JSON.parse(r);
                    e = t ? this.lodash(t, i) : ""
                } catch (t) {
                    e = ""
                }
            }
            return e
        }
        setdata(t, e) {
            let s = !1;
            if (/^@/.test(e)) {
                const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}";
                try {
                    const e = JSON.parse(h);
                    this.lodash(e, r, t), s = this.setval(JSON.stringify(e), i)
                } catch (e) {
                    const o = {};
                    this.lodash(o, r, t), s = this.setval(JSON.stringify(o), i)
                }
            } else s = this.setval(t, e);
            return s
        }
        getval(t) {
            return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null
        }
        setval(t, e) {
            return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null
        }
        initGotEnv(t) {
            this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar))
        }
        get(t, e = (() => {})) {
            t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, {
                "X-Surge-Skip-Scripting": !1
            })), $httpClient.get(t, (t, s, i) => {
                !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i)
            })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {
                hints: !1
            })), $task.fetch(t).then(t => {
                const {
                    statusCode: s,
                    statusCode: i,
                    headers: r,
                    body: o
                } = t;
                e(null, {
                    status: s,
                    statusCode: i,
                    headers: r,
                    body: o
                }, o)
            }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => {
                try {
                    if (t.headers["set-cookie"]) {
                        const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();
                        s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar
                    }
                } catch (t) {
                    this.logErr(t)
                }
            }).then(t => {
                const {
                    statusCode: s,
                    statusCode: i,
                    headers: r,
                    body: o
                } = t;
                e(null, {
                    status: s,
                    statusCode: i,
                    headers: r,
                    body: o
                }, o)
            }, t => {
                const {
                    message: s,
                    response: i
                } = t;
                e(s, i, i && i.body)
            }))
        }
        post(t, e = (() => {})) {
            if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, {
                "X-Surge-Skip-Scripting": !1
            })), $httpClient.post(t, (t, s, i) => {
                !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i)
            });
            else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {
                hints: !1
            })), $task.fetch(t).then(t => {
                const {
                    statusCode: s,
                    statusCode: i,
                    headers: r,
                    body: o
                } = t;
                e(null, {
                    status: s,
                    statusCode: i,
                    headers: r,
                    body: o
                }, o)
            }, t => e(t));
            else if (this.isNode()) {
                this.initGotEnv(t);
                const {
                    url: s,
                    ...i
                } = t;
                this.got.post(s, i).then(t => {
                    const {
                        statusCode: s,
                        statusCode: i,
                        headers: r,
                        body: o
                    } = t;
                    e(null, {
                        status: s,
                        statusCode: i,
                        headers: r,
                        body: o
                    }, o)
                }, t => {
                    const {
                        message: s,
                        response: i
                    } = t;
                    e(s, i, i && i.body)
                })
            }
        }
        time(t, e = null) {
            const s = e ? new Date(e) : new Date;
            let i = {
                "M+": s.getMonth() + 1,
                "d+": s.getDate(),
                "H+": s.getHours(),
                "m+": s.getMinutes(),
                "s+": s.getSeconds(),
                "q+": Math.floor((s.getMonth() + 3) / 3),
                S: s.getMilliseconds()
            };
            /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length)));
            for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length)));
            return t
        }
        msg(e = t, s = "", i = "", r) {
            const o = t => {
                if (!t) return "";
                if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? {
                    "open-url": t
                } : this.isSurge() ? {
                    url: t
                } : void 0;
                if ("object" == typeof t) {
                    if (this.isLoon()) {
                        let e = t.openUrl || t.url || t["open-url"],
                            s = t.mediaUrl || t["media-url"];
                        return {
                            openUrl: e,
                            mediaUrl: s
                        }
                    }
                    if (this.isQuanX()) {
                        let e = t["open-url"] || t.url || t.openUrl,
                            s = t["media-url"] || t.mediaUrl;
                        return {
                            "open-url": e,
                            "media-url": s
                        }
                    }
                    if (this.isSurge()) {
                        let e = t.url || t.openUrl || t["open-url"];
                        return {
                            url: e
                        }
                    }
                }
            };
            if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) {
                let t = ["", "==============📣系统通知📣=============="];
                t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t)
            }
        }
        log(...t) {
            t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator))
        }
        logErr(t, e) {
            const s = !this.isSurge() && !this.isQuanX() && !this.isLoon();
            s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t)
        }
        wait(t) {
            return new Promise(e => setTimeout(e, t))
        }
        done(t = {}) {
            const e = (new Date).getTime(),
                s = (e - this.startTime) / 1e3;
            this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t)
        }
    }(t, e)
}


// ================================= 【修改代码】脚本主执行逻辑 =================================
// 使用 IIFE (立即执行函数表达式) 和 try...catch...finally 结构
!(async () => {
    const kugou = new KuGou(kugou_cookie);
    await kugou.main();
})()
.catch((e) => {
    // 捕获执行过程中的任何错误
    $.logErr(e);
})
.finally(() => {
    // 无论成功或失败，最后都调用 done() 方法
    console.log('脚本执行完毕，调用 $done()。');
    $.done();
});
// ================================= 【修改代码结束】 =================================
