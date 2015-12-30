var app = require('app');
browserWindow = require('browser-window');
var ipc = require("electron").ipcMain;
const Tray = require("electron").Tray;
var idleTime;
var idleInterval;
var mainWindow = null;

app.on('ready', function() {
    mainWindow = new browserWindow({width: 900, height: 700,icon: "file://" + __dirname + '/windows/main/images/logo.png'});
    mainWindow.loadURL("file://" + __dirname + '/windows/main/index.html');
    mainWindow.openDevTools();

    //aboutDialogOptions = {
    //    type: "info",
    //    title: "About Dialog",
    //    buttons: ["Ok"],
    //    message: "Dialog Test",
    //    detail: "dialog test by "
    //};
    //const dialog = require('electron').dialog;
    //console.log(dialog.showMessageBox(mainWindow,aboutDialogOptions));



    //var appIcon = new Tray('/windows/main/images/');
    //var contextMenu = Menu.buildFromTemplate([
    //    { label: 'Item1', type: 'radio' },
    //    { label: 'Item2', type: 'radio' },
    //    { label: 'Item3', type: 'radio', checked: true },
    //    { label: 'Item4', type: 'radio' }
    //]);
    //appIcon.setToolTip('This is my application.');
    //appIcon.setContextMenu(contextMenu);




});
const dialog = require('electron').dialog;

app.on('browser-window-blur', function() {
    console.log('browser window blur');
    aboutDialogOptions = {
        type: "info",
        title: "About Dialog",
        buttons: ["Ok"],
        message: "Dialog Test",
        detail: "dialog test by "
    };
    startInterval();
    //if(!dialog.showMessageBox(mainWindow,aboutDialogOptions)) {
    //
    //console.log(dialog.showMessageBox(mainWindow,aboutDialogOptions));
    //}
});

app.on('browser-window-focus', function() {
    clearInterval(idleInterval);
    idleTime = 0;
})

ipc.on('online-status-changed', function(event, status) {
    /* console.log("Status changed");
     console.log(status);*/
});

function startInterval() {
    idleInterval = setInterval(timerIncrement, 60000); //call every one minute
}
function timerIncrement() {
    idleTime = idleTime + 1;
    if (idleTime > 1) { // 20 minutes

    }
}