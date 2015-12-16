/**
 * Created by komal on 16/12/15.
 */

var myService = angular.module('myService', []);
myService.service('timesheet', ['$http', '$rootScope', function ($http, $rootScope) {

    var baseUrl = "http://localhost/RND/laravel_rnd/timesheet/public/";

    this.getTimesheet = function () {
        return $http.get(baseUrl + 'timesheet');
    };

    //return timesheetModel;
    this.saveTimesheet = function (timesheetData) {

        var url = baseUrl + 'timesheet/save';
        var method = "POST"
       /* if(timesheetData.id !=undefined) {
            url = baseUrl + 'asset' + '/' + assetData.id;
            method = "PUT";
        }
*/
        return $http({
            headers: {
                'Content-Type': 'application/json'
            },
            url: url,
            method: method,
            data: timesheetData
        });
    };
}]);
