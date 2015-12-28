
var fs = require('fs');
var path = require('path');
var ScriptServer = require('scriptserver');

module.exports = function(server) {};

ScriptServer.prototype.isOp = function(player) {
  if (!player) return Promise.reject(new Error('No Player Specified'));

  return readFile('ops.json')
    .then(ops => !!JSON.parse(ops).filter(op => op.name === player).length);
}

ScriptServer.prototype.isOnline = function(player) {
  if (!player) return Promise.reject(new Error('No Player Specified'));
  return this.send(`testfor ${player}`, /Found\s([\w]+)/)
    .then(foundPlayer => !!foundPlayer);
}

ScriptServer.prototype.getDimension = function(player) {
  if (!player) return Promise.reject(new Error('No Player Specified'));
  var self = this;

  return self.isOnline(player)
    .then(isOnline => {
      if (!isOnline) throw new Error(`${player} is not online`);
    })
    .then(() => self.send(`testfor ${player} {Dimension:0}`, /Found\s([\w]+)/))
    .then(d => {
      if (d) return 'overworld';
      else return  self.send(`testfor ${player} {Dimension:-1}`, /Found\s([\w]+)/)
        .then(d => {
          if (d) return 'nether';
          else return  self.send(`testfor ${player} {Dimension:1}`, /Found\s([\w]+)/)
            .then(d => {
              if (d) return 'end';
              else throw new Error(`${player} in unknown dimension`);
            });
        });
    });
}

ScriptServer.prototype.getCoords = function(player) {
  if (!player) return Promise.reject(new Error('No Player Specified'));
  var self = this;

  return self.isOnline(player)
    .then(isOnline => {
      if (!isOnline) throw new Error(`${player} is not online`);
    })
    .then(() => self.send(`execute ${player} ~ ~ ~ /testforblock ~ ~ ~ minecraft:air 10`, /at\s([-\d]+),([-\d]+),([-\d]+)/))
    .then(d => {
      if (!d) throw new Error('Coordinates not retrieved');
      return {
        x: d[1],
        y: d[2],
        z: d[3]
      };
    });
};

ScriptServer.prototype.testForBlock = function(coords, type) {
  return this.send(`testforblock ${coords.x} ${coords.y} ${coords.z} minecraft:${type}`, /(Successfully)/)
    .then(d => !!d);
};

ScriptServer.prototype.wait = function(time) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, time);
    });
};

ScriptServer.prototype.tellRaw = function(text, target, options) {
    options.text = text;
    options = JSON.stringify(options);
    return this.send(`tellraw ${target} ${options}`);
};

function readFile(file) {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(process.cwd(), file), 'utf8', (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}
