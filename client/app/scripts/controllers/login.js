'use strict';

angular.module('applyMyRideApp')
  .controller('LoginController', ['$scope', '$location',
    function ($scope, $location) {
      $scope.detectLoginType = function() {
        $scope.isEmail = /@/.test($scope.login.emailOrId);
        $scope.isSharedRideId = !$scope.isEmail && /^\d+$/.test($scope.login.emailOrId);
      }

      $scope.submittable = function() {
        var f = $scope.loginForm;
        console.log(f.email);
        console.log(f.email.$valid);
        console.log(f.email.$viewValue);
        console.log(f.sharedRideId.$viewValue);
      }

      $scope.login = function() {
        console.log('login');
        $location.path('/plan');
      }
    }
  ]);
