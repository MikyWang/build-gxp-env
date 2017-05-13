var fs = require('fs');
var xml2js = require('xml2js');

var parser = new xml2js.Parser();
var builder = new xml2js.Builder();

var backupContent = fs.readFileSync('./backup.xml', 'utf-8');
var updateContent = fs.readFileSync('./new.xml', 'utf-8');

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

function main() {
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

    fs.writeFileSync('./finally.xml', finallyContent);
}

main();
