/**
 * Created by komal on 3/12/15.
 */
var myApp = angular.module('MainWindow', ['timer', 'myService']);

    myApp.config(function ($httpProvider) {
        $httpProvider.interceptors.push('Interceptor');
    });
    myApp.controller('MainCtrl', ['$scope', '$rootScope', 'Factory', '$interval', function($scope, $rootScope, Factory, $interval) {
        //var running;
        //$scope.online = $rootScope.online
        //Factory.ckIfOnline();
        //
        //$rootScope.$watch('online', function(newValue, oldValue){
        //    if (newValue !== oldValue) {
        //        $scope.online=$rootScope.online;
        //    }
        //    console.log($scope.online);
        //});
        //
        ////$scope.toggle=function(){
        //    if (running) {
        //        $interval.cancel(running);
        //        running=null;
        //        $scope.running='not polling server';
        //    }else{
        //        $scope.running='polling server';
        //        running = $interval(function(){
        //            console.log('running update')
        //            Factory.ckIfOnline();
        //        },5000);
        //    }
        //}
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
})
    .factory('Factory', function($q, $http, $rootScope){
        var httpLoc = 'http://google.com';
        return{
            ckIfOnline: function(){
                $http.get(httpLoc);
            },
        }
    })

