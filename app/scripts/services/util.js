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

  /** See [PAMF-751]
   * method returns a corrected city based on the input city and whether or not it exists in the below object
   * - Should match with the CORRECTED_CITY_HASHES constant in the Trip model of the OCC repo
   */
  this.silentlyCorrectIncorrectTownship = function(city='') {
    const BadCities = {
      'West Manchester Township': 'York',
      'West Manchester Twp': 'York',
      'Hampden Township': 'Mechanicsburg',
      'Hampden Twp': 'Mechanicsburg',
    }
    return BadCities[city] == null ? city : BadCities[city]
  }

    // see [PAMF-698]
    this.getCountiesInTransition = function (successCallback, errorCallback) {
      //simulate back-end response
      //var response = { counties: ['Columbia', 'Montour', 'Northumberland', 'Snyder', 'Union'] };
      // Return an emtpy array to disable display of the transition messages.
      var response = { };
      successCallback(response);
    };

    // see [PAMF-698]
    this.getTransitionMessages = function (successCallback, errorCallback) {
      var response = {
        countyInTransitionMessage:
          'The online functionality to book a trip on FindMyRide will be unavailable through July 2, 2021.  We apologize for the inconvenience.',
        helpMessage:
          'Please call Customer Service at 1-800-632-9063 to schedule your trip.'
      };
      successCallback(response);
    };

}]);


// Default callbacks log array on success, log error message on fail.
// successCallback = function(r) {
//   return r.data.service_ids;
// },
// errorCallback = function(e) {
//   console.log(e);
// }
