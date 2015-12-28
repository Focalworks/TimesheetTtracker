myApp.controller('userCtrl', ['$scope', '$location', '$timeout', 'userModel', 'OfflineStorage', '$rootScope',
    function ($scope, $location, $timeout, userModel, OfflineStorage,$rootScope) {

            /*Methods*/
            angular.extend($scope, {
                //userObject: { email:'', password:'' },
                doLogin: function (doLogin) {
                    $scope.loginStatus = false;

                    var data = {
                        email: $scope.userLogin.email,
                        password: $scope.userLogin.password
                    };

                    userModel.doLogin(data).success(function (response) {
                        OfflineStorage.truncateDb('user');
                        OfflineStorage.addDoc(response, 'user');
                        $scope.userObject =  OfflineStorage.getDocs('user');
                        $scope.loggedInUser = true;
                        $location.path('/timesheet');
                    }).error(function (data, status, header) {
                        $scope.loginStatus = true;
                        $scope.error = true;
                        $scope.errorMsg = data.message;
                    });
                }
            });
    }
]);
