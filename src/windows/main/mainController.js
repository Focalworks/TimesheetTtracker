/**
 * Created by komal on 3/12/15.
 */
angular
    .module('MainWindow', [])
    .controller('MainCtrl', ['$scope', function($scope) {

    }]).controller('timesheetCtrl', ['$scope', function($scope) {
        $scope.timesheet = {};
        $scope.timesheet.projectArr = ['Fashion App', 'Sunpharma'];
        $scope.timesheet.tagArr = ['RND', 'Development', 'PHP'];
    }]);