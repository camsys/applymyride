'use strict';

/**
 * @ngdoc function
 * @name applyMyRideApp.controller:AboutController
 * @description
 * # AboutController
 * Controller of the applyMyRideApp
 */
angular.module('applyMyRideApp')
  .controller('AboutController', ['$scope', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  }]);
