'use strict';

angular.module('applyMyRideApp')
    .service('planService', function() {

      this.prepareConfirmationPage = function($scope) {
        var itineraryRequestObject = this.createItineraryRequest();
        this.itineraryRequestObject = itineraryRequestObject;
        var request = {};

        var fromLocationDescription = this.getAddressDescriptionFromLocation(itineraryRequestObject.itinerary_request[0].start_location);
        request.fromLine1 = fromLocationDescription.line1;
        request.fromLine2 = fromLocationDescription.line2;

        var toLocationDescription = this.getAddressDescriptionFromLocation(itineraryRequestObject.itinerary_request[0].end_location);
        request.toLine1 = toLocationDescription.line1;
        request.toLine2 = toLocationDescription.line2;

        var outboundTime = itineraryRequestObject.itinerary_request[0].trip_time;
        var now = moment().startOf('day');
        var dayDiff = moment(outboundTime).startOf('day').diff(moment().startOf('day'), 'days');
        if(dayDiff == 0) {
          request.when1 = "Today";
        } else if (dayDiff == 1) {
          request.when1 = "Tomorrow";
        }else{
          request.when1 = moment(outboundTime).format('MMM DD, YYYY');
        }
        request.when2 = "Leaving: " + moment(outboundTime).format('h:mm a') + " " + (itineraryRequestObject.itinerary_request[0].departure_type == 'depart' ? "departure" : "arrival");

        if(itineraryRequestObject.itinerary_request.length > 1){
          request.roundtrip = true;
          //round trip
          var returnTime = itineraryRequestObject.itinerary_request[1].trip_time;
          if(moment(returnTime).startOf('day').diff(moment(outboundTime).startOf('day'), 'days')== 0){
            request.sameday = true;
            request.when3 = "Returning: " + moment(returnTime).format('h:mm a') + " " + (itineraryRequestObject.itinerary_request[1].departure_type == 'depart' ? "departure" : "arrival");
          }else{
            var dayDiff = moment(returnTime).startOf('day').diff(moment().startOf('day'), 'days');
            if(dayDiff == 0) {
              request.when3 = "Today";
            } else if (dayDiff == 1) {
              request.when3 = "Tomorrow";
            }else{
              request.when3 = moment(returnTime).format('MMM DD, YYYY');
            }
            request.when4 = "Returning: " + moment(returnTime).format('h:mm a') + " " + (itineraryRequestObject.itinerary_request[1].departure_type == 'depart' ? "departure" : "arrival");
          }
        }
        request.purpose = this.purpose;
        $scope.request = request;

      }

      this.getAddressDescriptionFromLocation = function(location){
        var description = {};
        if(location.name){
          description.line1 = location.name;
          description.line2 = location.formatted_address;
          if(description.line2.indexOf(description.line1) > -1){
            description.line2 = description.line2.substr(description.line1.length + 2);
          }
        }else{
          angular.forEach(location.address_components, function(address_component, index) {
            if(address_component.types.indexOf("street_address") > -1){
              description.line1 = address_component.long_name;
            }
          }, description.line1);
          description.line2 = location.formatted_address;
          if(description.line2.indexOf(description.line1) > -1){
            description.line2 = description.line2.substr(description.line1.length + 2);
          }
        }
        return description;
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

      this.postItineraryRequest = function($http) {
        var promise2 = $http.post('api/v1/itineraries/plan', this.itineraryRequestObject);
        var promise3 = promise2.then(function(result) {
          return result.data;
        });
        return promise3;
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
        }else{
          fromTime = moment(this.fromTime).toDate();
        }
        var fromDate = moment(this.fromDate).toDate();
        fromTime.setYear(fromDate.getFullYear());
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
          }else{
            returnTime = moment(this.returnTime).toDate()
          }
          var returnDate = moment(this.returnDate).toDate();
          returnTime.setYear(returnDate.getFullYear());
          returnTime.setMonth(returnDate.getMonth());
          returnTime.setDate(returnDate.getDate());
          var returnTimeString = moment.utc(returnTime).format();
          returnTrip.trip_time = returnTimeString;
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
          offset: 0,
          componentRestrictions: {country: 'us'}
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
