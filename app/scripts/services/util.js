'use strict';


angular.module('applyMyRideApp')
  .service('util', ['$http', function($http) {

	this.isMobile = function(){
  		return /Mobi/.test(navigator.userAgent);
		}

	this.assignDefaultValueIfEmpty = function(arg, val) {
		return typeof arg !== 'undefined' ? arg : val;
	}

  // Makes an HTTP request for county names, and calls callback functions.
  this.getCounties = function(successCallback, errorCallback) {
    $http({
      method: 'GET',
      url: '//'+ APIHOST + '/api/v1/services/ids_humanized'
    }).then(successCallback, errorCallback);
  }
}]);


// Default callbacks log array on success, log error message on fail.
// successCallback = function(r) {
//   return r.data.service_ids;
// },
// errorCallback = function(e) {
//   console.log(e);
// }
