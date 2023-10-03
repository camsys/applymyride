'use strict';

angular.module('applyMyRideApp')
  .controller('LoginController', ['$scope', '$rootScope', '$location', 'flash', 'planService', '$http', 'ipCookie', '$window', 'localStorageService', 'util', 'Idle',
    function ($scope, $rootScope, $location, flash, planService, $http, ipCookie, $window, localStorageService, util, Idle) {
      //skip initializing this controller if we're not on the page
      if( ['/','/loginError'].indexOf( $location.path() ) == -1){ return; }

      util.getCounties(
        function(response) {
          var counties = response.data.service_ids;
          $scope.counties = counties;
          localStorageService.set("counties", counties);
        }
      );

      util.getCountiesInTransition(
        function (response) {
          $scope.transitionCounties = response.counties;
        }
      );

      util.getTransitionMessages(
        function (response) {
          $scope.countyInTransitionMessage = response.countyInTransitionMessage;
          $scope.transitionHelpMessage = response.helpMessage;
        }
      );

      $scope.location = $location.path();
      $scope.rememberme = true;
      $scope.disableNext = true;
      $scope.counties = localStorageService.get("counties") || [];
      $scope.sharedRideId = localStorageService.get("customer_number") || ipCookie('sharedRideId');
      $scope.agencyCode = localStorageService.get("agencyCode") || ipCookie('agencyCode');
      $scope.county = localStorageService.get("county") || ipCookie('county');
      $scope.dateofbirth = sessionStorage.getItem('dateofbirth') || false;
      $scope.dob = localStorageService.get("dob") || {month:'', day:'', year:''};
      if($scope.dateofbirth){
        var dob = moment($scope.dateofbirth);
        $scope.dob = $scope.dob || {month:dob.month()+1, day:dob.date(), year:dob.year()};
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

      $scope.isTransitionCounty = function (county) {
        return $scope.transitionCounties &&
          $scope.transitionCounties.includes($scope.county);
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
        planService.getAgencyCode = $scope.agencyCode;
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
      $scope.$watch('sharedRideId', function(n) {
        $('#LoginTemplate input.shared-ride-id').focus();
        return;
      });

      $rootScope.$on('IdleTimeout', function() {
        // The user has timed out (meaning idleDuration + timeout has passed without any activity)
        // Log the user out.
        $rootScope.$emit("CallLogout", {});
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
          planService.getAgencyCode = result.data.agency_code;
          planService.getPastRides($http).then(function(data) {
            planService.populateScopeWithTripsData($scope, planService.unpackTrips(data.data.trips, 'past'), 'past');
          });
          planService.getFutureRides($http).then(function(data) {
            var liveTrip = planService.processFutureAndLiveTrips(data, $scope, ipCookie);

            if(liveTrip) {
              $location.path('/itinerary'); // If it exists, go to itinerary page
            }

          });
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
          planService.getProfile($http).then(function(result) {
            planService.profile = result.data;
            if($location.path() === "/itinerary") { return; } // Don't redirect if already redirecting to Itinerary.
            if(planService.to && planService.from && planService.fromDate){
                $location.path('/plan/purpose');
            }else{
                $location.path('/plan/where');
            }
          });
          Idle.watch();
        });
      }
    }
  ])
  .config(function(IdleProvider, KeepaliveProvider) {
    // configure Idle settings
    IdleProvider.idle(1); // in seconds
    IdleProvider.timeout(60 * 60); // in seconds
  })
  .run(function(Idle){
    // start watching when the app runs. also starts the Keepalive service by default.
    Idle.watch();
  });
