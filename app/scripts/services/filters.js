'use strict';


angular.module('applyMyRideApp').filter('free', function() {
  return function(input) {
    return input == '$0.00' ? "Free" : input;
  };
});
