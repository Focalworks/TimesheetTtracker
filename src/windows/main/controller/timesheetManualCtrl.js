/**
 * Created by komal on 29/12/15.
 */
var uuid = require('node-uuid');

myApp.controller('timesheetManualCtrl', ['timesheet','OfflineStorage','$scope','$location',  function(timesheet, OfflineStorage, $scope, $location) {

    $scope.userObject =  OfflineStorage.getDocs('user');
    if($scope.userObject.length) {
        $scope.uid = $scope.userObject[0].id;
    }

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


    /* Save timesheet on click */
    $scope.addManualEntry = function (addTimesheetForm){
        var formIsValid = $scope.validate_fields(addTimesheetForm);
        if(formIsValid && addTimesheetForm.$valid) {
            $scope.timesheet.start_time = new Date().getTime();
            $scope.addTimesheetFormSubmit = false;
            $scope.saveTimesheet();
        }else {
            $scope.addTimesheetFormSubmit = true;
        }
    };

    $scope.saveTimesheet = function() {

        var response = {};
        response.description = $scope.timesheet.description;

        response.project = ($scope.timesheet.project && $scope.timesheet.project.name != undefined) ? $scope.timesheet.project.name : '';
        response.project_id = ($scope.timesheet.project && $scope.timesheet.project.id != undefined) ? $scope.timesheet.project.id : '';

        response.total_time = $scope.timesheet.total_time;

        response.status = 0;
        response.uuid = uuid.v4();

        response.tags = $scope.timesheet.tagArr;

        response.start_time = $scope.timesheet.start_time;

        response.uid = $scope.uid;

        /* Send Data to server */
        timesheet.saveTimesheet(response).success(function(data) {
            response.status = 1;
            OfflineStorage.addDoc(response, 'timesheet').then(function(offlineDbData) {
                $scope.timeEntries =  OfflineStorage.getDocs('timesheet');
                $location.path('/timesheet');
            });
        }).error(function(data) {
            OfflineStorage.addDoc(response, 'timesheet').then(function(offlineDbData) {
                $scope.timeEntries =  OfflineStorage.getDocs('timesheet');
                $location.path('/timesheet');
            });
        });
    }

}]);