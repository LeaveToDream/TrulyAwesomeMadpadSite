/* global WebSocket, $ */
console.log('open: ');
var ws = new WebSocket('ws://127.0.0.1:8081');
ws.onopen = function (event) {
	console.log('Connection is open ...');
	ws.send(JSON.stringify({type: 'hello', message: 'Hello Server'}));
};
ws.onerror = function (err) {
	console.log('err: ', err);
};
ws.onmessage = function (event) {
	var data = JSON.parse(event.data);
	// console.log(data);
	switch (data.type) {
		case 'game':
			$('#game').append(data.log.replace(/\n/g, '<br>'));
			$('#game').animate({scrollTop: $('#game').prop('scrollHeight')}, 100);
			break;
		case 'realm':
			$('#realm').append(data.log.replace(/\n/g, '<br>'));
			$('#realm').animate({scrollTop: $('#realm').prop('scrollHeight')}, 100);
			break;
		case 'hello':
			$('#game_button').removeClass('btn-dark');
			$('#game_button').addClass('btn-success');

			$('#realm_button').removeClass('btn-dark');
			$('#realm_button').addClass('btn-success');

			console.log(`received: ${data.message}`);
			break;
		case 'goodbye':
			$('#game_button').removeClass('btn-success');
			$('#game_button').addClass('btn-failure');

			$('#realm_button').removeClass('btn-success');
			$('#realm_button').addClass('btn-failure');

			console.log(`received: ${data.message}`);
			break;

		default:
			console.log(data.log);
	}
};
ws.onclose = function () {
	console.log('Connection is closed...');
};
$('#game_button').click(function () {
	$('#game').html('');
	ws.send(JSON.stringify({type: 'reboot_game'}));
});
$('#realm_button').click(function () {
	$('#realm').html('');
	ws.send(JSON.stringify({type: 'reboot_realm'}));
});
