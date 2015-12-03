/**
 * Created by komal on 3/12/15.
 */
var app = require('app');
browserWindow = require('browser-window');

var mainWindow = null;
app.on('ready', function() {
    mainWindow = new browserWindow({width: 900, height: 700});
    mainWindow.loadURL("file://" + __dirname + '/windows/main/index.html');
    mainWindow.openDevTools();
});

