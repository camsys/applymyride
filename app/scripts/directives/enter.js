'use strict';

var app = angular.module('applyMyRideApp');


app.directive('ngEnter', function () {
  return function (scope, element, attrs) {
    element.bind("keydown keypress", function (event) {
      if(event.which === 13) {
        scope.$eval(attrs.ngEnter);
        /*scope.$apply(function (){
          scope.$eval(attrs.ngEnter);
        });*/

        event.preventDefault();
      }
    });
  };
});
