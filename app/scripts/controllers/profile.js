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
        if($scope.email == "")
            $scope.email_editable = false;
        else
            $scope.email_editable = true;

      });


      $scope.toggleEdit = function() {
        if($scope.editable == true){
          if($scope.email_editable){
            $scope.invalidEmail = !planService.validateEmail($scope.email);
          }
          else{
            $scope.invalidEmail = false;
          }

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

            var profileUpdate = {};
                
            profileUpdate.attributes = {};
            profileUpdate.attributes.walking_speed = $scope.walkingSpeed;
            profileUpdate.attributes.walking_distance = $scope.walkingDistance;
            
            if($scope.email){
              profileUpdate.attributes.email = $scope.email;
            }

            planService.profileUpdateObject = profileUpdate;
            planService.postProfileUpdate($http)
            .then(function(result){
              if($scope.email_editable && result.statusText === 'OK'){
                planService.email = $scope.email;
                ipCookie('email', planService.email, {expires: 7, expirationUnit: 'days'});
              }
            });
          }
        }else{
          $scope.editable = true;
          if($scope.email == "")
            $scope.email_editable = false;
          else
            $scope.email_editable = true;
        }
      };
    }

  ]);
