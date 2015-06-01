'use strict';

angular.module('applyMyRideApp')
  .controller('LoginController', ['$scope', '$location', 'flash', 'planService', '$http',
    function ($scope, $location, flash, planService, $http) {

      $scope.location = $location.path();
      $scope.disableNext = true;
      $scope.counties = ['Adams', 'Cambria', 'Cumberland', 'Dauphin', 'Franklin', 'Lebanon', 'York'];
      $scope.sharedRideId = planService.sharedRideId;
      $scope.county = planService.county;
      $scope.dateofbirth = planService.dateofbirth;

      $scope.checkId = function() {
        $scope.disableNext = true;
        var path = $location.path();
        if(path == '/'){
          if($scope.sharedRideId && $scope.county){
            var sharedRideId = $scope.sharedRideId;
            if(sharedRideId.toString().length > 3){
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
        planService.sharedRideId = $scope.sharedRideId;
        planService.county = $scope.county;
        planService.dateofbirth = $scope.dateofbirth;
        if(path == '/'){
          $location.path('/authenticateSharedRideId');
        }else if(path == '/authenticateSharedRideId' || path == '/loginError'){
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
        login.session.ecolane_id = planService.sharedRideId.toString();
        login.session.county = planService.county;
        login.session.dob = moment($scope.dateofbirth).format('M/D/YYYY');

        var promise = $http.post('api/v1/sign_in', login);
        promise.error(function(result) {
          //flash.setMessage(result.message)
          $location.path('/loginError');
        });
        promise.then(function(result) {
          planService.authentication_token = result.data.authentication_token;
          planService.email = result.data.email;
          $location.path('/plan/fromDate');
        });
      }
    }
  ]);
