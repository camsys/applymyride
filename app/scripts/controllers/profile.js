'use strict';

angular.module('applyMyRideApp')
  .controller('ProfileController', ['$rootScope', '$scope', '$location', 'flash', 'planService', '$http', 'ipCookie', '$window',
    function ($rootScope, $scope, $location, flash, planService, $http, ipCookie, $window) {
      $scope.location = $location.path();
      $scope.profileForm = false;
      $scope.bookingProfiles = [
        {key: 'york-123', sharedRideID: 'ride id.1', agency: 'agency...', county: 'county'},
        {key: 'york-124', sharedRideID: 'ride id.2', agency: 'agency...', county: 'county'},
        {key: 'york-125', sharedRideID: 'ride id.3', agency: 'agency...', county: 'county'},
        {key: 'york-126', sharedRideID: 'ride id.4', agency: 'agency...', county: 'county'}
      ];

      var profilePromise = planService.getProfile($http);
      profilePromise.then(function (results) {
        console.log(results);
      });

      $scope.toggleProfileForm = function () {
        $scope.profileForm = !$scope.profileForm;
      };

      $scope.submitNewProfile = function () {
        console.log('click a');
      };

      $scope.removeProfile = function () {
        console.log('click b');
      };

      $scope.back = function () {
        $location.path(HOMEPAGE);
      };
    }

  ]);
