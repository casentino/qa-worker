/* eslint-disable @typescript-eslint/no-var-requires */
const { chromium } = require('playwright');

(async () => {
	const browser = await chromium.launchServer({
		headless: false,
		args: ['--remote-debugging-port=9222'],
	});
	console.log(`Browser websockpnpet endpoint: ${browser.wsEndpoint()}`);
	// 브라우저는 계속 실행 중입니다.
})();
