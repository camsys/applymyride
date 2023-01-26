'use strict';

var app = angular.module('applyMyRideApp');

app.controller('AboutController', ['$scope', '$http','$routeParams', '$location', 'planService', 'util', 'flash', 'usSpinnerService', '$q', 'LocationSearch', 'localStorageService', 'ipCookie', '$timeout', '$window', '$filter',

function($scope, $http, $routeParams, $location, planService, util, flash, usSpinnerService, $q, LocationSearch, localStorageService, ipCookie, $timeout, $window, $filter) {

  $scope.step = $routeParams.step;
  $scope.planService = planService;

  $scope.location = $location.path();
  $scope.errors = {};
  if ($scope.location === '/about') {
    $scope.counties = localStorageService.get('counties') || [];
    $scope.counties_string = $scope.counties.join(', ');
    $scope.county_count = $scope.counties.length + ' counties';

    util.getCounties(
      function (countyServices) {
        let counties = Array.from(new Set(countyServices.map(option => option.countyName)));
        localStorageService.set('counties', counties);

        $scope.counties = counties;
        $scope.counties_string = $scope.counties.join(', ');
        if (counties.length === 0) {
            $scope.county_count = '0 counties'
        } else if (counties.length === 1) {
            $scope.county_count = '1 county'
        } else {
            $scope.county_count = counties.length + ' counties'
        }
      }
    );
  }

}
]);
