'use strict';

var app = angular.module('applyMyRideApp');

app.controller('AboutController', ['$scope', '$http','$routeParams', '$location', 'planService', 'util', 'flash', 'usSpinnerService', '$q', 'LocationSearch', 'localStorageService', 'ipCookie', '$timeout', '$window', '$filter',

function($scope, $http, $routeParams, $location, planService, util, flash, usSpinnerService, $q, LocationSearch, localStorageService, ipCookie, $timeout, $window, $filter) {

  $scope.step = $routeParams.step;
  $scope.planService = planService;

  $scope.location = $location.path();
  $scope.errors = {};
  if ($scope.location === '/about') {
    util.getCounties(
      function(response) {
        var counties = response.data.service_ids;
        $scope.counties = counties;
        localStorageService.set('counties', counties);
      }
    );
    $scope.counties = localStorageService.get('counties') || [];
    $scope.county_count = ''
    if ($scope.counties.length === 0) {
        $scope.county_count = '0 counties'
    } else if ($scope.counties.length === 1) {
        $scope.county_count = '1 counties'
    } else {
        $scope.county_count = $scope.counties.length + ' counties'
    }
    $scope.counties_string = $scope.counties.length > 0 ?
        $scope.counties.reduce(function(acc, val, ind) {
            if (ind === $scope.counties.length - 1) {
                return acc + val
            } else {
              return acc + val + ', '
            }
        },'') : ''
  }

}
]);
