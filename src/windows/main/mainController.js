/**
 * Created by komal on 3/12/15.
 */
var myApp = angular.module('MainWindow', ['timer', 'myService']);

    myApp.controller('MainCtrl', ['$scope', function($scope) {

    }]);

    myApp.controller('timesheetCtrl', ['timesheet','$scope', function(timesheet, $scope) {
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

