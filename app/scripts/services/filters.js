'use strict';


angular.module('applyMyRideApp')
.filter('free', function() {
  return function(input) {
    return input == '$0.00' ? "Free" : input;
  };
})
.filter('minutes', function() {
  return function(m) {
    if(m <= 60){
      return '' + m + ' minutes';
    }else{
      return '' 
        + (Math.floor( m/60 )) + ' hours, '
        + (m % 60) + ' minutes';
    }
    if(!m || !m._isAMomentObject){ return ''; }
    return m.format('YY-MM-DD');
  };
}).filter('momentYMD', function() {
  return function(m) {
    if(!m || !m._isAMomentObject){ return ''; }
    return m.format('YY-MM-DD');
  };
})
.filter('noCountry', function() {
  return function(addressString) {
    //filters ", USA" or ", United States" from the end$ of strings. comma optional
    var country = /(, )?(United States|USA)$/;
    return (addressString || '').replace(country, '').trim();
  };
})
.filter('momentHMA', function() {
  return function(m) {
    if(!m || !m._isAMomentObject){ return ''; }
    return m.format('h:mm a');
  };
});