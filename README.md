# PRSpy Live

A small bunch of scripts which solves the problem of continously clicking a server to see if you can enter it in the Project Reality mod, due to the lack of a queue feature.

## Features

- Real-time query the player count of a Project Reality server
- Have the player count displayed on a web client using a websocket server
- Grand indication for when you can enter a server or not
- Search by current Project Reality servers listed in PRSpy (filtering out the empty ones)
- Timeout in order to not be blamed for DDoSing
- Mobile friendly 📱
- Just so damn sexy! 💃

## Using

### Requirements

You will need `node` and `python` installed on the hosting machine. The scripts have been tested with `python 2.7` and `node 12.16.1` (although previous versions, down to `node 8`, should work).

### Setup

Enter the cloned repo and run:

```
npm install
```

### Usage

To run the tool, in the root repo directory, run:

```
node src/index.js <partial-server-name>
```

e.g:

```
node src/index.js hog
```

The default ports are `3000` for the Web Server and `4000` for the Web Socket Server.

So head over to `<your-machine's-ip>:3000` and have fun!


## Known issues

### Timeout problems

When the host computer that queries the servers for information has bad network or when pinging a server
with high ping (hosted far away) you might hit timeouts on the query socket.

The default is 0.3 seconds, at `ServerListener.js` with `BaseTimeout` constant. Tweak as you please, for lower or higher.

However having a higher value means having a bigger delay in regards to true player count.

## Screenshots

![MobileGo](https://i.imgur.com/SMyEl5W.jpg?s)
![MobileWait](https://i.imgur.com/PVTt0Ng.jpg)