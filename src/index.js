const { ServerListener } = require('./libs/ServerListener.js');
const { ServerFinder } = require('./libs/ServerFinder.js');

const WebAppPort = 3000;
const WebSocketServerPort = 4000;
const GlobalTimeout = 10 * 60 * 1000;

const express = require('express');
const WebSocketServer = require('ws').Server;
const wss = new WebSocketServer({ port: WebSocketServerPort });
const app = express();

(async () => {
    app.get("/", (req, res) => {
        res.sendFile(__dirname + '/index.html');
    });

    const serversLoader = new ServerFinder();

    const query = process.argv.slice(2).join(' ');
    if (query === undefined) {
        throw new TypeError('Must provide a server name query!');
    }

    const selectedServer = await serversLoader.findServer(query);
    if (selectedServer === undefined) {
        throw new TypeError(`Couldn't find server named ${query}`);
    }

    console.log(`[i] Starting a runner for "${selectedServer.name}"`);
    console.log(`[i] Querying ${selectedServer.ip}:${selectedServer.port}`);
    console.log(`[i] Max players is set at ${selectedServer.maxPlayers}`);

    let startTime = new Date();
    let listener = new ServerListener(selectedServer);
    listener.run(function(serv) {
        let currTime = new Date();
        let timePassed = currTime - startTime;
        serv.timeLeft = GlobalTimeout - timePassed;
        wss.clients.forEach(function each(client) {
            client.send(JSON.stringify(serv));
        });
    });

    app.listen(WebAppPort, () => {
        console.log(`[web] Web-App listening on port ${WebAppPort}`);
        console.log(`[web] Web Socket Server listening on port ${WebSocketServerPort}`);
    });

    setTimeout(() => {
        listener.stop();
        wss.clients.forEach(function each(client) {
            client.send(JSON.stringify({ finished: true }));
        });
        console.log("Hit the timeout!");
    }, GlobalTimeout);
})();
