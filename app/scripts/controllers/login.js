'use strict';

angular.module('applyMyRideApp')
  .controller('LoginController', ['$scope', '$location', 'flash', 'planService', '$http', 'ipCookie', '$window',
    function ($scope, $location, flash, planService, $http, ipCookie, $window) {
      
      //this should probably be in a service if there's anything more
      var countiesURL = ('findmyridepa2-qa.camsys-apps.com' == document.location.hostname)
                      ? 'http://oneclick-pa-qa.camsys-apps.com/api/v1/services/ids_humanized'
                      : '/api/v1/services/ids_humanized';
      $http({
        method: 'GET',
        url: countiesURL
      }).then(function successCallback(response) {
        //update the counties
        $scope.counties = response.data.service_ids;
      }, function errorCallback(response) {
            console.error(response);
      });
      $scope.location = $location.path();
      $scope.disableNext = true;
      $scope.counties = [];
      $scope.sharedRideId = planService.sharedRideId;
      $scope.county = planService.county;
      $scope.dateofbirth = planService.dateofbirth;

      var authentication_token = ipCookie('authentication_token');
      var email = ipCookie('email');
      $window.visited = true;

      if(authentication_token && email){
        planService.authentication_token = authentication_token;
        planService.email = email;
        $location.path('/plan/fromDate');
      }

      $scope.checkId = function() {
        $scope.disableNext = true;
        var path = $location.path();
        if(path == '/'){
          if($scope.sharedRideId && $scope.county && $scope.dateofbirth){
            var sharedRideId = $scope.sharedRideId;
            if(sharedRideId.toString().length > 0){
              $scope.disableNext = false;
            }
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

      $scope.$watch('birthdate', function(n) {
          var dob = new Date($scope.birthdate);
          //return if dob is invalid
          if( isNaN( dob.getYear() ) ){
              $scope.disableNext = true;
              $scope.dateofbirth = undefined;
              return;
          }
          //if date is valid, save for later
          $scope.dateofbirth = dob;
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
          $location.path('/loginError');
        });
        promise.then(function(result) {
          planService.authentication_token = result.data.authentication_token;
          planService.email = result.data.email;
          planService.first_name = result.data.first_name;
          planService.last_name = result.data.last_name;
          planService.getRides($http, $scope, ipCookie);
          if($scope.rememberme == true){
            ipCookie('email', planService.email, {expires: 7, expirationUnit: 'days'});
            ipCookie('authentication_token', planService.authentication_token, {expires: 7, expirationUnit: 'days'});
            ipCookie('first_name', planService.first_name, {expires: 7, expirationUnit: 'days'});
            ipCookie('last_name', planService.last_name, {expires: 7, expirationUnit: 'days'});
            ipCookie('sharedRideId', planService.sharedRideId, {expires: 7, expirationUnit: 'days'});
          }else{
            ipCookie.remove('email');
            ipCookie.remove('authentication_token');
            ipCookie.remove('first_name');
            ipCookie.remove('last_name');
            ipCookie.remove('sharedRideId');
          }
          promise = planService.getProfile($http);
          promise.then(function(result) {
            planService.profile = result.data;
            $location.path('/plan/fromDate');
          })
        });
      }
    }
  ]);
