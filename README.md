scriptserver-helpers
====================

[![](http://i.imgur.com/zhptNme.png)](https://github.com/garrettjoecox/scriptserver)

FYI: This package is an addon for ScriptServer and requires ScriptServer to be set up, please see [here](https://github.com/garrettjoecox/scriptserver) for more information.

## Installation
While in root directory of your server run:
```
npm install scriptserver-helpers
```
And in your `server` file:
```javascript
server.use('scriptserver-helpers');
```

## Usage
This module provides the following basic helper functions to help developers get started with modules.
```javascript
// .testForBlock(coords, type)
// Returns whether or not the block at the given coords matches the given type
server.testForBlock({x: 0, y: 75, z: 0}, 'air')
  .then(result => {
    if (result) doSomething();
    else doSomethingElse();
  });

// .isOnline(username)
// Returns whether or not the player is online
server.isOnline('ProxySaw')
  .then(result => {
    if (result) doSomething();
    else doSomethingElse();
  });

// .wait(ms)
// Waits a given time (milliseconds) then continues to next promise in chain
server.doSomething(withSomething)
  .then(() => server.wait(1000))
  .then(() => doSomethingElse());

// .getCoords(username)
// Returns coordinates of given user if online
server.getCoords('ProxySaw')
  .then(coords => {
    console.log(coords.x);
    console.log(coords.y);
    console.log(coords.z);
  });

// .tellRaw(text, target, options)
// Uses the minecraft command tellRaw to tell [target] [text] with [options]
server.tellRaw('Something went wrong!', '@a', {color: 'red'});
```
