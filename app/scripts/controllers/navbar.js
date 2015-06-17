'use strict';

var app = angular.module('applyMyRideApp');

angular.module('applyMyRideApp')
  .controller('NavbarController', ['$scope', '$location', 'flash', 'planService', 'deviceDetector', 'ipCookie',
    function ($scope, $location, flash, planService, deviceDetector, ipCookie) {

    var input = document.createElement('input');
    input.setAttribute('type','date');
    var notADateValue = 'not-a-date';
    input.setAttribute('value', notADateValue);
    $scope.html5 = !(input.value === notADateValue);
    planService.html5 = $scope.html5;
    $scope.mobile = deviceDetector.isMobile();
    planService.mobile = $scope.mobile;

    $scope.flash = flash;

    var that = this;
    that.$scope = $scope;
    $scope.showNavbar = function() {
      that.$scope.email = ipCookie('email');
      return true;
    };

    $scope.logout = function() {
      delete ipCookie.remove('email');
      delete ipCookie.remove('authentication_token');
      $location.path('/');
    };

  }]);

angular.module('applyMyRideApp').factory('flash', function($rootScope) {
  // See http://fdietz.github.io/recipes-with-angular-js/common-user-interface-patterns/displaying-a-flash-notice-failure-message.html
  var queue = [];
  var currentMessage = '';

  $rootScope.$on('$routeChangeSuccess', function() {
    currentMessage = queue.shift() || '';
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

app.directive('back', ['$window', function($window) {
  return {
      restrict: 'A',
      link: function (scope, elem) {
          elem.bind('click', function () {
              $window.history.back();
          });
      }
  };
}

]);
