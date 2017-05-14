var Client = require('ssh2').Client;

var conn = new Client();
conn.on('ready', function () {
    console.log('Client :: ready');
    conn.sftp(function (err, sftp) {
        if (err) throw err;
        sftp.fastGet('~/cfg/gxpconfpubilc.xml', './gxpconfpublic.xml', function (err, result) {
            if (err) throw err;
            conn.end();
        });
    });
}).connect({
    host: '192.168.0.103',
    port: 22,
    username: 'gxp',
});