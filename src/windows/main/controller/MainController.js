var uuid = require('node-uuid');

myApp.controller('MainCtrl', ['$scope','OfflineStorage','timesheet', '$rootScope','$location', function($scope,OfflineStorage,timesheet, $rootScope, $location) {

    /*Methods*/
    angular.extend($scope, {
        userObject: { email:'', password:'' },
        timeEntries: [],
        projects: {},
        timesheet: {},
        uid: 0,
        loggedInUser: false
    });


    /* Load Offline Database */
    OfflineStorage
        .init()
        .then(function (db) {
            $scope.userObject =  db.getDocs('user');
            $scope.timesheet.projectArr = db.getDocs('projects');
            var tagsObj = db.getDocs('tags');
            $scope.timesheet.tagArr = (tagsObj.length) ? tagsObj[0].tags : {};

            OfflineStorage
                .reload()
                .then(function () {
                    $scope.timeEntries =  db.getDocs('timesheet');
                    $scope.userObject =  db.getDocs('user');

                    if($scope.userObject.length) {
                        $scope.loggedInUser = true;
                    }
                });
        });


    $scope.$watch('loggedInUser', function(value) {
        if(value) {
            $location.path('/timesheet');
        }
    });

}]);