'use strict';

angular.module('applyMyRideApp')
  .controller('ProfileController', ['$scope', '$location', 'flash', 'planService', '$http', 'ipCookie', '$window',
    function ($scope, $location, flash, planService, $http, ipCookie, $window) {
      $scope.location = $location.path();
      $scope.speeds = ['slow', 'average', 'fast'];
      $scope.distances = ['.25', '.5', '.75', '1', '2'];
      $scope.editable = false;
      var profilePromise = planService.getProfile($http);
      profilePromise.then(function(results){
        console.log(results.data);
        $scope.profile = results.data;
        $scope.email = $scope.profile.email;
        $scope.walkingSpeed = $scope.profile.walking_speed;
        $scope.walkingDistance = $scope.profile.walking_distance;
      });


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
            var profileUpdate = {
              "attributes": {
                "email": $scope.email,
                "walking_speed": $scope.walkingSpeed.toLowerCase(),
                "walking_distance": $scope.walkingDistance
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
