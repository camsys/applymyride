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
})
.filter('seconds', function() {
  return function(s) {
    var m = Math.ceil( s/60 );
    if(m <= 60){
      return '' + m + ' min';
    }else{
      return '' 
        + (Math.floor( m/60 )) + ' hr, '
        + (m % 60) + ' min';
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
.filter('telephoneLink', function(){
  return function(tel){
    //strip all non-numeric chars
    if(!tel){return '';}
    tel = tel.toString().trim().replace(/\D/g, '');
    //prepend 1 if not there
    if(tel.charAt(0) !== 1){
      tel = '1'+tel;
    }
    return 'tel:+' + tel;
  }
})
.filter('roundUp', function() {
  return function(up){
    //parse as float then round up
    return ''+ Math.ceil( parseFloat( up || 1) )
  }
})
.filter('momentFormat', function() {
  return function(m, f) {
    if(!m || !m._isAMomentObject){ return ''; }
    return m.format( f );
  };
})
.filter('encodeURI', function() {
    return window.encodeURIComponent;
})
.filter('momentHMA', function() {
  return function(m) {
    if(!m || !m._isAMomentObject){ return ''; }
    return m.format('h:mm a');
  };
});