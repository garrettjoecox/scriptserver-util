scriptserver-util
====================

[![](http://i.imgur.com/zhptNme.png)](https://github.com/garrettjoecox/scriptserver)

FYI: This package is an addon for ScriptServer and requires ScriptServer to be set up, please see [here](https://github.com/garrettjoecox/scriptserver) for more information.

## Installation
While in root directory of your server run:
```
npm install scriptserver-util
```
And in your `server` file:
```javascript
server.use(require('scriptserver-util'));
```

## Usage
This module provides the following basic helper functions to help developers get started with modules.
```javascript
// .isOnline(username)
// Returns whether or not the player is online
server.util.isOnline('ProxySaw')
  .then(result => {
    if (result) doSomething();
    else doSomethingElse();
  });

// .wait(ms)
// Waits a given time (milliseconds) then continues to next promise in chain
server.doSomething(withSomething)
  .then(() => server.util.wait(1000))
  .then(() => doSomethingElse());

// .getLocation(username)
// Returns coordinates & dimension of given user if online
server.util.getLocation('ProxySaw')
  .then(loc => {
    console.log(loc.x);
    console.log(loc.y);
    console.log(loc.z);
    console.log(loc.dimension)
  });

// .tellRaw(text, target, options)
// Uses the minecraft command tellRaw to tell [target] [text] with [options]
server.util.tellRaw('Something went wrong!', '@a', {color: 'red'});
```
