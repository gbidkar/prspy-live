const axios = require('axios');

const { Server } = require('../module/Server.js');
const defaultServers = require('../servers.js');

const PRSPYCurrentServersURL = 'https://www.realitymod.com/prspy/json/serverdata.json';

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
            console.log(`[ERROR] An exception occured while loading server list from PRSPY (${e.message})`);
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
        return JSON.parse(res.data.trim()).Data;
    }

    filterRealTimeServers(serversObject) {
        return serversObject.filter(s => s.NumPlayers > 0);
    }

    createRealTimeServerModules(serversObject) {
        return serversObject.map(this.createServerModuleFromRealTimeObject);
    }

    createServerModuleFromRealTimeObject(server) {
        return new Server(server.ServerName, server.IPAddress, server.QueryPort, server.MaxPlayers - server.ReservedSlots);
    }
}

module.exports = { ServerFinder };