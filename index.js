'use strict';

const fs = require('fs');
const path = require('path');

module.exports = function() {

  const server = this;

  server.util = {

    // Player related utilities

    isOp(player) {
      if (!player) return Promise.reject(new Error('util.isOp: Please provide player name'));
      if (typeof player !== 'string') return Promise.reject(new Error('util.isOp: Player name needs to be a string'));

      return readFile('ops.json')
        .then(ops => !!JSON.parse(ops).filter(op => op.name === player).length);
    },

    isOnline(player) {
      if (!player) return Promise.reject(new Error('util.isOnline: Please provide player name'));
      if (typeof player !== 'string') return Promise.reject(new Error('util.isOnline: Player name needs to be a string'));

      return server.send(`testfor ${player}`, /Found\s([\w]+)/, /The\sentity\sUUID/)
        .then(() => true)
        .catch(() => false);
    },

    getLocation(player) {
      if (!player) return Promise.reject(new Error('util.getLocation: Please provide player name'));
      if (typeof player !== 'string') return Promise.reject(new Error('util.getLocation: Player name needs to be a string'));
      const location = {};

      return this.isOnline(player)
        .then(isOnline => isOnline ? null : Promise.reject(new Error(`util.getLocation: ${player} is not online`)))
        .then(() => {
          return server.send(`testfor ${player} {Dimension:0}`, /Found\s([\w]+)/, /did\snot\smatch/)
            .then(() => location.dimension = 'overworld')
            .catch(() => {
              return server.send(`testfor ${player} {Dimension:-1}`, /Found\s([\w]+)/, /did\snot\smatch/)
                .then(() => location.dimension = 'nether')
                .catch(() => {
                  return server.send(`testfor ${player} {Dimension:1}`, /Found\s([\w]+)/, /did\snot\smatch/)
                    .then(() => location.dimension = 'end')
                    .catch(() => Promise.reject(new Error(`util.getLocation: ${player} in unknown dimension`)));
                });
            });
        })
        .then(() => server.send(`execute ${player} ~ ~ ~ /testforblock ~ ~ ~ minecraft:air 10`, /at\s([-\d]+), ([-\d]+), ([-\d]+)/))
        .then(data => {
          if (!data) return Promise.reject(new Error('util.getLocation: Unable to retrieve coordinates'));
          else {
            location.x = data[1];
            location.y = data[2];
            location.z = data[3];
          }
        })
        .then(() => location);
    },

    // General utilities

    tellRaw(message, target = '@a', options = {}) {
      if (typeof target !== 'string') return Promise.reject(new Error('util.tellRaw: Specified target should be a string'));
      if (typeof options !== 'object') return Promise.reject(new Error('util.tellRaw: Options for tellraw should be an object'));

      options.text = typeof message === 'string' ? message : JSON.stringify(message);
      return server.send(`tellraw ${target} ${JSON.stringify(options)}`);
    },

    wait(time) {
      return new Promise(resolve => setTimeout(resolve, time));
    }

  };
}

// Helper Functions

function readFile(file) {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(process.cwd(), file), 'utf8', (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}
