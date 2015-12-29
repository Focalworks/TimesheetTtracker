var uuid = require('node-uuid');

myApp.controller('MainCtrl', ['$scope','OfflineStorage','timesheet', '$rootScope','$location', function($scope,OfflineStorage,timesheet, $rootScope, $location) {

    /*Methods*/
    angular.extend($scope, {
        userObject: { email:'', password:'' },
        timeEntries: [],
        projects: {},
        timesheet: {},
        uid: 0,
        user: {loggedInUser:false, data:[]},

    });


    /* Load Offline Database */
    OfflineStorage
        .init()
        .then(function (db) {
            $scope.timesheet.projectArr = db.getDocs('projects');
            var tagsObj = db.getDocs('tags');
            $scope.timesheet.tagArr = (tagsObj.length) ? tagsObj[0].tags : {};

            OfflineStorage
                .reload()
                .then(function () {
                    $scope.timeEntries =  db.getDocs('timesheet');
                });
        });
}]);