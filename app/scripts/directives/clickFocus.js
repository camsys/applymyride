'use strict';

var app = angular.module('applyMyRideApp');

app.directive('clickFocus', function($window) {
  return {
    restrict: 'AC',
    link: function(_scope, _element) {
      _element.on("click", function(){
        if (!$window.getSelection().toString()) {
          this.setSelectionRange(0, this.value.length)
        }
      });
    }
  };
});
