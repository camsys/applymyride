'use strict';

angular.module('applyMyRideApp')
  .controller('NavbarController', ['$scope', '$location', function ($scope, $location) {

    $scope.showNavbar = function() {
      return !($location.path()==='/');
    }

  }]);
