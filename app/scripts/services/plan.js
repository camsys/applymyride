'use strict';

angular.module('applyMyRideApp')
    .service('planService', function() {
    var that = this;
      this.submitPlanRequest = function() {
        return that.from;
      };
    }
);

angular.module('applyMyRideApp')
  .service('LocationSearch', function($http, $q, $timeout){

    var autocompleteService = new google.maps.places.AutocompleteService();

    var LocationSearch = new Object();

    LocationSearch.getLocations = function(text) {

      var compositePromise = $q.defer();

      $q.all([LocationSearch.getGooglePlaces(text), LocationSearch.getSavedPlaces(text), LocationSearch.getRecentSearches(text)]).then(function(results){
        compositePromise.resolve(results);
      });

      return compositePromise.promise;

    }

    LocationSearch.getGooglePlaces = function(text) {
      var googlePlaceData = $q.defer();
      this.placeIds = [];
      this.results = [];
      var that = this;

      autocompleteService.getPlacePredictions(
        {
          input: text,
          offset: 0
        }, function(list, status) {
          angular.forEach(list, function(value, index) {
            var terms = []
            angular.forEach(value.terms, function(term, index) {
              terms.push(term.value)
            }, terms);
            that.results.push(terms.join(" "));
            that.placeIds.push(value.place_id);
          });
          googlePlaceData.resolve({googleplaces:that.results, placeIds: that.placeIds});
        });
      return googlePlaceData.promise
    }

    LocationSearch.getRecentSearches = function(text) {
      var savedPlaceData = $q.defer();
      savedPlaceData.resolve(['My fake recent search', 'not selectable yet']);
      return savedPlaceData.promise;
    }

    LocationSearch.getSavedPlaces = function(text) {
      var savedPlaceData = $q.defer();
      savedPlaceData.resolve(['My fake saved place', 'not selectable yet']);
      return savedPlaceData.promise;
    }

    return LocationSearch;
  });
