'use strict';

angular.module('applyMyRideApp')
  .controller('LoginController', ['$scope', '$location', 'flash', 'planService', '$http',
    function ($scope, $location, flash, planService, $http) {

      $scope.location = $location.path();
      $scope.disableNext = true;
      $scope.counties = ['Adams', 'Cambria', 'Cumberland', 'Dauphin', 'Franklin', 'Lebanon', 'York'];
      $scope.sharedRideId = planService.sharedRideId;

      $scope.checkId = function() {
        $scope.disableNext = true;
        var path = $location.path();
        if(path == '/'){
          if($scope.sharedRideId && $scope.county){
            var sharedRideId = $scope.sharedRideId;
            if(sharedRideId.length > 3){
              if(!isNaN(sharedRideId)){
                $scope.disableNext = false;
              }
            }
          }
        }else{
          if($scope.dateofbirth){
            $scope.disableNext = false;
          }
        }
      };

      $scope.next = function(){
        if($scope.disableNext)
          return;
        var path = $location.path();
        if(path == '/'){
          planService.sharedRideId = $scope.sharedRideId;
          planService.county = $scope.county;
          $location.path('/authenticateSharedRideId');
          $scope.$apply();
        }else if(path == '/authenticateSharedRideId'){
          $scope.authenticate();
        }
      }

      $scope.back = function(){
        $location.path('/');
      }

      $scope.$watch('dateofbirth', function(n) {
          $scope.checkId();
        }
      );

      $scope.authenticate = function(){
        planService.dateofbirth = $scope.dateofbirth;
        var login = {};
        login.session = {};
        login.session.ecolane_id = planService.sharedRideId;
        login.session.county = planService.county;
        login.session.dob = moment($scope.dateofbirth).format('M/D/YYYY');

        var promise = $http.post('api/v1/sign_in', login);
        promise.error(function(result) {
          flash.setMessage(result.message)
          $location.path('/');
        });
        promise.then(function(result) {
          planService.authentication_token = result.data.authentication_token;
          planService.email = result.data.email;
          $location.path('/plan/fromDate');
        });
      }
    }
  ]);
