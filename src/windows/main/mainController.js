/**
 * Created by komal on 3/12/15.
 */
angular
    .module('MainWindow', ['timer'])
    .controller('MainCtrl', ['$scope', function($scope) {

    }]).controller('timesheetCtrl', ['$scope', function($scope) {
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

            $scope.response.push(response);


            console.log('Timer Stopped - data = ', data);
        });

    }]);