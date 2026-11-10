const { app, BrowserWindow, session } = require('electron');
const path = require('path');

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1366,
        height: 768,
        minWidth: 900,
        minHeight: 700,
        title: "Rustique Photobooth",
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: false // Allows local media / wallpaper assets
        },
        autoHideMenuBar: true
    });

    // Handle USB device permissions for Canon / Nikon WebUSB tethering
    mainWindow.webContents.session.on('select-usb-device', (details, callback) => {
        details.deviceList.sort((a, b) => b.vendorId - a.vendorId);
        // Automatically select the first available Canon or Nikon device matching filters
        callback(details.deviceList[0]);
    });

    mainWindow.webContents.session.setPermissionCheckHandler((webContents, permission, requestingOrigin, details) => {
        if (permission === 'media' || permission === 'usb') {
            return true;
        }
        return false;
    });

    mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback, details) => {
        if (permission === 'media' || permission === 'usb') {
            callback(true);
        } else {
            callback(false);
        }
    });

    mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.stop();
    app.quit();
});