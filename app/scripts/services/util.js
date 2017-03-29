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
    // Default callbacks log array on success, log error message on fail.
    this.getCounties = function(successCallback, errorCallback) {
      successCallback = successCallback || function(r){ console.log(r.data.service_ids); };
      errorCallback = errorCallback || console.log;
      $http({
        method: 'GET',
        url: '//'+ APIHOST + '/api/v1/services/ids_humanized'
      }).then(successCallback, errorCallback);
    }

}]);
