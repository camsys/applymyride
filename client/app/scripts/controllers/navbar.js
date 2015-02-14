'use strict';

angular.module('applyMyRideApp')
  .controller('NavbarController', ['$scope', '$location', 'flash',
    function ($scope, $location, flash) {

    $scope.flash = flash;

    $scope.showNavbar = function() {
      return !($location.path()==='/');
    }

  }]);

angular.module('applyMyRideApp').factory("flash", function($rootScope) {
  // See http://fdietz.github.io/recipes-with-angular-js/common-user-interface-patterns/displaying-a-flash-notice-failure-message.html
  var queue = [];
  var currentMessage = "";

  $rootScope.$on("$routeChangeSuccess", function() {
    currentMessage = queue.shift() || "";
  });

  return {
    setMessage: function(message) {
      queue.push(message);
    },
    getMessage: function() {
      return currentMessage;
    }
  };
});