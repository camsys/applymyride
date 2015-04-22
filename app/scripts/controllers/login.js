'use strict';

angular.module('applyMyRideApp')
  .controller('LoginController', ['$scope', '$location', 'flash', 'planService',
    function ($scope, $location, flash, planService) {

      $scope.location = $location.path();
      $scope.sharedRideId = planService.sharedRideId;
      $scope.email = planService.email;

      $scope.detectLoginType = function() {
        $scope.isEmail = /@/.test($scope.emailOrId);
        $scope.isSharedRideId = !$scope.isEmail && /^\d+$/.test($scope.emailOrId);
        $scope.isValidUserId = $scope.isEmail == true || $scope.isSharedRideId == true;
      };

      $scope.next = function(){
        var path = $location.path();
        if(path == '/login'){
          if($scope.isEmail){
            $location.path('/authenticateEmail');
            planService.email = $scope.emailOrId;
          }else if($scope.isSharedRideId){
            $location.path('/authenticateSharedRideId');
            planService.sharedRideId = $scope.emailOrId;
          }
        }else if(path == '/authenticateSharedRideId'){
          planService.username = 'Eric';
          $location.path('/plan/fromDate');
        }else if(path == '/authenticateEmail'){
          planService.username = 'Eric';
          $location.path('/plan/fromDate');
        }
      }

      $scope.back = function(){
        var path = $location.path();
        if(path == '/login'){
          $location.path('/');
        }else if(path == '/authenticateSharedRideId'){
          $location.path('/login');
        }else if(path == '/authenticateEmail'){
          $location.path('/login');
        }
      }

      $scope.disableNext = function(){
        var path = $location.path();
        if(path == '/login'){
          if($scope.isValidUserId == true){
            return false;
          }
        }else if(path == '/authenticateSharedRideId'){
          if($scope.dateofbirth){
            return false;
          }
        }else if(path == '/authenticateEmail'){
          if($scope.password){
            return false;
          }
        }
        return true;
      }

      $scope.$watch('dateofbirth', function() {
          $scope.disableNext();
        }
      );

    }
  ]);
