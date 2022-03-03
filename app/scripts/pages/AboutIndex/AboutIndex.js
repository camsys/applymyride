'use strict';

var app = angular.module('applyMyRideApp');
/**
 * 
 * @param {*} $scope 
 * @param {*} $element 
 * @param {*} $attrs 
 * 
 * TODO: copy paste the original about controller code in
 * TODO: scope utils into the controller
 * TODO: add ctrl.onInit() handler to fetch counties
 */
app.component('about-index',{
  templateUrl: 'about-index.html',
  bindings: {
    counties: '='
  },
  controller: ['$http','$routeParams', '$location', 'planService', 'util', 'flash', 'usSpinnerService', '$q', 'LocationSearch', 'localStorageService', 'ipCookie', '$timeout', '$window', '$filter',
      function($scope, $element, $attrs, util) {
        this.$onInit = function() {
          console.log("I'm screaming inside")
          console.log(this)
        }
        util.getCounties().then(function(res) {
          console.log(res)
        })
        const Ctrl = this;
        console.log(Ctrl.counties)
    }]
})