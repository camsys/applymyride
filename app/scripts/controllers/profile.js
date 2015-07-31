'use strict';

angular.module('applyMyRideApp')
  .controller('ProfileController', ['$scope', '$location', 'flash', 'planService', '$http', 'ipCookie', '$window',
    function ($scope, $location, flash, planService, $http, ipCookie, $window) {
      $scope.location = $location.path();
      $scope.speeds = ['slow', 'average', 'fast'];
      $scope.distances = ['0.25 miles', '0.5 miles', '0.75 miles', '1 mile', '2 miles'];
      $scope.editable = false;
      var profilePromise = planService.getProfile($http);
      profilePromise.then(function(results){
        $scope.profile = results.data;
        $scope.email = $scope.profile.email;
        $scope.walkingSpeed = $scope.profile.walking_speed;
        if($scope.profile.walking_distance == '1'){
          $scope.walkingDistance = $scope.profile.walking_distance + " mile";
        }else{
          $scope.walkingDistance = $scope.profile.walking_distance + " miles";
        }

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

            $scope.walkingDistance = $scope.walkingDistance.substr(0, $scope.walkingDistance.indexOf(" "));

            var profileUpdate = {
              "attributes": {
                "email": $scope.email,
                "walking_speed": $scope.walkingSpeed,
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
