var uuid = require('node-uuid');
var ipcR = require("electron").ipcRenderer;

myApp.controller('timesheetCtrl', ['timesheet','OfflineStorage','$scope',  function(timesheet, OfflineStorage, $scope) {
    var syncData = false;
    $scope.timesheet = {};

    $scope.userObject =  OfflineStorage.getDocs('user');
    if($scope.userObject.length) {
        $scope.uid = $scope.userObject[0].id;
    }

    //$scope.timesheet.tagArr = $scope.fwToggle.tagArr;

    /* Helper Function to sync data to online */
    $scope.syncData = function(TimesheetData) {
        timesheet.syncTimesheets(TimesheetData).success(function (response) {
            angular.forEach(TimesheetData, function (data, key) {
                OfflineStorage.updateTimesheetStatus(data.id); /* Update status of entry */
            });
        });
    };

    /* Load TimeEnteries From Offline and Sync Data to Online */
    var timeEntries = OfflineStorage.getDocs('timesheet', 'all');

    if(timeEntries.length) {
        angular.forEach(timeEntries, function(data, key) {
            if(!data.status) {
                syncData = true;
            }
        });

        if(syncData) {
            $scope.syncData(timeEntries); /* Sync data to online for status 0 */
        }
    }

    /* Load timeEntries Form Online */
    if(!syncData) {
        timesheet.getTimesheet($scope.uid).success(function (data) {
            OfflineStorage.truncateDb('timesheet');
            $scope.timeEntries = [];
            angular.forEach(data, function (timeEntry, key) {
                timeEntry.uuid = uuid.v4();
                timeEntry.status = 1;
                OfflineStorage.addDoc(timeEntry, 'timesheet');
                $scope.timeEntries.push(timeEntry);
                /* Add entry */
            });
        }).error(function (e) {
            $scope.timeEntries = OfflineStorage.getDocs('timesheet');
            /* Load offline Data on error */
        });
    }

    $scope.addTimesheetFormSubmit = false;
    var currentDate = new Date().getTime();
    $scope.timesheet.start_time_format = getFormattedTime(currentDate);
    $scope.timesheet.end_time_format = getFormattedTime(currentDate);
    $scope.timerRunning = false;

    /* Start Timer on click */
    $scope.startTimer = function (){
        var currentDate = new Date().getTime();
        $scope.$broadcast('timer-start');
        $scope.timerRunning = true;
        $scope.timesheet.start_time = currentDate;
        $scope.timesheet.end_time = currentDate;
        $scope.timesheet.start_time_format = getFormattedTime(currentDate);
        $scope.timesheet.end_time_format = getFormattedTime(currentDate);
        $scope.showForm = false;
    };

    /* Stop Timer on click */
    $scope.stopTimer = function (addTimesheetForm){
        var formIsValid = $scope.validate_fields(addTimesheetForm);
        if(formIsValid && addTimesheetForm.$valid) {
            $scope.timesheet.end_time = new Date().getTime();
            //$scope.timesheet.end_time = 1451371251000;
            $scope.timesheet.end_time_format = getFormattedTime($scope.timesheet.end_time);
            $scope.$broadcast('timer-stop');
            $scope.timerRunning = false;
            $scope.addTimesheetFormSubmit = false;
            $scope.clearFields();
            $scope.showForm = false;
        }else {
            $scope.addTimesheetFormSubmit = true;
            $scope.showForm = true;
        }
    };

    /* Validate Form Fields */
    $scope.validate_fields = function(addTimesheetForm) {
        var valid = false;
        addTimesheetForm.tag.$error.required = true;

        angular.forEach($scope.timesheet.tagArr, function(data, key) {
            if(data) {
                valid = true;
                addTimesheetForm.tag.$error.required= false;
            }
        });

        return valid;
    };

    /* Group by date and sort by */
    $scope.$watch('timeEntries', function(value) {
        var output = [];
        angular.forEach(value, function(data, key) {
            value[key].date = getFormattedTime(parseInt(data.start_time), true);
            value[key].dateTime = parseInt(data.start_time);
            if(data.total_time) {
                //value[key].timeInSeconds = toSeconds(data.total_time.toString());
                value[key].timeInSeconds = parseFloat(data.total_time);
            }
        });

        $scope.sortedTimeEntries = groupBy(value, 'date');

        $scope.sortedTimeEntries.sort(function(a, b){
            return b.dateTime - a.dateTime;
        });

        /* Total Duration */
        angular.forEach($scope.sortedTimeEntries, function(data1, tkey) {
            var total_duration = 0;
            angular.forEach(data1.data, function(timesheet, ttkey) {
                if(timesheet.timeInSeconds) {
                    total_duration += timesheet.timeInSeconds;
                }
            });

            //$scope.sortedTimeEntries[tkey].totalDuration = toHHMMSS(total_duration);
            $scope.sortedTimeEntries[tkey].totalDuration = total_duration.toFixed(2);

            /* Sort time entries descending order */
            data1.data.sort(function(a, b){
                return b.start_time-a.start_time;  //sort by date ascending
            });

        });


    }, true);

    $scope.delete_entry = function(id) {
        if(confirm("Deleted Time Entries cannot be restored"))
        {
            /* Send Data to server */
            timesheet.removeTimesheet(id).success(function(data) {
                OfflineStorage.removeTimeEntry(id).then(function() {
                    $scope.timeEntries =  OfflineStorage.getDocs('timesheet');
                });
            }).error(function(data) {
                /* Update deleted flag to 1 */
                OfflineStorage.updateTimesheetStatus(uuid, 'updateRemove').then(function(offlineDbData) {
                    $scope.timeEntries =  OfflineStorage.getDocs('timesheet');
                });
            });
        }
        else
        {
            return false;
        }

    };

    $scope.clearFields = function() {
        $scope.timesheet.project = {};
        $scope.timesheet.desc = "";
        $scope.timesheet.tagArr = {};
        /*var temp = angular.copy($scope.timesheet.tagArr);
         angular.forEach(temp, function(tag, key) {
         temp[key] = false;
         });

         $scope.timesheet.tagArr = angular.copy(temp);*/
        $scope.$broadcast('timer-reset');
    };

    $scope.continue_entry = function(uuid, addTimesheetForm) {

        if($scope.timerRunning) {
            $scope.stopTimer(addTimesheetForm);
            $scope.startTimer();
        }else {
            $scope.startTimer();
        }

        var timeEntry =  OfflineStorage.getSingleTimeEntry(uuid);
        $scope.timesheet.desc = timeEntry[0].desc;

        $scope.timesheet.project = {};
        $scope.timesheet.project.name = timeEntry[0].project;
        $scope.timesheet.project.id = timeEntry[0].project_id;

        var tagsArr = timeEntry[0].tags.split(',');
        $scope.timesheet.tagArr = {};
        angular.forEach(tagsArr, function(tag, key) {
            $scope.timesheet.tagArr[tag] = true;
        });

        //$scope.timesheet.tagArr = timeEntry[0].tags;

    };

    /* Timer Stopped */
    $scope.$on('timer-stopped', function (event, data){
        var response = {};
        response.desc = $scope.timesheet.desc;

        response.project = ($scope.timesheet.project && $scope.timesheet.project.name != undefined) ? $scope.timesheet.project.name : '';
        response.project_id = ($scope.timesheet.project && $scope.timesheet.project.id != undefined) ? $scope.timesheet.project.id : '';

        /* var total_hrs = (data.hours) ? data.hours  + 'h ': '';
         var total_min = (data.minutes) ? data.minutes + 'm ': '';
         var total_sec = (data.seconds) ? data.seconds + 's ': '';

         var total_time = total_hrs+total_min+total_sec;
         response.time = total_time;
         response.total_time = data.millis;*/

        var startTime = $scope.timesheet.start_time; //convert string date to Date object
        var endTime = $scope.timesheet.end_time;
        var diff = endTime-startTime;
        response.total_time = millisToTime(diff);
        response.total_time = response.total_time.toFixed(2);

        response.status = 0;
        response.uuid = uuid.v4();

        //var tagsArr = timeEntry[0].tag.split(',');
        //$scope.timesheet.tagArr = {};
        var temp = [];
        angular.forEach($scope.timesheet.tagArr, function(value, tag) {
            if(value) {
                temp.push(tag);
            }
        });

        response.tags = temp.join(',');

        response.start_time = $scope.timesheet.start_time;
        response.end_time = $scope.timesheet.end_time;

        response.uid = $scope.uid;

        /* Send Data to server */
        timesheet.saveTimesheet(response).success(function(data) {
            data.status = 1;
            OfflineStorage.addDoc(data, 'timesheet').then(function(offlineDbData) {
                $scope.timeEntries =  OfflineStorage.getDocs('timesheet');
            });
        }).error(function(data) {
            response.status = 0;
            OfflineStorage.addDoc(response, 'timesheet').then(function(offlineDbData) {
                $scope.timeEntries =  OfflineStorage.getDocs('timesheet');
            });
        });

    });

    ipcR.on('get_timer_status', function(event, arg) {
        if($scope.timerRunning == false) {
            ipcR.send('start_idle_timer', $scope.timerRunning);
        }
    });
}]);

function getFormattedTime(unix_timestamp, date) {
    var d = new Date(unix_timestamp);
    var h = (d.getHours().toString().length == 1) ? ('0' + d.getHours() % 12 || 12) : d.getHours() % 12 || 12;
    var m = (d.getMinutes().toString().length == 1) ? ('0' + d.getMinutes()) : d.getMinutes();
    var s = (d.getSeconds().toString().length == 1) ? ('0' + d.getSeconds()) : d.getSeconds();

    if(date) {
        var monthNames = ["Jan", "Feb", "March", "April", "May", "June",
            "July", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        var days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat","Sun"];

        var month = monthNames[d.getMonth()];
        var day = days[d.getDay()-1];
        var date = d.getDate();
        var time = day + "," + date+nth(date) + ' ' + month;
        return time;
    }else {
        var time = h + ':' + m + ':' + s;
        return time;
    }
}

function nth(d) {
    if(d>3 && d<21) return 'th';
    switch (d % 10) {
        case 1:  return "st";
        case 2:  return "nd";
        case 3:  return "rd";
        default: return "th";
    }
}

function millisToTime(millis){
    var hours = Math.floor(millis / 36e5),
        mins = Math.floor((millis % 36e5) / 6e4),
        secs = Math.floor((millis % 6e4) / 1000);

    mins = mins/60;
    return total_time = hours+mins;
    //return hours+':'+mins+':'+secs;
}

function groupBy(arr, key) {
    var newArr = [],
        types = {},
        newItem, i, j, cur;
    for (i = 0, j = arr.length; i < j; i++) {
        cur = arr[i];
        if (!(cur[key] in types)) {
            types[cur[key]] = { date: cur[key], data: [] , totalDuration: 0, dateTime: cur['dateTime']};
            newArr.push(types[cur[key]]);
        }
        types[cur[key]].data.push(cur);
    }
    return newArr;
}


function doesConnectionExist() {
    var xhr = new XMLHttpRequest();
    var file = "http://192.168.7.130/dotahead_template_issues/auth/login";
    var randomNum = Math.round(Math.random() * 10000);

    xhr.open('HEAD', file + "?rand=" + randomNum, false);

    try {
        xhr.send();

        if (xhr.status >= 200 && xhr.status < 304) {
            return true;
        } else {
            return false;
        }
    } catch (e) {
        return false;
    }
}


function toSeconds( time ) {
    var parts = time.split(':');
    return (+parts[0]) * 60 * 60 + (+parts[1]) * 60 + (+parts[2]);
}

function toHHMMSS(sec) {
    var sec_num = parseInt(sec, 10); // don't forget the second parm
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    var time    = hours+':'+minutes+':'+seconds;


    return time;
}

