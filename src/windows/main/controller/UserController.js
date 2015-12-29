myApp.controller('userCtrl', ['$scope', '$location', '$timeout', 'userModel', 'OfflineStorage', '$rootScope',
    function ($scope, $location, $timeout, userModel, OfflineStorage,$rootScope) {

        $scope.userObject =  OfflineStorage.getDocs('user');

        if($scope.userObject && $scope.userObject[0] && $scope.userObject[0].id)
        {
            $scope.user.data = $scope.userObject[0];
            $location.path('/timesheet');
            $scope.user.loggedInUser = true;
        }

        /*Methods*/
        angular.extend($scope, {
            //userObject: { email:'', password:'' },
            loginFormSubmit: false,
            doLogin: function (loginForm) {
                if(loginForm.$valid) {
                    var data = {
                        email: $scope.userLogin.email,
                        password: $scope.userLogin.password
                    };

                    userModel.doLogin(data).success(function (response) {
                        OfflineStorage.truncateDb('user');
                        OfflineStorage.addDoc(response, 'user');
                        //$scope.userObject =  OfflineStorage.getDocs('user');
                        $scope.user.data = response;
                        $scope.user.loggedInUser = true;
                        $location.path('/timesheet');
                    }).error(function (data, status, header) {
                        $scope.user.loggedInUser = false;
                        $scope.user.data = {};
                        $scope.error = true;
                        $scope.errorMsg = data.message;
                    });
                } else {
                    $scope.loginFormSubmit = true;
                    console.log('form has error');
                }
            },

            doLogout: function() {
                OfflineStorage.truncateDb('user');
                userModel.doUserLogout();
                $scope.user.loggedInUser = false;
                $scope.user.data = {};
                $location.path('/');
            }
        });
    }
]);
