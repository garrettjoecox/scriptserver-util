
const fs = require('fs');
const { join } = require('path');
const { promisify } = require('util');
const defaultsDeep = require('lodash.defaultsdeep');
const get = require('lodash.get');

module.exports = function () {
  const server = this;

  server.util = defaultsDeep({}, server.util);

  server.config.util = defaultsDeep({}, server.config.util, {
    flavorSpecific: {
      default: {
        // Player related utilities

        isOp(player) {
          if (!player) return Promise.reject(new Error('util.isOp: Please provide player name'));
          if (typeof player !== 'string') return Promise.reject(new Error('util.isOp: Player name needs to be a string'));

          return readFile('ops.json')
            .then(ops => JSON.parse(ops))
            .then(ops => !!ops.filter(op => op.name === player).length);
        },

        async isOnline(player) {
          if (!player) return Promise.reject(new Error('util.isOnline: Please provide player name'));
          if (typeof player !== 'string') return Promise.reject(new Error('util.isOnline: Player name needs to be a string'));

          const result = await server.send(`data get entity ${player} Dimension`);
          return !result.match(/^No entity was found$/);
        },

        async getDimension(player) {
          if (!player) throw new Error('util.getDimension: Please provide player name');
          if (typeof player !== 'string') throw new Error('util.getDimension: Player name needs to be a string');

          const result = await server.send(`data get entity ${player} Dimension`);
          if (result.match(/^No entity was found$/)) throw new Error(`util.getDimension: ${player} is not online`);

          const dimension = result.match(/^(\w+) has the following entity data: (.+)$/)[2];

          if (dimension === '0') {
            return 'minecraft:overworld';
          } else if (dimension === '1') {
            return 'minecraft:the_end';
          } else if (dimension === '-1') {
            return 'minecraft:the_nether';
          }

          throw new Error(`util.getDimension: ${player} in unkown dimension`);
        },

        async getLocation(player) {
          if (!player) throw new Error('util.getLocation: Please provide player name');
          if (typeof player !== 'string') throw new Error('util.getLocation: Player name needs to be a string');

          const result = await server.send(`data get entity ${player} Pos`);
          if (result.match(/^No entity was found$/)) throw new Error(`util.getLocation: ${player} is not online`);
          const coords = result.match(/^(\w+) has the following entity data: \[([-\d.]+)d, ([-\d.]+)d, ([-\d.]+)d\]$/);

          return {
            dimension: await this.getDimension(player),
            x: coords[2],
            y: coords[3],
            z: coords[4],
          };
        },

        // General utilities

        async getOnline() {
          const result = await server.send('list');
          const online = result.match(/^There are (\d+) of a max of (\d+) players online: (.+)$/);

          return {
            online: online[1],
            max: online[2],
            players: online[3].split(','),
          };
        },

        async teleport(player, location) {
          if (!player) throw new Error('util.teleport: Please provide player name');
          if (typeof player !== 'string') throw new Error('util.teleport: Player name needs to be a string');
          if (!location || location.x === undefined || location.y === undefined || location.z === undefined || location.dimension === undefined) {
            throw new Error('util.teleport: Needs x, y, z and dimension');
          }

          await server.send(`execute in ${location.dimension} run tp ${player} ${location.x} ${location.y} ${location.z}`);
          await server.send(`execute in ${location.dimension} run particle cloud ${location.x} ${location.y} ${location.z} 1 1 1 0.1 100 force`);
          await server.send(`execute in ${location.dimension} run playsound entity.item.pickup master @a ${location.x} ${location.y} ${location.z} 10 1 1`);
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
      },
    },
  });

  Object.entries(server.config.util.flavorSpecific.default).forEach(([property, method]) => {
    Object.defineProperty(server.util, property, {
      get() {
        return get(server.config.util, ['flavorSpecific', server.config.flavor, property], method);
      },
    });
  });
};

// Helper Functions

function readFile(file) {
  return promisify(fs.readFile)(join(process.cwd(), file), 'utf8');
}
