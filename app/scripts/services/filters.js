'use strict';


angular.module('applyMyRideApp')
.filter('free', function() {
  return function(input) {
    return input == '$0.00' ? "Free" : input;
  };
})
.filter('momentYMD', function() {
  return function(m) {
    if(!m || !m._isAMomentObject){ return ''; }
    return m.format('YY-MM-DD');
  };
})
.filter('momentHMA', function() {
  return function(m) {
    if(!m || !m._isAMomentObject){ return ''; }
    return m.format('h:mm a');
  };
});