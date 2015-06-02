'use strict';

var app = angular.module('applyMyRideApp');

app.directive('focus', function($timeout) {
  return {
    restrict: 'AC',
    link: function(_scope, _element) {
      $timeout(function(){
        _element[0].focus();
      }, 0);
    }
  };
});
