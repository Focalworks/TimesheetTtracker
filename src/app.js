var app = require('app');
browserWindow = require('browser-window');
var ipc = require("electron").ipcMain;

var mainWindow = null;
app.on('ready', function() {
    mainWindow = new browserWindow({width: 900, height: 700});
    mainWindow.loadURL("file://" + __dirname + '/windows/main/index.html');
    //mainWindow.openDevTools();
});

ipc.on('online-status-changed', function(event, status) {
    /* console.log("Status changed");
     console.log(status);*/
});
