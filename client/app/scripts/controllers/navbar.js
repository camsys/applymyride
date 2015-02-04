'use strict';

angular.module('clientApp')
  .controller('NavbarCtrl', function ($scope, $location) {
    $scope.hideNavbar = ($location.path() === '/');

  });
