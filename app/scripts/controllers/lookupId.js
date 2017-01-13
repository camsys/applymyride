'use strict';

angular.module('applyMyRideApp')
  .controller('LookupIdController', ['$scope', '$location', '$http', 'localStorageService', 'ipCookie', 'util',
    function ($scope, $location, $http, localStorageService, ipCookie, util) {
      //skip initializing this controller if we're not on the page
      if( ['/lookupIdForm', '/lookupError'].indexOf( $location.path() ) == -1){ return; }

      $scope.location = $location.path();
      $scope.counties = localStorageService.get("counties") || util.getCounties((r) => $scope.counties = r.data.service_ids);
      $scope.county = localStorageService.get("county") || ipCookie('county');
      $scope.lastName = localStorageService.get("lastName") || null;

      // Look Up User Ecolane ID
      $scope.lookupId = function() {
        localStorageService.set("county", $scope.county);
        localStorageService.set("lastName", $scope.lastName);

        var promise = $http.get('//'+APIHOST+'/api/v1/users/lookup?booking_agency=ecolane&last_name=' + $scope.lastName + '&ssn_last_4=' + $scope.ssnLast4 + '&county=' + $scope.county);
        promise.error(function(result) {
          console.log("ERROR: ", result);
          $location.path('/lookupError');
        });
        promise.then(function(result) {
          localStorageService.set("customer_number", result.data.customer_number);  // ...populate Shared Ride ID field with ID
          $location.path('/'); // On success, toggle back to login form, and...
        });
      };

    }
  ]);
