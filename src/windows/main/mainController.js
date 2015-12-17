/**
 * Created by komal on 3/12/15.
 */
var myApp = angular.module('MainWindow', ['timer', 'myService']);

    /*myApp.config(function ($httpProvider) {
        $httpProvider.interceptors.push('Interceptor');
    });*/
    myApp.controller('MainCtrl', ['$scope', '$rootScope','$interval', function($scope, $rootScope, $interval) {

        console.log("Newtork" , doesConnectionExist());


        window.addEventListener('online', function() {
            console.log("Newtork" , doesConnectionExist());
            //console.log(test);
        });

    }]);

    myApp.controller('timesheetCtrl', ['timesheet','$scope',  function(timesheet, $scope) {
        $scope.timesheet = {};
        $scope.timesheet.projectArr = ['Fashion App', 'Sunpharma'];

        $scope.timesheet.tagArr = {RND: false, Development: false};

        $scope.timerRunning = false;
        $scope.startTimer = function (){
            $scope.$broadcast('timer-start');
            $scope.timerRunning = true;

        };

        $scope.stopTimer = function (){
            $scope.$broadcast('timer-stop');
            $scope.timerRunning = false;
        };



        $scope.response = [];
        $scope.$on('timer-stopped', function (event, data){
            var response = {};
            response.description = $scope.timesheet.description;
            response.project = $scope.timesheet.project;

            var total_hrs = (data.hours) ? data.hours  + 'h ': '';
            var total_min = (data.minutes) ? data.minutes + 'm ': '';
            var total_sec = (data.seconds) ? data.seconds + 's ': '';

            var total_time = total_hrs+total_min+total_sec;
            response.time = total_time;
            response.total_time = data.millis;


            timesheet.saveTimesheet(response).success(function(data) {
                $scope.response.push(data);
            });


            console.log('Timer Stopped - data = ', data);
        });

        timesheet.getTimesheet().success(function(response) {
            $scope.timsheet = response;
            console.log('Get Data', response);
        });



    }]);

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

/*
myApp.factory('Interceptor', function($rootScope){
    var Interceptor ={
        responseError: function(response){
            $rootScope.status = response.status;
            $rootScope.online = false;
            return response;
        },
        response: function(response){
            $rootScope.status = response.status;
            $rootScope.online = true;
            return response;
        }
    };
    return Interceptor;
});

myApp.factory('Factory', function($q, $http, $rootScope){
        var httpLoc = 'http://google.com';
        return{
            ckIfOnline: function(){
                */
/*$http.get(httpLoc).on('error', function() {
                    console.log("ERROR");
                });*//*

                */
/*var xmlHttp = new XMLHttpRequest();
                xmlHttp.onreadystatechange = function() {
                    if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                        console.log(xmlHttp.responseText);
                    }
                    else {
                        console.log("Error");
                    }
                }
                xmlHttp.open("GET", httpLoc, true); // true for asynchronous
                xmlHttp.send(null);*//*


                $http({
                    method: 'GET',
                    url: httpLoc
                }).then(function successCallback(response) {
                    if(response) {
                        console.log("success");
                    }else {
                        console.log("ERROR");
                    }
                    // this callback will be called asynchronously
                    // when the response is available
                }, function errorCallback(response) {
                    console.log("ERROR");
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });
            }

        }
});

*/
