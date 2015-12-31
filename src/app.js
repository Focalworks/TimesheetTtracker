var app = require('app');
browserWindow = require('browser-window');
var ipc = require("electron").ipcMain;
var ipcR = require("electron").ipcRenderer;

var idleTime = 0;
var idleInterval;
var mainWindow = null;

app.on('ready', function() {
    mainWindow = new browserWindow({width: 900, height: 700,icon: "file://" + __dirname + '/windows/main/images/logo.png'});
    mainWindow.loadURL("file://" + __dirname + '/windows/main/index.html');
    mainWindow.openDevTools();
});

app.on('browser-window-blur', function() {
    //get timer status to start idle state timer
    //to check whether timer is on or off
    var val = mainWindow.webContents.send('get_timer_status');
});

app.on('browser-window-focus', function() {
    clearInterval(idleInterval);
    idleTime = 0;
})

function startInterval() {
    //count will increment every 5 minutes
    idleInterval = setInterval(timerIncrement, 1000*5);//60000 //call every one minute
}

function timerIncrement() {
    idleTime = idleTime + 1;

    //count will increment every 5 minutes - display notification after 30 minutes (5 x ? = 30 minutes)
    if (idleTime >= 6) { // 2 minutes
        //show notification to user and reset timer
        mainWindow.webContents.executeJavaScript('new Notification("Oh, you forget to start timer")');
        idleTime = 0;
    }
}

//to start counter if timesheet timer is off
ipc.on('start_idle_timer', function(event, status) {
    if(status == false) {
        startInterval();
    }
});