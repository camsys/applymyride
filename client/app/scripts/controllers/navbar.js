'use strict';

angular.module('clientApp')
  .controller('NavbarCtrl', function ($scope, $location) {

    $scope.showNavbar = function() {
      return !($location.path()==='/');
    }

  });
