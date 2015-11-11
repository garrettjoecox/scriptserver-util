
var ScriptServer = require('scriptserver');

module.exports = function(server) {
};

ScriptServer.prototype.testForBlock = function(coords, type) {
  var self = this;

  return self.send(`testforblock ${coords.x} ${coords.y} ${coords.z} minecraft:${type}`, /(Successfully)/)
    .then(d => {
      return !!d;
    });
};

ScriptServer.prototype.isOnline = function(player) {
  var self = this;

  return self.send(`testfor ${player}`, /Found\s([\w]+)/)
    .then(d => {
        if (!player) throw new Error('No Player Specified');
        else return !!d;
    });
};

ScriptServer.prototype.getCoords = function(player) {
    var self = this;

    return self.send(`execute ${player} ~ ~ ~ /testforblock ~ ~ ~ minecraft:air 10`, /at\s([-\d]+),([-\d]+),([-\d]+)/)
        .then(d => {
            return {
                x: d[1],
                y: d[2],
                z: d[3]
            };
        });
};

ScriptServer.prototype.wait = function(time) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, time);
    });
};

ScriptServer.prototype.tellRaw = function(text, target, options) {
    var self = this;

    options.text = text;
    options = JSON.stringify(options);
    return self.send(`tellraw ${target} ${options}`);
};
