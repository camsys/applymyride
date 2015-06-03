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
        var itinerariesBySegmentThenMode = {};
        var fare_info = {};
        var that = this;

        angular.forEach(itineraries, function(itinerary, index) {

          itinerary.startDesc = that.getDateDescription(itinerary.start_time);
          itinerary.startDesc += " at " + moment(itinerary.start_time).format('h:mm a')
          itinerary.endDesc = that.getDateDescription(itinerary.end_time);
          itinerary.endDesc += " at " + moment(itinerary.end_time).format('h:mm a');
          itinerary.travelTime = humanizeDuration(itinerary.duration * 1000,  { units: ["hours", "minutes"], round: true });

          var mode = itinerary.returned_mode_code;
          var segment_index = itinerary.segment_index;
          console.log('adding itineraries for segment: ' + segment_index + ' mode: ' + mode);
          if (itinerariesBySegmentThenMode[segment_index] == undefined){
            itinerariesBySegmentThenMode[segment_index] = {};
          }
          if (itinerariesBySegmentThenMode[segment_index][mode] == undefined){
            itinerariesBySegmentThenMode[segment_index][mode] = [];
          }
          itinerariesBySegmentThenMode[segment_index][mode].push(itinerary);
        }, itinerariesBySegmentThenMode);


        var itinerariesByMode = itinerariesBySegmentThenMode['0'];
        var paratransitTrips = itinerariesByMode.mode_paratransit;
        if(paratransitTrips){
          var lowestPricedParatransitTrip;
          angular.forEach(paratransitTrips, function(paratransitTrip, index) {
            if(paratransitTrip.duration && paratransitTrip.start_time){
              paratransitTrip.travelTime = humanizeDuration(paratransitTrip.duration * 1000,  { units: ["hours", "minutes"], round: true });
              paratransitTrip.startTime = moment(paratransitTrip.start_time).format('h:mm a')
              if(!lowestPricedParatransitTrip){
                lowestPricedParatransitTrip = paratransitTrip;
              }else{
                if(Number(paratransitTrip.cost) < Number(lowestPricedParatransitTrip.cost)){
                  lowestPricedParatransitTrip = paratransitTrip;
                }
              }
            }
          });
          if(lowestPricedParatransitTrip){
            itinerariesByMode.mode_paratransit = [lowestPricedParatransitTrip];
            this.paratransitItinerary = lowestPricedParatransitTrip;
          }else{
            delete itinerariesByMode.mode_paratransit;
          }
        }

        var walkTrips = itinerariesByMode.mode_walk;
        if(walkTrips){
          this.walkItinerary = walkTrips[0];
        }

        var taxiTrips = itinerariesByMode.mode_taxi;
        if(taxiTrips){
          this.taxiItinerary = taxiTrips[0];
        }

        angular.forEach(Object.keys(itinerariesByMode), function(mode_code, index) {
          var fares = [];
          angular.forEach(itinerariesByMode[mode_code], function(itinerary, index) {
            if(itinerary.cost){
              var fare = parseFloat(Math.round(itinerary.cost * 100) / 100).toFixed(2);
              itinerary.cost = fare;
              fares.push(fare);
            }
          }, $scope);

          var lowestFare = Math.min.apply(null, fares).toFixed(2);
          var highestFare = Math.max.apply(null, fares).toFixed(2);
          if(lowestFare == highestFare){
            fare_info[[mode_code]] = "$" + lowestFare;
          }else{
            fare_info[[mode_code]] = "$" + lowestFare + "-$" + highestFare;
          }
          $scope[mode_code] = itinerariesByMode[mode_code];
        }, $scope);
        var modes = Object.keys(fare_info);
        var index = $.inArray("mode_transit", modes);
        if (index>=0) modes.splice(index, 1);
        index = $.inArray("mode_paratransit", modes);
        if (index>=0){
          modes.splice(index, 1);
          fare_info.paratransitTravelTime = itinerariesByMode.mode_paratransit[0].travelTime;
          fare_info.paratransitStartTime = itinerariesByMode.mode_paratransit[0].startTime;
        }
        if(modes.length > 0){
          fare_info.other = true;
        }else{
          fare_info.other = false;
        }
        $scope.fare_info = fare_info;

        itinerariesByMode.mode_transit = [itinerariesByMode.mode_transit[0]];

        if(itinerariesByMode.mode_transit && itinerariesByMode.mode_transit.length == 1){
          this.prepareTransitOptionsPage($scope);
        }
        $scope.transitInfos = [$scope.transitInfos[0]];
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
          transitInfo.startDesc = itinerary.startDesc
          transitInfo.endDesc = itinerary.endDesc;
          transitInfo.travelTime = itinerary.travelTime;
          transitInfo.duration = itinerary.duration;
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
          } else if (transitInfo.duration < best.duration){
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
        $http.get('api/v1/trip_purposes/list', this.getHeaders()).
          success(function(data) {
            $scope.purposes = data.trip_purposes;
          }).
          error(function(data) {
            alert(data);
          });
      }

      this.postItineraryRequest = function($http) {
        //var promise2 = $http.post('api/v1/itineraries/plan', this.itineraryRequestObject, this.getHeaders());
        var promise2 = $http.post('api/v1/itineraries/plan', this.itineraryRequestObject);
        var promise3 = promise2.then(function(result) {
          return result.data;
        });
        return promise3;
      }

      this.bookSharedRide = function($http) {
        var requestHolder = {};
        requestHolder.booking_request = [];
        var bookingRequest = {};
        requestHolder.booking_request.push(bookingRequest);
        bookingRequest.itinerary_id = this.paratransitItinerary.id;

        if(this.hasEscort){
          bookingRequest.escort = this.hasEscort;
        }

        if(this.numberOfFamily){
          bookingRequest.family = this.numberOfFamily;
        }

        if(this.numberOfCompanions){
          bookingRequest.companions = this.numberOfCompanions;
        }

        if(this.driverInstructions){
          bookingRequest.note = this.driverInstructions;
        }
        return $http.post('api/v1/itineraries/book', bookingRequest, this.getHeaders());

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

      this.getHeaders = function(){
        var headers = {headers:  {
          "X-User-Email" : this.email,
          "X-User-Token" : this.authentication_token}
        };
        return headers;
      }
    }
);

angular.module('applyMyRideApp')
  .service('LocationSearch', function($http, $q, localStorageService){

    var autocompleteService = new google.maps.places.AutocompleteService();

    var LocationSearch = new Object();

    LocationSearch.getLocations = function(text, config) {

      var compositePromise = $q.defer();

      $q.all([LocationSearch.getGooglePlaces(text), LocationSearch.getSavedPlaces(text, config), LocationSearch.getRecentSearches(text)]).then(function(results){
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
          bounds: new google.maps.LatLngBounds(
            //PA 7 county region
            new google.maps.LatLng(39.719635, -79.061985),
            new google.maps.LatLng(40.730426, -76.153193)
          )

        }, function(list, status) {
          angular.forEach(list, function(value, index) {
            if(that.results.length < 10){
              var terms = [];
              angular.forEach(value.terms, function(term, index) {
                terms.push(term.value)
              }, terms);
              that.results.push(terms.join(" "));
              that.placeIds.push(value.place_id);
            }
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
          if(that.recentSearchResults.length < 10 && key.toLowerCase().indexOf(text.toLowerCase()) > -1){
            var location = recentSearches[key];
            that.recentSearchResults.push(key);
            that.recentSearchPlaceIds.push(location.place_id)
          }
        });
        recentSearchData.resolve({recentsearches: that.recentSearchResults, placeIds: that.recentSearchPlaceIds});
      }
      return recentSearchData.promise;
    }

    LocationSearch.getSavedPlaces = function(text, config) {
      var savedPlaceData = $q.defer();
      this.savedPlaceIds = [];
      this.savedPlaceAddresses = [];
      this.savedPlaceResults = [];
      var that = this;
      $http.get('api/v1/places/search?include_user_pois=true&search_string=%25' + text + '%25', config).
        success(function(data) {
          var locations = data.places_search_results.locations;
          angular.forEach(locations, function(value, index) {
            if(that.savedPlaceResults.length < 10){
              that.savedPlaceResults.push(value.name + " " + value.formatted_address);
              that.savedPlaceAddresses.push(value.formatted_address);
              that.savedPlaceIds.push(value.place_id);
            }
          });
          savedPlaceData.resolve({savedplaces:that.savedPlaceResults, placeIds: that.savedPlaceIds, savedplaceaddresses: that.savedPlaceAddresses});
        });
      return savedPlaceData.promise;
    }

    return LocationSearch;
  });
