#!name=测试
#!desc=测试
#!system=ios

[Script]
# > 04 哔哩哔哩@blackmatrix7
^https?:\/\/api\.vc\.bilibili\.com\/topic_svr\/v1\/topic_svr url reject-dict
^https?:\/\/api\.vc\.bilibili\.com\/dynamic_svr\/v1\/dynamic_svr\/mix_uplist url reject-dict
^https?:\/\/api\.bilibili\.com\/pgc\/season\/app\/related\/recommend\? url reject-dict
^https?:\/\/app\.bilibili\.com\/x\/v2\/feed\/index\? url script-response-body https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/bilibili/bilibili_plus.js
^https?:\/\/api\.bilibili\.com\/pgc\/page\/bangumi url script-response-body https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/bilibili/bilibili_plus.js
^https?:\/\/api\.live\.bilibili\.com\/xlive\/app-room\/v1\/index\/getInfoByRoom url script-response-body https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/bilibili/bilibili_plus.js
^https?:\/\/api\.vc\.bilibili\.com\/dynamic_svr\/v1\/dynamic_svr\/dynamic_new\? url script-response-body https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/bilibili/bilibili_plus.js
^https?:\/\/app\.bilibili\.com\/x\/v2\/splash\/list url script-response-body https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/bilibili/bilibili_plus.js
^https?:\/\/app\.bilibili\.com\/x\/resource\/show\/tab url script-response-body https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/bilibili/bilibili_plus.js
^https?:\/\/app\.bilibili\.com\/x\/v2\/account\/mine url script-response-body https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/bilibili/bilibili_plus.js
^https?:\/\/manga\.bilibili\.com\/twirp\/comic\.v\d\.Comic\/Flash url reject-dict
# > B站 开屏页广告,推荐页广告,动态(推荐话题和列表广告),视频播放页面(up主推荐广告,相关推荐广告)@app2smile
^https:\/\/app\.bilibili\.com\/x\/(v2\/(splash\/(list|show)|feed\/index\?)|resource\/show\/tab\/v2) url script-response-body https://raw.githubusercontent.com/app2smile/rules/master/js/bilibili-json.js
^https:\/\/app\.bilibili\.com\/bilibili\.app\.(view\.v1\.View\/View|dynamic\.v2\.Dynamic\/DynAll)$ url script-response-body https://raw.githubusercontent.com/app2smile/rules/master/js/bilibili-proto.js

[MITM]
hostname = %APPEND% www.bilibili.com, api.live.bilibili.com, app.bilibili.com, api.vc.bilibili.com
