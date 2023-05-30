'use strict';

// TODO (Drew) Make sure this still work

angular.module('applyMyRideApp')
  .controller('LookupIdController', ['$scope', '$location', '$http', 'localStorageService', 'ipCookie', 'util',
    function ($scope, $location, $http, localStorageService, ipCookie, util) {
      //skip initializing this controller if we're not on the page
      if ( ['/lookupIdForm', '/lookupError'].indexOf($location.path()) === -1) { return; }

      // TODO (Drew) broken
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

      $scope.isTransitionCounty = function (county) {
        return $scope.transitionCounties &&
          $scope.transitionCounties.includes($scope.county);
      };

      $scope.location = $location.path();
      $scope.serviceOptions = localStorageService.get('serviceOptions') || util.getCounties(function (countyServices) {
        let options = countyServices.sort(function (a,b) { 
          return a.label > b.label ? 1 : -1;
        });

        $scope.serviceOptions = options;
      });

      $scope.county = localStorageService.get('county') || ipCookie('county');
      $scope.lastName = localStorageService.get('lastName') || null;
      $scope.errors = {dob:false};
      $scope.dob = localStorageService.get('dob') || {month:'', day:'', year:''};

      // Look Up User Ecolane ID
      $scope.lookupId = function () {
        localStorageService.set('county', $scope.county);
        localStorageService.set('lastName', $scope.lastName);
        localStorageService.set('dob', $scope.dob);

        let requestUrl = apiUrl('/api/v1/users/lookup');
        requestUrl.search = new URLSearchParams({
          booking_agency: 'ecolane',
          last_name: $scope.lastName,
          date_of_birth: $scope.dob.year + '-' + $scope.dob.month + '-' + $scope.dob.day,
          county: $scope.county
        });
        let promise = $http.get(requestUrl.toString());

        promise.error(function (result) {
          $location.path('/lookupError');
        });

        promise.then(function (result) {
          localStorageService.set('customer_number', result.data.customer_number);  // ...populate Shared Ride ID field with ID
          $location.path('/'); // On success, toggle back to login form, and...
        });
      };

      // date of birth picker validity checker
      function checkNextValid () {
        // console.log('Month changed', $scope, $scope.lookupidform);
        var bd;
        try {
          bd = moment();
          bd.month( parseInt($scope.dob.month)-1 );
          bd.date($scope.dob.day);
          bd.year($scope.dob.year);
        } catch(e) {
          $scope.dateofbirth = false;
        }
        $scope.errors.dob = (( $scope.lookupidform.month.$dirty && $scope.lookupidform.month.$invalid ) ||
                              ($scope.lookupidform.day.$dirty && $scope.lookupidform.day.$invalid ) ||
                              (($scope.lookupidform.year.$viewValue||'').length > 3 && $scope.lookupidform.year.$invalid ));
        if ( !$scope.errors.dob && $scope.dob.month && $scope.dob.day && $scope.dob.year ) {
          $scope.dateofbirth = bd.toDate();
        } else {
          $scope.dateofbirth = false;
        }
        $scope.disableNext = !($scope.lookupidform.month.$valid &&
                                $scope.lookupidform.day.$valid &&
                                $scope.lookupidform.year.$valid &&
                                $scope.dateofbirth &&
                                $scope.sharedRideId &&
                                $scope.county &&
                                true);
      }

      // date of birth watchers
      $scope.$watch('dob.month', function (n, o) {
          if (n === o) { return; }
          var monthInt = parseInt(n);
          if (monthInt > 1 && monthInt < 13) {
              $('#LookupIdTemplate input.dob.day').focus();
          }
          checkNextValid();
          return;
      });

      $scope.$watch('dob.day', function (n, o) {
          if (n === o) { return; }
          var dayInt = parseInt(n);
          if (dayInt > 3) {
              $('#LookupIdTemplate input.dob.year').focus();
          }
          checkNextValid();
          return;
      });

      $scope.$watch('dob.year', function (n, o) {
          if (n === o) { return; }
          checkNextValid();
          return;
      });
    }
  ]);
