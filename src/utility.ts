process.parentPort.once('message', (message) => {
	console.log(`메인 프로세스에서 메시지 수신: ${message}`);
	process.parentPort.postMessage('start utility process');
});

process.parentPort.on('message', (message) => {
	console.log(message);
});
