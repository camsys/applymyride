'use strict';

angular.module('applyMyRideApp')
  .controller('ProfileController', ['$scope', '$location', 'flash', 'planService', '$http', 'ipCookie', '$window',
    function ($scope, $location, flash, planService, $http, ipCookie, $window) {
      $scope.location = $location.path();
      $scope.editable = false;
      var profilePromise = planService.getProfile($http);
      profilePromise.then(function(results){
        $scope.profile = results.data;
        $scope.email = $scope.profile.email;
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


          if($scope.invalidEmail == false ) {


            var profileUpdate = {};
                
            profileUpdate.attributes = {};
            
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
