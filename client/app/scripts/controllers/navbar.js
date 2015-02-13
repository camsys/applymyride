'use strict';

angular.module('clientApp')
  .controller('NavbarCtrl', ['$scope', '$location', function ($scope, $location) {

    $scope.showNavbar = function() {
      return !($location.path()==='/');
    }

  }]);
