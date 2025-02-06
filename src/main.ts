/* eslint-disable @typescript-eslint/no-var-requires */
import { app, BrowserWindow, ipcMain, utilityProcess } from 'electron';
import type { BrowserType, Electron } from 'playwright';
import WebSocket from 'ws';
import path from 'path';
import { spawn, exec } from 'child_process';
const { chromium }: { chromium: BrowserType } = require('playwright');
app.disableHardwareAcceleration();
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
	app.quit();
}

const createWindow = async () => {
	if (BrowserWindow.getAllWindows().length > 0) return;
	// Create the browser window.
	const mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			nodeIntegration: true,
		},
	});
	app.commandLine.appendSwitch('remote-debugging-port', '9222');
	// // 새로운 유틸리티 프로세스 생성
	const utilProcess = utilityProcess.fork(path.join(__dirname, 'utility.js'));

	// 유틸리티 프로세스에서 메시지를 받을 때
	utilProcess.on('message', (message) => {
		console.log(`유틸리티 프로세스에서 메시지 수신: ${message}`);
	});
	utilProcess.postMessage('start utility process');
	// and load the index.html of the app.
	if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
		mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
	} else {
		mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
	}
	ipcMain.on('run-playwright', async (event, arg) => {
		// const browser = await chromium.launch({
		// 	headless: false,
		// 	env: {
		// 		...process.env,
		// 		DEBUG: 'pw:api',
		// 		PWDEBUG: 'console',
		// 		PW_CODEGEN_NO_INSPECTOR: '1',
		// 	},
		// });

		// const browserContext = await browser.newContext();
		// const page = await browserContext.newPage();
		// await page.goto('https://playwright.dev/');
		// Teardown
		const ls = spawn(
			'pnpm exec',
			['playwright', 'codegen', 'https://register.nemoapp.net/register/invest-building', '--output=./test1.spec.js'],
			{
				stdio: 'pipe',
				shell: true,
				env: {
					...process.env,
					DEBUG: 'pw:api',
					PW_CODEGEN_NO_INSPECTOR: '1',
				},
			}
		); // 예시로 'ls -lh /usr' 명령어 실행
		// await new Promise((resolve) => setTimeout(resolve, 5000));

		// // 브라우저에 연결
		ls.stdout.on('data', (data) => {
			console.log(data);
		});
		// stdout 데이터 스트림을 통해 실시간으로 출력 받음
		ls.stdout.on('readable', (data: any) => {
			console.log(`stdout: ${data}`);
		});
		// stderr 데이터 스트림을 통해 에러 출력 받음
		ls.stderr.on('data', (data) => {
			console.log(`stderr: ${data}`);
		});
		// 프로세스가 종료되면 종료 코드 반환
		ls.on('close', (code) => {
			console.log(`프로세스 종료 코드: ${code}`);
		});
		ls.on('open', (code) => {
			console.log('프로세스 시작 코드:', code);
		});
		ls.on('spawn', async () => {
			console.log('프로세스 시작 코드');
		});
	});
	// Open the DevTools.
	mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
