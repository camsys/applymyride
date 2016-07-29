'use strict';

angular.module('applyMyRideApp')
  .controller('LoginController', ['$scope', '$location', 'flash', 'planService', '$http', 'ipCookie', '$window', 'localStorageService',
    function ($scope, $location, flash, planService, $http, ipCookie, $window, localStorageService) {
      //skip initializing this controller if we're not on the page
      if( ['/','/loginError','/plan/login-guest'].indexOf( $location.path() ) == -1){ return; }
      
      //this should probably be in a service if there's anything more
      $http({
        method: 'GET',
        url: '//'+ APIHOST + '/api/v1/services/ids_humanized'
      }).then(function successCallback(response) {
        //update the counties
        $scope.counties = response.data.service_ids;
      }, function errorCallback(response) {
            console.error(response);
      });
      $scope.location = $location.path();
      $scope.rememberme = true;
      $scope.disableNext = true;
      $scope.counties = [];
      $scope.sharedRideId = ipCookie('sharedRideId');
      $scope.county = ipCookie('county');
      $scope.dateofbirth = sessionStorage.getItem('dateofbirth') || false;
      $scope.dob = {month:'', day:'', year:''};
      if($scope.dateofbirth){
        var dob = moment($scope.dateofbirth);
        $scope.dob = {month:dob.month()+1, day:dob.date(), year:dob.year()};
      }
      $scope.errors = {dob:false};

      var authentication_token = ipCookie('authentication_token');
      var email = ipCookie('email');
      $window.visited = true;

      if(authentication_token && email){
        planService.authentication_token = authentication_token;
        planService.email = email;
        $location.path('/plan/where');
      }else{
        delete localStorage.last_origin;
        delete localStorage.last_destination;
      }

      function checkNextValid(){
        var bd;
        try{
          bd = moment()
          bd.month( parseInt($scope.dob.month)-1 )
          bd.date($scope.dob.day)
          bd.year($scope.dob.year);
        }catch(e){
          $scope.dateofbirth = false;
        }
        $scope.errors.dob = (( $scope.loginform.month.$dirty && $scope.loginform.month.$invalid )
                            || ($scope.loginform.day.$dirty && $scope.loginform.day.$invalid )
                            || (($scope.loginform.year.$viewValue||'').length > 3 && $scope.loginform.year.$invalid ));
        if( !$scope.errors.dob && $scope.dob.month && $scope.dob.day && $scope.dob.year ){
          $scope.dateofbirth = bd.toDate();
        }else{
          $scope.dateofbirth = false;
        }
        $scope.disableNext = !($scope.loginform.month.$valid 
                          && $scope.loginform.day.$valid 
                          && $scope.loginform.year.$valid 
                          && $scope.dateofbirth 
                          && $scope.sharedRideId 
                          && $scope.county
                          && true);
      }

      $scope.checkId = function() {
        $scope.disableNext = true;
        var path = $location.path();
        if(path == '/' || path == '/loginError' ){
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
        $scope.authenticate();
        $scope.disableNext=true;
      }

      $scope.back = function(){
        $location.path('/');
      }

      $scope.$watch('dob.month', function(n){
          var monthInt = parseInt(n);
          if(monthInt > 1 && monthInt < 13){
              $('#LoginTemplate input.dob.day').focus();
          }
          checkNextValid();
          return;
      });
      $scope.$watch('dob.day', function(n){
          var dayInt = parseInt(n);
          if(dayInt > 3){
              $('#LoginTemplate input.dob.year').focus();
          }
          checkNextValid();
          return;
      });
      $scope.$watch('dob.year', function(n){
          checkNextValid();
          return;
      });

      $scope.authenticate = function(){
        planService.dateofbirth = $scope.dateofbirth;
        var login = {};
        login.session = {};
        login.session.ecolane_id = planService.sharedRideId.toString();
        login.session.county = planService.county;
        login.session.dob = moment($scope.dateofbirth).format('M/D/YYYY');

        ipCookie('sharedRideId', login.session.ecolane_id, {expires: 7, expirationUnit: 'days'});
        ipCookie('county', login.session.county, {expires: 7, expirationUnit: 'days'});
        sessionStorage.setItem('dateofbirth', login.session.dob);

        var promise = $http.post('//'+APIHOST+'/api/v1/sign_in', login);
        promise.error(function(result) {
          $location.path('/loginError');
        });
        promise.then(function(result) {
          planService.authentication_token = result.data.authentication_token;
          planService.email = result.data.email;
          planService.first_name = result.data.first_name;
          planService.last_name = result.data.last_name;
          planService.getPastRides($http, $scope, ipCookie);
          planService.getFutureRides($http, $scope, ipCookie);
          var lastDest, lastOrigin;
          if(result.data.last_destination && typeof '' !== typeof result.data.last_destination && result.data.last_destination.formatted_address){
            lastDest = result.data.last_destination.formatted_address;
          }else{
            lastDest = result.data.last_destination || '';
          }
          if(result.data.last_origin && typeof '' !== typeof result.data.last_origin && result.data.last_origin.formatted_address){
            lastOrigin = result.data.last_origin.formatted_address;
          }else{
            lastOrigin = result.data.last_origin || '';
          }
          localStorage.setItem('last_destination', lastDest);
          localStorage.setItem('last_origin', lastOrigin);
          if($scope.rememberme == true){
            ipCookie('email', planService.email, {expires: 7, expirationUnit: 'days'});
            ipCookie('authentication_token', planService.authentication_token, {expires: 7, expirationUnit: 'days'});
            ipCookie('first_name', planService.first_name, {expires: 7, expirationUnit: 'days'});
            ipCookie('last_name', planService.last_name, {expires: 7, expirationUnit: 'days'});
          }else{
            ipCookie.remove('email');
            ipCookie.remove('authentication_token');
            ipCookie.remove('first_name');
            ipCookie.remove('last_name');
            ipCookie.remove('sharedRideId');
            ipCookie.remove('county');
            sessionStorage.setItem('dateofbirth', null);
          }
          promise = planService.getProfile($http);
          promise.then(function(result) {
            planService.profile = result.data;
            if(planService.to && planService.from && planService.fromDate){
                $location.path('/plan/purpose');
            }else{
                $location.path('/plan/where');
            }
          })
        });
      }
    }
  ]);
