'use strict';

angular.module('applyMyRideApp')
    .service('planService', function() {

      this.getItineraries =  function($scope, $http) {
        $http.get('data/itineraries.json').
          success(function(data) {
            $scope.itineraries = data.itineraries;
          });
      }


      this.getTripPurposes = function($scope, $http) {
        /*$http.get('/api/v1/trip_purposes/list').
          success(function(data) {
            $scope.purposes = data.trip_purposes;
          });*/
        $http.get('data/purposes.json').
          success(function(data) {
            $scope.purposes = data.trip_purposes;
          });
      }

      this.createItineraryRequest = function() {
        var request = {};
        request.trip_purpose = this.purpose;
        request.itinerary_request = [];
        var outboundTrip = {};
        outboundTrip.segment_index = 0;
        outboundTrip.start_location = this.fromDetails;
        outboundTrip.end_location = this.toDetails;
        this.addStreetAddressToLocation(outboundTrip.start_location);
        this.addStreetAddressToLocation(outboundTrip.end_location);
        this.fixLatLon(outboundTrip.start_location);
        this.fixLatLon(outboundTrip.end_location);
        var fromTime = this.fromTime;
        if(fromTime == null){
          fromTime = new Date();
        }
        var fromDate = this.fromDate;
        fromTime.setYear(fromDate.getYear());
        fromTime.setMonth(fromDate.getMonth());
        fromTime.setDate(fromDate.getDate());
        var fromTimeString = moment.utc(fromTime).format();
        outboundTrip.trip_time = fromTimeString;
        if(this.fromTimeType == 'asap'){
          outboundTrip.departure_type = 'depart';
        }else{
          outboundTrip.departure_type = this.fromTimeType;
        }

        request.itinerary_request.push(outboundTrip);
        if(this.returnDate){
          var returnTrip = {};
          returnTrip.segment_index = 1;
          returnTrip.start_location = this.toDetails;
          returnTrip.end_location = this.fromDetails;
          returnTrip.departure_type = this.returnTimeType;
          var returnTime = this.returnTime;
          if(returnTime == null){
            returnTime = new Date();
          }
          var returnDate = this.returnDate;
          returnTime.setYear(returnDate.getYear());
          returnTime.setMonth(returnDate.getMonth());
          returnTime.setDate(returnDate.getDate());
          request.itinerary_request.push(returnTrip);
        }
        console.log(JSON.stringify(request));
        return request;
      };

      this.addStreetAddressToLocation = function(location) {
        var street_address;
        angular.forEach(location.address_components, function(address_component, index) {
          if(address_component.types.indexOf("street_number") > -1){
            street_address = address_component.long_name + " ";
          }
        }, street_address);

        angular.forEach(location.address_components, function(address_component, index) {
          if(address_component.types.indexOf("route") > -1){
            street_address += address_component.long_name;
          }
        }, street_address);

        location.address_components.push(
          {
            "long_name": street_address,
            "short_name": street_address,
            "types": [
              "street_address"
            ]
          }
        )
      }

      this.fixLatLon = function(location) {
        location.geometry.location.lat = location.geometry.location.k;
        location.geometry.location.lng = location.geometry.location.D;
      }
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
