const { spawn } = require("child_process");

const BaseTimeout = 0.3;
const TimerIntervalAddition = 100;

class ServerListener {
    constructor(server) {
        this.currentServer = server;
        this.timeout = server.timeout !== undefined ? server.timeout + BaseTimeout : BaseTimeout;
        this.timerInterval = BaseTimeout * 1000 + TimerIntervalAddition;
    }

    run(handlerFunc) {
        let serv = this.currentServer;
        console.log(`[listener] Setting up interval timer for ${serv.name}`);

        this.interval = setInterval(() => {
            let py = spawn("python", ["src/client.py", serv.ip, serv.port, this.timeout]);
            py.stdout.on("data", data => {
                let serverInfo = JSON.parse(data.toString("utf8").split(/\r?\n/)[0]);
                if (serverInfo.errnum) {
                    console.log('[listener] Error occured: ', serverInfo.errmsg);
                    return;
                }
                let go = serverInfo.num_players < serv.maxPlayers;
                serverInfo.go = go;
                serverInfo.max_players = serv.maxPlayers;
                let status = go ? "GO!" : "WAIT";
                console.log(
                    `[listener] ${this.getDateTime()} | ${status} | PLAYERS: ${serverInfo.num_players} | MAP: ${
                        serverInfo.map
                    } | ${serverInfo.hostname}`
                );
                handlerFunc(serverInfo);
            });
        }, this.timerInterval);
    }

    stop() {
        clearInterval(this.interval);
    }

    getDateTime() {
        var date = new Date();

        var hour = date.getHours();
        hour = (hour < 10 ? "0" : "") + hour;

        var min = date.getMinutes();
        min = (min < 10 ? "0" : "") + min;

        var sec = date.getSeconds();
        sec = (sec < 10 ? "0" : "") + sec;

        return hour + ":" + min + ":" + sec;
    }
}

module.exports = { ServerListener };
