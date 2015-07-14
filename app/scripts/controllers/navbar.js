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

    $scope.reset = function() {
      planService.reset();
      $location.path("/plan/fromDate");
    };

    $scope.showNavbar = function() {
      that.$scope.email = ipCookie('email');
      that.$scope.authentication_token = ipCookie('authentication_token');
      if(that.$scope.email){
        planService.email = $scope.email;
        planService.authentication_token = $scope.authentication_token;
      }else{
        that.$scope.email = planService.authentication_token;
        that.$scope.authentication_token = planService.email;
      }
      $scope.rideCount = ipCookie('rideCount');
      return true;
    };

    $scope.logout = function() {
      delete ipCookie.remove('email');
      delete ipCookie.remove('authentication_token');
      $location.path('/');
    };

  }]);

angular.module('applyMyRideApp').factory('flash', function($rootScope) {
  var currentMessage = '';

  $rootScope.$on('$routeChangeSuccess', function() {
    currentMessage = null;
  });

  return {
    setMessage: function(message) {
      //queue.push(message);
      currentMessage = message;
    },
    getMessage: function() {
      return currentMessage;
      currentMessage = null;
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
