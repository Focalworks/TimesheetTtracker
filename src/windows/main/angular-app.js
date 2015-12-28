var myApp = angular.module('MainWindow', [
    'timer',
    'myService',
    'offlineService',
    'userModelService',
    'ngRoute'
]);

myApp.config(['$routeProvider', '$locationProvider',
    function ($routeProvider, $locationProvider) {
        $routeProvider.when('/', {
            templateUrl: './views/login.html',
            controller: 'userCtrl'
        });

        $routeProvider.when('/timesheet', {
            templateUrl: './views/timesheet_form.html',
            controller: 'timesheetCtrl'
        });
        $routeProvider.otherwise( { redirectTo: "/timesheet" });
}]);