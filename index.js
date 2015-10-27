
var ScriptServer = require('scriptserver');

module.exports = function(server) {
};

ScriptServer.prototype.isOnline = function(player) {
  var self = this;

  return self.send(`testfor ${player}`, /Found\s([\S]+)/)
    .then(d => {
        if (!player) throw new Error('No Player Specified');
        else return !!d;
    });
};

ScriptServer.prototype.getCoords = function(player) {
    var self = this;

    return self.send(`execute ${player} ~ ~ ~ /testforblock ~ ~ ~ minecraft:air 10`, /(-?[\d]+),(-?[\d]+),(-?[\d]+)/)
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