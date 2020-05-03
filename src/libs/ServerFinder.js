const axios = require('axios');

const { Server } = require('../module/Server.js');
const defaultServers = require('../servers.js');

const PRSPYCurrentServersURL = 'https://servers.realitymod.com/api/ServerInfo';

class ServerFinder {
    constructor() {}

    async findServer(partialServerName) {
        const availableServers = await this.loadServers();
        const result = availableServers.filter(s => s.name.toLowerCase().includes(partialServerName.toLowerCase()));

        if (!result) {
            throw new Error(`Couldn't find server with the given query ('${partialServerName}')`);
        }

        return result[0];
    }

    async loadServers() {
        try {
            const servers = await this.loadRealTimeServers();
            const filteredServers = this.filterRealTimeServers(servers);
            return this.createRealTimeServerModules(filteredServers);
        } catch (e) {
            console.log(`[ERROR] An exception occured while loading server list from PRSPY:`);
            console.log(e);
            console.log(`[ERROR] Reverting to local server list (${defaultServers.length} servers found)`);
            return defaultServers.map(this.createServerModuleFromRealTimeObject);
        }
    }

    async loadRealTimeServers() {
        const res = await axios({
            url: PRSPYCurrentServersURL,
            method: 'get',
            headers: {
                'Accept': 'application/json'
            }
        });
        return res.data.servers;
    }

    filterRealTimeServers(serversObject) {
        return serversObject.filter(s => s.properties.numplayers > 0);
    }

    createRealTimeServerModules(serversObject) {
        return serversObject.map(this.createServerModuleFromRealTimeObject);
    }

    createServerModuleFromRealTimeObject(serverHeader) {
        const { properties: server } = serverHeader;
        return new Server(server.hostname, serverHeader.serverIp, serverHeader.queryPort, server.maxplayers - server.bf2_reservedslots);
    }
}

module.exports = { ServerFinder };