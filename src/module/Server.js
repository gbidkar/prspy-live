class Server {
    constructor(name, ip, port, maxPlayers) {
        this.name = name;
        this.ip = ip;
        this.port = port;
        this.maxPlayers = maxPlayers;
    }
}

module.exports = { Server };