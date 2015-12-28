/**
 * Created by komal on 16/12/15.
 */

var myService = angular.module('myService', []);
myService.service('timesheet', ['$http', '$rootScope', function ($http, $rootScope) {

    //var baseUrl = "http://localhost/timesheet/public/";

    this.getTimesheet = function () {
        return $http.get(baseUrl + 'timesheet');
    };

    this.getProjects = function () {
        return $http.get(baseUrl + 'projects');
    };

    this.getTags = function () {
        return $http.get(baseUrl + 'tags');
    };

    this.saveTimesheet = function (timesheetData) {

        var url = baseUrl + 'timesheet/save';
        var method = "POST"
        return $http({
            headers: {
                'Content-Type': 'application/json'
            },
            url: url,
            method: method,
            data: timesheetData
        })
    };

    this.removeTimesheet = function (uuid) {

        var url = baseUrl + 'timesheet/delete';
        var method = "POST"
        return $http({
            headers: {
                'Content-Type': 'application/json'
            },
            url: url,
            method: method,
            data: {uuid:uuid}
        })
    };

    this.syncTimesheets = function (timesheetData) {
        return $http({
            headers: {
                'Content-Type': 'application/json'
            },
            url: baseUrl + 'timesheet/sync-timesheets',
            method: "POST",
            data: timesheetData
        })
    };
}]);