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

  this.dateISOSortComparer = function(isoA,isoB, earlierFirst)
  {
    var da = new Date(isoA);
    var db = new Date(isoB);
    if (isNaN(da) || isNaN(db))
      return 0;
    var ta = da.getTime();
    var tb = db.getTime();
    var comp = tb - ta;
    if (earlierFirst) comp *= -1;
    return comp;
  };

}]);


// Default callbacks log array on success, log error message on fail.
// successCallback = function(r) {
//   return r.data.service_ids;
// },
// errorCallback = function(e) {
//   console.log(e);
// }
