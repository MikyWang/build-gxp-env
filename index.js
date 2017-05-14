var fs = require('fs');
var xml2js = require('xml2js');
var Client = require('ssh2').Client;
var http = require('http');


var parser = new xml2js.Parser();
var builder = new xml2js.Builder();

const gxpIp = {
    dev63: '192.168.0.103'
}

const cmd = `stopgxp -e\n
             startgxp\n
             exit\n`;

http.createServer(function (req, res) {
    req.setEncoding('utf8');
    var ip = req.url.replace('/', '');
    if (gxpIp[ip]) {
        updateConfigure(ip, res);

    } else {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.write('<head><meta charset="utf-8"/></head>');
        res.end('无效地址');
    }
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write('<head><meta charset="utf-8"/></head>');
}).listen(8888);

function GxpConf() {
    this.gxpconf = {
        ocaconf: [{
            oca: [{
                $: {
                    id: '',
                    des: '',
                    flowEntry: '',
                    eflowEntry: '',
                    flowCtrl: '',
                    timeOut: '',
                    Otype: '',
                    serviceIP: '',
                    portSet1: '',
                    portSet2: '',
                    cocurrents: '',
                    sockConnType: '',
                    operFlag: '',
                    sockSyncFlag: '',
                    syncChar: '',
                    rcvPkgType: '',
                    sndPkgFmt: '',
                    rcvPkgFmt: '',
                    dataLenType: '',
                    charLen: '',
                    dataLenMode: '',
                    para1: '',
                    para2: '',
                    forNumType: '',
                    forNumLenType: '',
                    forNumLen: '',
                    whileFlagLen: '',
                    whileFlagValue: '',
                    heartBeat: '',
                    HBCharReq: '',
                    HBCharResp: '',
                    para4: ''
                }
            }]
        }],
        nodeconf: [{
            channelnode: [{
                $: {
                    id: '',
                    adapterId: '',
                    des: '',
                    type: '',
                    nodeIp: '',
                    assistAdapterId: '',
                    maxConn: '',
                    maxFlow: '',
                    timeout: '',
                    varCfg: '',
                    expired: ''
                }
            }]
        }],
        icaconf: [{
            ica: {
                $: {
                    id: '',
                    des: '',
                    Itype: '',
                    flowEntry: '',
                    eflowEntry: '',
                    isDirect: '',
                    DestOCA: '',
                    authType: '',
                    ipSet: '',
                    port: '',
                    sockConnType: '',
                    operFlag: '',
                    sockSyncFlag: '',
                    syncChar: '',
                    rcvPkgType: '',
                    rcvPkgFmt: '',
                    sndPkgFmt: '',
                    dataLenType: '',
                    charLen: '',
                    dataLenMode: '',
                    para1: '',
                    para2: '',
                    forNumType: '',
                    forNumLenType: '',
                    forNumLen: '',
                    whileFlagValue: '',
                    whileFlagLen: '',
                    heartBeat: '',
                    HBCharReq: '',
                    HBCharResp: ''
                }
            }
        }],
        tpoll: [{
            $: {
                maxThreads: ''
            }
        }]
    }
}

/**
 * 更新配置信息
 * @param {array} conf 需更新的节点名
 * @param {object} elem 新增节点
 */
function updateConfig(conf, elem) {
    var result = conf.find(con => con.$.id == elem.$.id);
    if (!result) {
        console.log(elem);
        conf.push(elem);
    }
}

function syncConfig(url, backupContent, updateContent) {
    var backup = new GxpConf();
    var update = new GxpConf();
    parser.parseString(backupContent, function (error, result) {
        backup.gxpconf = result.gxpconf;
    });
    parser.parseString(updateContent, function (error, result) {
        update.gxpconf = result.gxpconf;
    });

    update.gxpconf.icaconf[0].ica.forEach(function (icaElem) {
        updateConfig(backup.gxpconf.icaconf[0].ica, icaElem);
    }, this);

    update.gxpconf.ocaconf[0].oca.forEach(function (ocaElem) {
        updateConfig(backup.gxpconf.ocaconf[0].oca, ocaElem);
    });

    update.gxpconf.nodeconf[0].channelnode.forEach(function (nodeElem) {
        updateConfig(backup.gxpconf.nodeconf[0].channelnode, nodeElem);
    });

    update.gxpconf.tpoll.forEach(function (poll) {
        updateConfig(backup.gxpconf.tpoll, poll);
    });
    var finallyContent = builder.buildObject(backup);

    fs.writeFileSync('./config/' + url + '.xml', finallyContent);
}





function updateConfigure(url, res) {
    var backupContent = fs.readFileSync('./config/' + url + '.xml', 'utf-8');
    var updateContent = '';
    var conn = new Client();
    conn.on('ready', function () {
        console.log('Client :: ready');
        conn.sftp(function (err, sftp) {
            if (err) throw err;
            sftp.fastGet('cfg/gxpconfpublic.xml', './gxpconfpublic.xml', function (err, result) {
                if (err) throw err;
                updateContent = fs.readFileSync('./gxpconfpublic.xml', 'utf-8');
                syncConfig(url, backupContent, updateContent);
                sftp.fastPut('./config/' + url + '.xml', 'cfg/gxpconfpublic.xml', function (err, result) {
                    if (err) throw err;
                    conn.shell(function (err, stream) {
                        if (err) throw err;
                        stream.on('close', function () {
                            conn.end();
                            res.end(`<span style="color:red">更新环境` + gxpIp[url] + `成功</span>`);
                        }).on('data', function (data) {
                            fs.appendFileSync('./syncConfig.log', data + '\n');
                            res.write(`<div style="color:blue">` + data + `</div>`);
                        }).stderr.on('data', function (data) {
                            console.log('stderr: ' + data);
                        });
                        stream.end(cmd);
                    })
                })

            });
        });
    }).connect({
        host: gxpIp[url],
        port: 22,
        username: 'gxp',
        password: 'gxp'
    });
}