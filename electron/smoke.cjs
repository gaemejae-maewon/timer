const { app, BrowserWindow } = require('electron');
const path = require('node:path');
app.whenReady().then(async () => {
  const win = new BrowserWindow({show: false, webPreferences: {sandbox: true, contextIsolation: true, nodeIntegration: false, backgroundThrottling: false}});
  try {
    await win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
    const initial = await win.webContents.executeJavaScript(`document.querySelector('[role="timer"]').textContent`);
    if (initial !== '05:00') throw new Error('Initial timer mismatch: ' + initial);
    for (const [index, expected] of [[0, '01:00'], [1, '03:00'], [2, '05:00']]) {
      await win.webContents.executeJavaScript(`document.querySelectorAll('.presets button')[${index}].click()`);
      await new Promise(resolve => setTimeout(resolve, 100));
      const selected = await win.webContents.executeJavaScript(`document.querySelector('[role="timer"]').textContent`);
      if (selected !== expected) throw new Error('Exercise preset failed: ' + selected);
    }
    await win.webContents.executeJavaScript(`(() => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      for (const [label, value] of [['분', '0'], ['초', '1']]) {
        const input = document.querySelector('input[aria-label="' + label + '"]');
        setter.call(input, value);
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    })()`);
    await new Promise(resolve => setTimeout(resolve, 100));
    await win.webContents.executeJavaScript(`document.querySelector('form').requestSubmit()`);
    await new Promise(resolve => setTimeout(resolve, 100));
    await win.webContents.executeJavaScript(`document.querySelector('.start').click()`);
    await new Promise(resolve => setTimeout(resolve, 1600));
    const result = await win.webContents.executeJavaScript(`({time: document.querySelector('[role="timer"]').textContent, done: document.querySelector('[role="status"]').textContent})`);
    if (result.time !== '00:00' || !result.done.includes('끝났어요')) throw new Error(JSON.stringify(result));
    await win.webContents.executeJavaScript(`document.querySelector('.reset').click()`);
    await new Promise(resolve => setTimeout(resolve, 100));
    const reset = await win.webContents.executeJavaScript(`document.querySelector('[role="timer"]').textContent`);
    if (reset !== '00:01') throw new Error('Reset failed');
    // Advance a controlled clock across pause/resume without rounding away elapsed time.
    await win.webContents.executeJavaScript(`(() => {
      window.testNow = Date.now();
      Date.now = () => window.testNow;
      document.querySelector('.start').click();
    })()`);
    await new Promise(resolve => setTimeout(resolve, 100));
    await win.webContents.executeJavaScript(`window.testNow += 400; document.querySelector('.start').click()`);
    await new Promise(resolve => setTimeout(resolve, 100));
    await win.webContents.executeJavaScript(`document.querySelector('.start').click()`);
    await new Promise(resolve => setTimeout(resolve, 100));
    await win.webContents.executeJavaScript(`window.testNow += 650`);
    await new Promise(resolve => setTimeout(resolve, 200));
    const resumed = await win.webContents.executeJavaScript(`document.querySelector('[role="timer"]').textContent`);
    if (resumed !== '00:00') throw new Error('Pause/resume lost elapsed milliseconds: ' + resumed);
    console.log('PASS: custom duration, countdown completion, reset, and precise pause/resume verified in Electron.');
    app.exit(0);
  } catch (error) { console.error(error); app.exit(1); }
});
