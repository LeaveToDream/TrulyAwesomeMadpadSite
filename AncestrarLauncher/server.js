'use strict';
const WebSocketServer = require('ws').Server;
const wss = new WebSocketServer({ port: 8081 });

var exec = require('child_process').spawn;
var server = { game: undefined, realm: undefined };

wss.on('connection', (ws) => {
	ws.on('message', (message) => {
		var data = JSON.parse(message);

		if (data.type !== 'hello') {
			console.log(`received: ${data.type}`);
		}
		switch (data.type) {
			case 'reboot_realm':
				console.log('> rebooting realm');
				if (server.realm !== undefined) {
					server.realm.kill();
				}

				server.realm = exec('java', ['-jar', '-Xmx200m', '-Xms200m', 'Realm.jar'], {cwd: 'AncestraReload/'});
				server.realm.stdout.on('data', (data) => {
					ws.send(JSON.stringify({type: 'realm', log: data.toString()}));
				});
				server.realm.stderr.on('data', (data) => {
					ws.send(JSON.stringify({type: 'realm_error', log: data.toString()}));
				});
				break;

			case 'reboot_game':
				console.log('> rebooting game');
				if (server.game !== undefined) {
					server.game.kill();
				}

				server.game = exec('java', ['-jar', '-Xmx1000m', '-Xms600m', 'Game.jar'], {cwd: 'AncestraReload/'});
				server.game.stdout.on('data', (data) => {
					ws.send(JSON.stringify({type: 'game', log: data.toString()}));
				});
				server.game.stderr.on('data', (data) => {
					ws.send(JSON.stringify({type: 'game_error', log: data.toString()}));
				});
				break;

			case 'hello':
				console.log('\n\n/!\\ New user connected :)');
				console.log(`received: ${data.message}`);
				break;
			default:
		}
	});
	ws.on('end', () => {
		ws.send(JSON.stringify({type: 'goodby', message: 'さよなら'}));
		console.log('Connection ended...');
	});
	ws.send(JSON.stringify({type: 'hello', message: 'Hello Client'}));
});

process.on('exit', function () {
	if (server.realm !== undefined) {
		server.realm.kill();
	}
	if (server.game !== undefined) {
		server.game.kill();
	}
});
