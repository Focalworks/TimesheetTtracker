var uuid = require('node-uuid');
var _templateBase = '';
var myApp = angular.module('MainWindow', ['timer', 'myService', 'offlineService', 'userModelService', 'ngRoute']);

myApp.config(['$routeProvider', '$locationProvider',
    function ($routeProvider, $locationProvider) {
        $routeProvider.when('/', {
            templateUrl: _templateBase+'login.html',
            controller: 'userCtrl'
        });

        $routeProvider.when('/timesheet', {
            templateUrl: _templateBase+'timesheet_form.html',
            controller: 'timesheetCtrl'
        });
    }]);

myApp.controller('userCtrl', ['$scope', '$location', '$timeout', 'userModel', 'OfflineStorage',
    function ($scope, $location, $timeout, userModel, OfflineStorage) {
        OfflineStorage
            .init().then(function(db){

                $scope.userObject =  db.getDocs('user');
                console.log($scope.userObject);
                if($scope.userObject && $scope.userObject[0] && $scope.userObject[0].id)
                {
                    $location.path('/timesheet');
                }
                /*Methods*/
                angular.extend($scope, {
                    userObject: { email:'', password:'' },
                    doLogin: function (doLogin) {
                        $scope.loginStatus = false;

                        var data = {
                            email: $scope.userLogin.email,
                            password: $scope.userLogin.password
                        };

                        userModel.doLogin(data).success(function (response) {
                            OfflineStorage.truncateDb('user');
                            OfflineStorage.addDoc(response, 'user');
                            $location.path('/timesheet');
                        }).error(function (data, status, header) {
                            $scope.loginStatus = true;
                            $scope.error = true;
                            $scope.errorMsg = data.message;
                        });
                    }
                });
            });
    }
]);

myApp.controller('MainCtrl', ['$scope','OfflineStorage','timesheet', '$rootScope','$interval', function($scope,OfflineStorage,timesheet, $rootScope, $interval) {
    $scope.timeEntries = [];
    $scope.projects = {};
    $scope.timesheet = {};

    window.addEventListener('online', function() {
        //console.log(test);
    });

    var syncData = false;

    /* Initial Data Fetch From DB */
    OfflineStorage
        .init()
        .then(function (db) {

            /* Load TimeEnteries From Offline and Sync Data to Online*/
             var timeEntries = db.getDocs('timesheet', 'all');

            if(timeEntries.length) {
                angular.forEach(timeEntries, function(data, key) {
                    if(!data.status) {
                        syncData = true;
                    }
                });

                if(syncData) {
                    $scope.synData(timeEntries); /* Sync data to online for status 0 */
                }
            }

            /* Load timeEntries Form Online */
            timesheet.getTimesheet().success(function(data) {
                OfflineStorage.truncateDb('timesheet');

                $scope.timeEntries = data;

                angular.forEach($scope.timeEntries, function (timeEntry, key) {
                    OfflineStorage.addDoc(timeEntry, 'timesheet');  /* Add entry */
                });
            }).error(function(e) {
                $scope.timeEntries = db.getDocs('timesheet'); /* Load offline Data on error */
            });


            /* Load Projects */
            $scope.timesheet.projectArr = db.getDocs('projects');
            if(!$scope.timesheet.projectArr.length) {
                timesheet.getProjects().success(function(data) {
                    $scope.timesheet.projectArr = data;
                    angular.forEach($scope.timesheet.projectArr, function (project, key) {
                        OfflineStorage.addDoc(project, 'projects'); /* ADD Projects */
                    });
                });
            }

            /* Load Tags */
            var tagsObj = db.getDocs('tags');
            $scope.timesheet.tagArr = (tagsObj.length) ? tagsObj[0].tags : {};

            if(!$scope.timesheet.tagArr.length) {
                timesheet.getTags().success(function(data) {
                    $scope.timesheet.tagArr = data.tags;
                    OfflineStorage.addDoc(data, 'tags');  /*Update status of entry */
                });
            }

            OfflineStorage
                .reload()
                .then(function () {
                    $scope.timeEntries =  db.getDocs('timesheet');
                });
        });

    /* Helper Function to sync data to online */
    $scope.synData = function(TimesheetData) {
        timesheet.syncTimesheets(TimesheetData).success(function (response) {
            angular.forEach(TimesheetData, function (data, key) {
                OfflineStorage.updateTimesheetStatus(data.uuid); /* Update status of entry */
            });
            //$scope.timeEntries = OfflineStorage.getDocs('timesheet');
        });
    };

}]);

myApp.controller('timesheetCtrl', ['timesheet','OfflineStorage','$scope',  function(timesheet, OfflineStorage, $scope) {
    /*$scope.timesheet = {};
     $scope.timesheet.projectArr = ['Fashion App', 'Sunpharma'];
     $scope.timesheet.tagArr = {RND: false, Development: false};*/
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
        };

        /* Stop Timer on click */
        $scope.stopTimer = function (addTimesheetForm){
            var formIsValid = $scope.validate_fields(addTimesheetForm);
            if(formIsValid && addTimesheetForm.$valid) {
                $scope.timesheet.end_time = new Date().getTime();
                $scope.timesheet.end_time_format = getFormattedTime($scope.timesheet.end_time);
                $scope.$broadcast('timer-stop');
                $scope.timerRunning = false;
            }else {
                $scope.addTimesheetFormSubmit = true;
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
                    value[key].timeInSeconds = toSeconds(data.total_time.toString());
                }
            });

            $scope.sortedTimeEntries = groupBy(value, 'date');

            $scope.sortedTimeEntries.sort(function(a, b){
                return b.dateTime - a.dateTime;
            });

            /* Sort time entries descending order */
            angular.forEach($scope.sortedTimeEntries, function(data1, tkey) {
                var total_duration = 0;
                angular.forEach(data1.data, function(timesheet, ttkey) {
                    if(timesheet.timeInSeconds) {
                        total_duration += timesheet.timeInSeconds;
                    }
                });
                $scope.sortedTimeEntries[tkey].totalDuration = toHHMMSS(total_duration);

                data1.data.sort(function(a, b){
                    return b.end_time-a.end_time;  //sort by date ascending
                });


                //$scope.$apply();

            });

            console.log("$scope.sortedTimeEntries", $scope.sortedTimeEntries);


        }, true);

    $scope.delete_entry = function(uuid) {
        if(confirm("Deleted Time Entries cannot be restored"))
        {
            /* Send Data to server */
            timesheet.removeTimesheet(uuid).success(function(data) {
                OfflineStorage.removeTimeEntry(uuid).then(function() {
                    $scope.timeEntries =  OfflineStorage.getDocs('timesheet');
                });
            }).error(function(data) {
                 /* Update deleted flag to 1 */
                 OfflineStorage.updateTimesheetStatus(uuid, 'updateRemove').then(function(offlineDbData) {
                    $scope.timeEntries =  OfflineStorage.getDocs('timesheet');
                     console.log("NEW", $scope.timeEntries);
                 });
            });
        }
        else
        {
            return false;
        }

    };

    $scope.continue_entry = function(uuid, addTimesheetForm) {
        if($scope.timerRunning) {
            $scope.stopTimer(addTimesheetForm);
            $scope.startTimer();
        }else {
            $scope.startTimer();
        }

        var timeEntry =  OfflineStorage.getSingleTimeEntry(uuid);
        $scope.timesheet.description = timeEntry[0].description;
        //$scope.timesheet.project = timeEntry[0].project;

        $scope.timesheet.project = {};
        $scope.timesheet.project.name = timeEntry[0].project;
        $scope.timesheet.project.id = timeEntry[0].project_id;
        $scope.timesheet.tagArr = timeEntry[0].tags;
        console.log("CONTINUE", timeEntry);

       /* angular.forEach(timeEntry[0].tags, function (tag, key) {
            console.log("key",  key);

            //$scope.timesheet.tagArr[key] = true;
        });*/
        //$scope.timesheet.tags = timeEntry[0].tags;

        /*angular.forEach(timeEntry[0].tags, function (tag, key) {
            $scope.timesheet.tagArr[key] = true;
        });*/

       /* var tags = timeEntry[0].tags.split(',');
        console.log(tags.length);
        if(tags) {
            angular.forEach(tags, function (tag, key) {
                $scope.timesheet.tagArr[tag] = true;
            });
            console.log("Onlu tags");
        }*/

    };


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

        /* Timer Stopped */
        $scope.$on('timer-stopped', function (event, data){
            var response = {};
            response.description = $scope.timesheet.description;

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

            response.status = 0;
            response.uuid = uuid.v4();

            response.tags = $scope.timesheet.tagArr;

            response.start_time = $scope.timesheet.start_time;
            response.end_time = $scope.timesheet.end_time;
            console.log("response", response);
            /* Send Data to server */
            timesheet.saveTimesheet(response).success(function(data) {
                response.status = 1;
                OfflineStorage.addDoc(response, 'timesheet').then(function(offlineDbData) {
                    $scope.timeEntries =  OfflineStorage.getDocs('timesheet');
                    console.log("SAVE", $scope.timesheet);

                    $scope.clearFields();
                });
            }).error(function(data) {
                OfflineStorage.addDoc(response, 'timesheet').then(function(offlineDbData) {
                    $scope.timeEntries =  OfflineStorage.getDocs('timesheet');
                    $scope.clearFields();
                });
            });

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

        var days = ["Mon", "Tues", "Wed", "Thurs", "Fri", "Sat","Sun"];

        var month = monthNames[d.getMonth()];
        var day = days[d.getDay()];
        var date = d.getDate();
        var time = day + "," + date+nth(date) + ' ' + month;
        return time;
    }else {
        var time = h + ':' + m + ':' + s;
        return time;
    }
}

function nth(d) {
    if(d>3 && d<21) return 'th'; // thanks kennebec
    switch (d % 10) {
        case 1:  return "st";
        case 2:  return "nd";
        case 3:  return "rd";
        default: return "th";
    }
}

function millisToTime(millis){
    //Thank you MaxArt.
    var hours = Math.floor(millis / 36e5),
        mins = Math.floor((millis % 36e5) / 6e4),
        secs = Math.floor((millis % 6e4) / 1000);
    return hours+':'+mins+':'+secs;
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