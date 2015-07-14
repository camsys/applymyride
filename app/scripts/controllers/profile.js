'use strict';

angular.module('applyMyRideApp')
  .controller('ProfileController', ['$scope', '$location', 'flash', 'planService', '$http', 'ipCookie', '$window',
    function ($scope, $location, flash, planService, $http, ipCookie, $window) {
      $scope.location = $location.path();
      $scope.speeds = ['Slow', 'Average', 'Fast'];
      $scope.distances = ['.25', '.5', '.75', '1', '2'];
      $scope.editable = false;

      $scope.toggleEdit = function() {
        if($scope.editable == true){
          $scope.invalidEmail = !planService.validateEmail($scope.email);
          if(!$scope.walkingDistance){
            $scope.invalidDistance = true;
          }else{
            $scope.invalidDistance = false;
          }
          if(!$scope.walkingSpeed){
            $scope.invalidSpeed = true;
          }else{
            $scope.invalidSpeed = false;
          }
          if($scope.invalidEmail == false && $scope.invalidDistance == false && $scope.invalidSpeed == false ) {
            ipCookie('email', $scope.email, {expires: 7, expirationUnit: 'days'});
            ipCookie('walkingDistance', $scope.walkingDistance, {expires: 7, expirationUnit: 'days'});
            ipCookie('walkingSpeed', $scope.walkingSpeed, {expires: 7, expirationUnit: 'days'});
            var profileUpdate = {
              "attributes": {
                "email": $scope.email,
                "walking_speed": $scope.walkingSpeed.toLowerCase(),
                "walking_distance": $scope.walkingDistance.substr($scope.walkingDistance.indexOf(' Miles'))
              }
            }
            planService.profileUpdateObject = profileUpdate;
            planService.postProfileUpdate($http);
            $scope.editable = false;
            flash.setMessage('Your profile was updated.');
          }
        }else{
          $scope.editable = true;
        }
      };
    }
  ]);
