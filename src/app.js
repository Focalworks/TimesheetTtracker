var app = require('app');
browserWindow = require('browser-window');
var ipc = require("electron").ipcMain;

var idleTime = 0;
var idleInterval;
var mainWindow = null;
var Tray = require('tray');
var Menu = require('menu');
var path = require('path');
var iconPath = path.join(__dirname, '/windows/main/images/time.png');
var appIcon = path.join(__dirname, '/windows/main/images/time.png');
var mainPage = "file://" + __dirname + '/windows/main/index.html';
var force_quit = false;
app.on('ready', function() {
    mainWindow = new browserWindow({
        width: 900,
        height: 700,
        icon: iconPath
    });

    mainWindow.loadURL(mainPage);
    mainWindow.openDevTools();
    mainWindow.setMenu(null);


    appIcon = new Tray(iconPath);
    var contextMenu = Menu.buildFromTemplate([
        {
            label: 'Sync',
            icon: iconPath,
            click: function() {
                mainWindow.webContents.send('user_sync_data_action');
            }

        },
        {
            label: 'Logout',
            accelerator: 'Command+l',
            click: function() {
                mainWindow.webContents.send('user_logout_action');
                mainWindow.loadURL(mainPage);
                mainWindow.show();
            }
        },
        {
            type: 'separator'
        },
        {
            label: 'Quit',
            accelerator: 'CmdOrCtrl+Q',
            click: function() {
                force_quit=true; app.quit();
            }
        }
    ]);

    appIcon.setToolTip('Toggle');
    appIcon.setContextMenu(contextMenu);

    mainWindow.on('close', function(e){
        if(!force_quit){
            e.preventDefault();
            mainWindow.hide();
        }
    });

    mainWindow.on('closed', function(){
        app.quit();
        mainWindow = null;
    });

});


app.on('activate-with-no-open-windows', function(){
    mainWindow.show();
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
    idleInterval = setInterval(timerIncrement, 60000*5);//60000 //call every one minute
}

function timerIncrement() {
    idleTime = idleTime + 1;

    //count will increment every 5 minutes - display notification after 30 minutes (5 x ? = 30 minutes)
    if (idleTime >= 24) { // 2 minutes
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