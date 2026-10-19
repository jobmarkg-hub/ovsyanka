import { ipcRenderer } from 'electron';

// Expose safe APIs to the renderer
window.electronAPI = {
  startAudioCapture: () => ipcRenderer.invoke('start-native-audio-capture'),
  stopAudioCapture: () => ipcRenderer.invoke('stop-native-audio-capture'),
  getDesktopSources: () => ipcRenderer.invoke('get-desktop-sources'),
  onAudioChunk: (callback: (data: Uint8Array) => void) => {
    ipcRenderer.on('audio-data-chunk', (_event, data) => callback(data));
  },
  removeAudioChunkListener: () => {
    ipcRenderer.removeAllListeners('audio-data-chunk');
  }
};
