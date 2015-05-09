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
        request.when1 = this.getDateDescription(outboundTime);
        request.when2 = moment(outboundTime).format('h:mm a') + " " + (itineraryRequestObject.itinerary_request[0].departure_type == 'depart' ? "departure" : "arrival");

        if(itineraryRequestObject.itinerary_request.length > 1){
          request.roundtrip = true;
          //round trip
          var returnTime = itineraryRequestObject.itinerary_request[1].trip_time;
          request.when3 = this.getDateDescription(returnTime);
          if(request.when1 == request.when3){
            request.sameday = true;
          }
          request.when4 = moment(returnTime).format('h:mm a') + " " + (itineraryRequestObject.itinerary_request[1].departure_type == 'depart' ? "departure" : "arrival");
        }
        request.purpose = this.purpose;
        $scope.request = request;
      }

      this.prepareTripSearchResultsPage = function($scope){
        var itineraries = this.searchResults.itineraries;
        var itinerariesByMode = {};
        var fare_info = {};

        angular.forEach(itineraries, function(itinerary, index) {
          var mode = itinerary.returned_mode_code;
          if (itinerariesByMode[mode] == undefined){
            itinerariesByMode[mode] = [];
          }
          itinerariesByMode[mode].push(itinerary);
        }, itinerariesByMode);

        angular.forEach(Object.keys(itinerariesByMode), function(mode_code, index) {
          var fares = [];
          angular.forEach(itinerariesByMode[mode_code], function(itinerary, index) {
            fares.push(itinerary.cost);
          }, $scope);

          var lowestFare = Math.min.apply(null, fares);
          var highestFare = Math.max.apply(null, fares);
          if(lowestFare == highestFare){
            fare_info[[mode_code]] = "$" + lowestFare;
          }else{
            fare_info[[mode_code]] = "$" + lowestFare + "-$" + highestFare;
          }
          $scope[mode_code] = itinerariesByMode[mode_code];
        }, $scope);
        $scope.fare_info = fare_info;
      }

      this.prepareTransitOptionsPage = function($scope){

        var itineraries = this.searchResults.itineraries;
        var transitItineraries = [];

        angular.forEach(itineraries, function(itinerary, index) {
          var mode = itinerary.returned_mode_code;
          if (mode == 'mode_transit'){
            transitItineraries.push(itinerary);
          }
        }, transitItineraries);

        var transitInfos = []
        var that = this;
        angular.forEach(transitItineraries, function(itinerary, index) {
          var transitInfo = {};
          transitInfo.cost = itinerary.cost;
          transitInfo.startTime = itinerary.start_time;
          transitInfo.startDesc = that.getDateDescription(itinerary.start_time);
          transitInfo.startDesc += " at " + moment(itinerary.start_time).format('h:mm a')
          transitInfo.endDesc = that.getDateDescription(itinerary.end_time);
          transitInfo.endDesc += " at " + moment(itinerary.end_time).format('h:mm a');
          transitInfo.travelTime = humanizeDuration(itinerary.duration * 1000,  { units: ["hours", "minutes"], round: true });
          var found = false;
          angular.forEach(itinerary.json_legs, function(leg, index) {
            if(!found && leg.mode == 'BUS'){
              transitInfo.route = leg.routeShortName;
              found = true;
            }
          });
          transitInfo.walkTime = itinerary.walk_time;
          transitInfos.push(transitInfo);
        }, transitInfos);

        angular.forEach(transitInfos, function(transitInfo, index) {
          if(index == 0){
            transitInfo.label = "Recommended"
            return;
          }

          var best = transitInfos[0];
          if(transitInfo.cost < best.cost){
            transitInfo.label = "Cheaper"
          } else if (transitInfo.travelTime < best.travelTime){
            transitInfo.label = "Faster"
          } else if (transitInfo.walkTime < best.walkTime){
            transitInfo.label = "Less Walking"
          } else if (transitInfo.travelTime < best.travelTime){
            transitInfo.label = "Faster"
          }else if(transitInfo.cost > best.cost){
            transitInfo.label = "More Expensive"
          } else if (transitInfo.startTime < best.startTime){
            transitInfo.label = "Earlier"
          } else if (transitInfo.startTime > best.startTime){
            transitInfo.label = "Later"
          }else{
            transitInfo.label = "Similar"
          }
        });
        $scope.transitInfos = transitInfos;
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

    this.getDateDescription = function(date){
      var description;
      var now = moment().startOf('day');
      var dayDiff = moment(date).startOf('day').diff(moment().startOf('day'), 'days');
      if(dayDiff == 0) {
        description = "Today";
      } else if (dayDiff == 1) {
        description = "Tomorrow";
      }else{
        description = moment(date).format('dddd MMM DD');
      }
      return description;
    }

      this.getTripPurposes = function($scope, $http) {
        $http.get('api/v1/trip_purposes/list').
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
        //1click wants the json formatted differently than google places serves the data.  Replace lat() and lng() functions with numbers
        if(typeof location.geometry.location.lat != 'number'){
          location.geometry.location.lat = location.geometry.location.lat();
          location.geometry.location.lng = location.geometry.location.lng();
        }
      }
    }
);

angular.module('applyMyRideApp')
  .service('LocationSearch', function($http, $q, localStorageService){

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
          componentRestrictions: {country: 'us'},
          location: new google.maps.LatLng(39.9625, -76.7280556),  //york, PA
          radius: 50000
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

      var recentSearchData = $q.defer();
      var recentSearches = localStorageService.get('recentSearches');
      if(!recentSearches){
        recentSearchData.resolve({recentsearches: [], placeIds: []});
      }else{
        this.recentSearchResults = [];
        this.recentSearchPlaceIds = [];
        var that = this;
        angular.forEach(Object.keys(recentSearches), function(key, index) {
          if(index < 10 && key.toLowerCase().indexOf(text.toLowerCase()) > -1){
            var location = recentSearches[key];
            that.recentSearchResults.push(key);
            that.recentSearchPlaceIds.push(location.place_id)
          }
        });
        recentSearchData.resolve({recentsearches: that.recentSearchResults, placeIds: that.recentSearchPlaceIds});
      }
      return recentSearchData.promise;
    }

    LocationSearch.getSavedPlaces = function(text) {
      var savedPlaceData = $q.defer();
      this.savedPlaceIds = [];
      this.savedPlaceAddresses = [];
      this.savedPlaceResults = [];
      var that = this;
      $http.get('api/v1/places/search?traveler_id=3&include_user_pois=true&search_string=%25' + text + '%25').
        success(function(data) {
          var locations = data.places_search_results.locations;
          angular.forEach(locations, function(value, index) {
            that.savedPlaceResults.push(value.name + " " + value.formatted_address);
            that.savedPlaceAddresses.push(value.formatted_address);
            that.savedPlaceIds.push(value.place_id);
          });
          savedPlaceData.resolve({savedplaces:that.savedPlaceResults, placeIds: that.savedPlaceIds, savedplaceaddresses: that.savedPlaceAddresses});
        });
      return savedPlaceData.promise;
    }

    return LocationSearch;
  });
