
const fs = require('fs');
const { join } = require('path');
const { promisify } = require('util');

module.exports = function () {
  const server = this;

  server.util = {

    // Player related utilities

    isOp(player) {
      if (!player) return Promise.reject(new Error('util.isOp: Please provide player name'));
      if (typeof player !== 'string') return Promise.reject(new Error('util.isOp: Player name needs to be a string'));

      return readFile('ops.json')
        .then(ops => JSON.parse(ops))
        .then(ops => !!ops.filter(op => op.name === player).length);
    },

    isOnline(player) {
      if (!player) return Promise.reject(new Error('util.isOnline: Please provide player name'));
      if (typeof player !== 'string') return Promise.reject(new Error('util.isOnline: Player name needs to be a string'));

      return server.send(`testfor ${player}`)
        .then(result => !!result.match(/^Found\s(\w+)$/));
    },

    async getDimension(player) {
      if (!player) throw new Error('util.getDimension: Please provide player name');
      if (typeof player !== 'string') throw new Error('util.getDimension: Player name needs to be a string');
      if (!await this.isOnline(player)) throw new Error(`util.getDimension: ${player} is not online`);

      const overworldResult = await server.send(`testfor ${player} {Dimension:0}`);
      const netherResult = await server.send(`testfor ${player} {Dimension:-1}`);
      const endResult = await server.send(`testfor ${player} {Dimension:1}`);
      const foundRegex = /^Found\s(\w+)$/;

      if (overworldResult.match(foundRegex)) {
        return 'overworld';
      } else if (netherResult.match(foundRegex)) {
        return 'nether';
      } else if (endResult.match(foundRegex)) {
        return 'end';
      }

      throw new Error(`util.getDimension: ${player} in unkown dimension`);
    },

    async getLocation(player) {
      if (!player) throw new Error('util.getLocation: Please provide player name');
      if (typeof player !== 'string') throw new Error('util.getLocation: Player name needs to be a string');
      if (!await this.isOnline(player)) throw new Error(`util.getLocation: ${player} is not online`);

      const result = await server.send(`execute ${player} ~ ~ ~ /testforblock ~ ~ ~ minecraft:air 10`);
      const coords = result.match(/at\s([-\d]+), ([-\d]+), ([-\d]+)/);

      return {
        dimension: await this.getDimension(player),
        x: coords[1],
        y: coords[2],
        z: coords[3],
      };
    },

    // General utilities

    getOnlineAmount() {
      return server.send('list')
        .then(result => result.match(/There are ([\d]+)\/([\d]+)/))
        .then(result => parseInt(result[1], 10));
    },

    tellRaw(message, target = '@a', options = {}) {
      if (typeof target !== 'string') return Promise.reject(new Error('util.tellRaw: Specified target should be a string'));
      if (typeof options !== 'object') return Promise.reject(new Error('util.tellRaw: Options for tellraw should be an object'));

      options.text = typeof message === 'string' ? message : JSON.stringify(message);
      return server.send(`tellraw ${target} ${JSON.stringify(options)}`);
    },

    wait(time) {
      return new Promise(resolve => setTimeout(resolve, time));
    },
  };
};

// Helper Functions

function readFile(file) {
  return promisify(fs.readFile)(join(process.cwd(), file), 'utf8');
}
