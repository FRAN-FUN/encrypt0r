// Modules to control application life and create native browser window
const {
    app,
    BrowserWindow,
    ipcMain,
    dialog
} = require('electron')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 600,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        },
        icon: path.join(__dirname, 'assets/icons/png/64x64.png')
    })

    // and load the index.html of the app.
    mainWindow.loadFile('index.html')

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

var path = require('path')
var fs = require('fs');
var http = require('http');
var exec = require('child_process').exec
var child;

// Clean up (not required atm)
ipcMain.on('action:reset', function(e, erg) {

});

ipcMain.on('action:encrypt_decrypt', function (e, arg) {
    var temp = arg;
    console.log(arg);
    var nameWithExt = '';
    if(arg.action === 'encrypt') {
        nameWithExt = arg.filePath + '.enc';
    } else if(arg.action === 'decrypt') {
        nameWithExt = arg.filePath.replace(/\.[^/.]+$/, '')
    }
    dialog.showSaveDialog({
        defaultPath: nameWithExt
    }, function (filename) {
        if(typeof filename !== 'undefined') {
            if(arg.action === 'encrypt') {
                e.sender.send('notice-status', "Encrypting...")
                sCommand = "openssl enc -aes-256-cbc -salt -in " + arg.filePath + " -out " + filename + " -k " + arg.passphrase
            } else if(arg.action === 'decrypt') {
                e.sender.send('notice-status', "Decrypting...")
                sCommand = "openssl enc -d -aes-256-cbc -in " + arg.filePath + " -out " + filename + " -k " + arg.passphrase
            }
            child = exec(sCommand, function (err, stdout, stderr) {
                if (err !== null) {
                    console.log(err);
                    e.sender.send('notice-status', 'Something went wrong. Make sure your passphrase is correct and try again.');
                } else {
                    e.sender.send('notice-status', 'Done! File has been saved to: ' + filename)
                }
            });
        } else {
            e.sender.send('notice-status', "Oops. Destination file location not selected. Press the Reset button and try again!")
        }
    });
});
