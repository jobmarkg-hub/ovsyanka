import { app, BrowserWindow, ipcMain, desktopCapturer } from 'electron';
import path from 'path';
import { spawn, ChildProcess } from 'child_process';
import fs from 'fs';

let mainWindow: BrowserWindow | null = null;
let audioCaptureProcess: ChildProcess | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#FAF9F6',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC Audio capture handlers
ipcMain.handle('start-native-audio-capture', async () => {
  const binaryPath = path.join(__dirname, '../native/audio-capture/ScreenAudioCapture');
  if (fs.existsSync(binaryPath)) {
    try {
      audioCaptureProcess = spawn(binaryPath, ['--stream']);
      audioCaptureProcess.stdout?.on('data', (data) => {
        mainWindow?.webContents.send('audio-data-chunk', data);
      });
      return { success: true, mode: 'screencapturekit' };
    } catch (err: any) {
      console.error('Failed to spawn native audio capture:', err);
      return { success: false, error: err.message };
    }
  } else {
    // Fallback: report that WebAudio capture / virtual loopback should be used
    return { success: true, mode: 'webaudio-fallback' };
  }
});

ipcMain.handle('stop-native-audio-capture', async () => {
  if (audioCaptureProcess) {
    audioCaptureProcess.kill();
    audioCaptureProcess = null;
  }
  return { success: true };
});

ipcMain.handle('get-desktop-sources', async () => {
  const sources = await desktopCapturer.getSources({ types: ['window', 'screen'] });
  return sources.map(source => ({
    id: source.id,
    name: source.name,
    thumbnail: source.thumbnail.toDataURL(),
  }));
});
