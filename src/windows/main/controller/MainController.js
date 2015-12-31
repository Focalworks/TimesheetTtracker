myApp.controller('MainCtrl', ['$scope','OfflineStorage','timesheet', '$rootScope','$location', function($scope,OfflineStorage,timesheet, $rootScope, $location) {

    /*Methods*/
    angular.extend($scope, {
        userObject: { email:'', password:'' },
        timeEntries: [],
        projects: {},
        fwToggle: {},
        uid: 0,
        user: {loggedInUser:false, data:[]}

    });

    $scope.init = function() {
        /* Load Projects */
        if(!$scope.fwToggle.projectArr.length) {
            timesheet.getProjects().success(function(data) {
                $scope.fwToggle.projectArr = data;
                angular.forEach($scope.fwToggle.projectArr, function (project, key) {
                    OfflineStorage.addDoc(project, 'projects'); /* ADD Projects */
                });
            });
        }

        /* Load Tags */
        if(!$scope.fwToggle.tagArr.length) {
            timesheet.getTags().success(function(data) {
                $scope.fwToggle.tagArr = data;
                angular.forEach($scope.fwToggle.tagArr, function (tag, key) {
                    OfflineStorage.addDoc(tag, 'tags'); /* ADD Projects */
                });
               /* console.log("INSIDE TAG", data);
                OfflineStorage.addDoc(data, 'tags');  *//*Update status of entry */
            });
        }
    };

    /* Load Offline Database */
    OfflineStorage
        .init()
        .then(function (db) {
            $scope.fwToggle.projectArr = db.getDocs('projects');
            console.log($scope.fwToggle.projectArr);
            var tagsObj = db.getDocs('tags');
            $scope.fwToggle.tagArr = (tagsObj.length) ? tagsObj : {};
            $scope.init();
            OfflineStorage
                .reload()
                .then(function () {
                    $scope.timeEntries =  db.getDocs('timesheet');
                });
        });

}]);