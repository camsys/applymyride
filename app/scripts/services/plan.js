'use strict';

angular.module('applyMyRideApp')
    .service('planService', function() {

      this.reset = function(){
        delete this.fromDate;
        delete this.fromTime;
        delete this.fromTimeType;
        delete this.fromDetails;
        delete this.toDetails;
        delete this.returnDate;
        delete this.returnTime;
        delete this.returnTimeType;
      }

      this.getPrebookingQuestions = function(){
        var questions = this.paratransitItineraries[0].prebooking_questions;
        var questionObj = {};
        angular.forEach(questions, function(question, index) {
          if(question.code == 'assistant'){
            questionObj.assistant = question.question;
          }else if(question.code == 'children'){
            questionObj.children = question.question;
            questionObj.limit = question.choices;
            if(questionObj.limit[0] == '0'){
              questionObj.limit.shift();
            }
          }
        });
        return questionObj;
      }

      this.emailItineraries = function($http, emailRequest){
        return $http.post('api/v1/itineraries/email', emailRequest, this.getHeaders())
      }

      this.cancelTrip = function($http, cancelRequest){
        return $http.post('api/v1/itineraries/cancel', cancelRequest, this.getHeaders())
      }

      this.validateEmail = function(emailString){
        var addresses = emailString.split(/[ ,;]+/);
        var valid = true;
        var that = this;
        angular.forEach(addresses, function(address, index) {
          var result = that.validateEmailAddress(address);
          if(result == false){
            valid = false;
          }
        });
        return valid;
      }

      this.validateEmailAddress = function(email) {
        var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
        return re.test(email);
      }

      this.getRides = function($http, $scope, ipCookie) {
        var that = this;
        $http.get('api/v1/trips/list', this.getHeaders()).
          success(function(data) {
            var sortable = [];
            angular.forEach(data.trips, function(trip, index) {
              if(trip.scheduled_time){
                sortable.push([trip, trip.itineraries[0].start_time])
              }
            });
            sortable.sort(function(a,b){ return a[1].localeCompare(b[1]); })
            $scope.trips = [];
            angular.forEach(sortable, function(trip, index) {
              $scope.trips.push(trip[0]);
            });
            var trips = {};
            trips.today = [];
            trips.past = [];
            trips.future = [];

            var tripDivs = {};
            tripDivs.today = [];
            tripDivs.past = [];
            tripDivs.future = [];

            angular.forEach($scope.trips, function(trip, index) {
              trip.mode = trip.itineraries[0].returned_mode_code;
              trip.roundTrip = trip.itineraries.length > 1 ? true : false;
              trip.startDesc = that.getDateDescription(trip.itineraries[0].start_time);
              trip.startDesc += " at " + moment(trip.itineraries[0].start_time).format('h:mm a');
              var dayDiff = moment(trip.itineraries[0].start_time).startOf('day').diff(moment().startOf('day'), 'days');
              if(dayDiff == 0) {
                trips.today.push(trip);
                tripDivs.today.push(false);
              }else if(dayDiff < 0){
                trips.past.push(trip);
                tripDivs.past.push(false);
              }else{
                trips.future.push(trip);
                tripDivs.future.push(false);
              }
            });
            ipCookie('rideCount', data.trips.length);
            $scope.trips = trips;
            $scope.tripDivs = tripDivs;
          });
      }

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
        request.when2 = (itineraryRequestObject.itinerary_request[0].departure_type == 'depart' ? "Start out at " : "Arrive by ") + moment(outboundTime).format('h:mm a');

        if(itineraryRequestObject.itinerary_request.length > 1){
          request.roundtrip = true;
          //round trip
          var returnTime = itineraryRequestObject.itinerary_request[1].trip_time;
          request.when3 = this.getDateDescription(returnTime);
          if(request.when1 == request.when3){
            request.sameday = true;
          }
          request.when4 = (itineraryRequestObject.itinerary_request[1].departure_type == 'depart' ? "Leave at " : "Get back by ") + moment(returnTime).format('h:mm a');
        }
        request.purpose = this.purpose;
        $scope.request = request;
      }

      this.prepareTripSearchResultsPage = function(){
        this.transitItineraries = [];
        this.paratransitItineraries = [];
        this.walkItineraries = [];
        this.tripId = this.searchResults.trip_id;
        var itineraries = this.searchResults.itineraries;
        var itinerariesBySegmentThenMode = this.getItinerariesBySegmentAndMode(itineraries);
        var fare_info = {};
        fare_info.roundtrip = false;
        if(this.itineraryRequestObject.itinerary_request.length > 1){
          fare_info.roundtrip = true;
        }
        var that = this;
        angular.forEach(Object.keys(itinerariesBySegmentThenMode), function(segmentIndex, index) {
          var itinerariesByMode = itinerariesBySegmentThenMode[segmentIndex];
          angular.forEach(Object.keys(itinerariesByMode), function(mode_code, index) {
            var fares = [];
            angular.forEach(itinerariesByMode[mode_code], function(itinerary, index) {
              if(itinerary.cost){
                var fare = parseFloat(Math.round(itinerary.cost * 100) / 100).toFixed(2);
                itinerary.cost = fare;
                fares.push(fare);
              } else if (itinerary.discounts){
                that.guestParatransitItinerary = itinerary;
                angular.forEach(itinerary.discounts, function(discount, index) {
                  var fare = parseFloat(Math.round(discount.fare * 100) / 100).toFixed(2);
                  fares.push(fare);
                });
              }
            });

            if(fares.length > 0){
              var lowestFare = Math.min.apply(null, fares).toFixed(2);
              var highestFare = Math.max.apply(null, fares).toFixed(2);
              if(lowestFare == highestFare || (mode_code == 'mode_paratransit' && that.email)){
                fare_info[[mode_code]] = "$" + lowestFare;  //if the user is registered, show the lowest paratransit fare
              }else{
                fare_info[[mode_code]] = "$" + lowestFare + "-$" + highestFare;
              }
            }
          });
        });

        var itinerariesByModeOutbound = itinerariesBySegmentThenMode[0];
        var itinerariesByModeReturn = itinerariesBySegmentThenMode[1];

        if(itinerariesByModeOutbound.mode_paratransit){
          var lowestPricedParatransitTrip = this.getLowestPricedParatransitTrip(itinerariesByModeOutbound.mode_paratransit);
          if(!this.email){
            //guest user, just use the first paratransit itinerary since the prices are unknown
            lowestPricedParatransitTrip = this.guestParatransitItinerary;
          }
          if(lowestPricedParatransitTrip){
            this.paratransitItineraries.push(lowestPricedParatransitTrip);
            fare_info.paratransitTravelTime = lowestPricedParatransitTrip.travelTime;
            fare_info.paratransitStartTime = lowestPricedParatransitTrip.startTime;
          }
        }

        if(itinerariesByModeOutbound.mode_transit){
          this.transitItineraries.push(itinerariesByModeOutbound.mode_transit);
        }


        if(itinerariesByModeOutbound.mode_walk){
          this.walkItineraries.push(itinerariesByModeOutbound.mode_walk[0]);
        }

        //if a mode doesn't appear in both outbound and return itinerary lists, remove it

        if(fare_info.roundtrip == true){
          if(itinerariesByModeReturn.mode_transit){
            this.transitItineraries.push(itinerariesByModeReturn.mode_transit);
          }else{
            this.transitItineraries = [];
          }

          if(itinerariesByModeReturn.mode_paratransit && this.email){ //this doesn't matter for guest users since they can't book anyway
            var lowestPricedParatransitTrip = this.getLowestPricedParatransitTrip(itinerariesByModeReturn.mode_paratransit);
            if(lowestPricedParatransitTrip){
              this.paratransitItineraries.push(lowestPricedParatransitTrip);
            }else{
              this.paratransitItineraries = [];
            }
          }

          if(itinerariesByModeReturn.mode_walk){
            this.walkItineraries.push(itinerariesByModeReturn.mode_walk[0]);
          }else{
            this.walkItineraries = [];
          }
        }

        this.transitInfos = [];
        if(itinerariesBySegmentThenMode[0] && itinerariesBySegmentThenMode[0].mode_transit){
          this.transitInfos.push(this.prepareTransitOptionsPage(itinerariesBySegmentThenMode[0].mode_transit));
        }

        if(itinerariesBySegmentThenMode[1] && itinerariesBySegmentThenMode[1].mode_transit){
          //for round trips, show the fare as the sum of the two recommended fares
          this.transitInfos.push(this.prepareTransitOptionsPage(itinerariesBySegmentThenMode[1].mode_transit));
          var fare1 = this.transitInfos[0][0].cost;
          var fare2 = this.transitInfos[1][0].cost;
          fare_info.mode_transit = (new Number(fare1) + new Number(fare2)).toFixed(2).toString();
        }else if (fare_info.roundtrip == true){
          this.transitInfos = [];
        }

        if(this.email){
          if(this.paratransitItineraries.length > 1){
            //for round trips, show the fare as the sum of the two PARATRANSIT fares
            var fare1 = this.paratransitItineraries[0].cost;
            var fare2 = this.paratransitItineraries[1].cost;
            fare_info.mode_paratransit = (new Number(fare1) + new Number(fare2)).toFixed(2).toString();
          }else if(this.paratransitItineraries.length == 1){
            fare_info.mode_paratransit = new Number(this.paratransitItineraries[0].cost).toFixed(2).toString();
          }
        }
        this.fare_info = fare_info;
      }

      this.getLowestPricedParatransitTrip = function(paratransitTrips){
        var lowestPricedParatransitTrip;
        angular.forEach(paratransitTrips, function(paratransitTrip, index) {
          if(paratransitTrip.duration && paratransitTrip.start_time && paratransitTrip.cost) {
            paratransitTrip.travelTime = humanizeDuration(paratransitTrip.duration * 1000, {
              units: ["hours", "minutes"],
              round: true
            });
            paratransitTrip.startTime = moment(paratransitTrip.start_time).format('h:mm a')
            if (!lowestPricedParatransitTrip) {
              lowestPricedParatransitTrip = paratransitTrip;
            } else {
              if (Number(paratransitTrip.cost) < Number(lowestPricedParatransitTrip.cost)) {
                lowestPricedParatransitTrip = paratransitTrip;
              }
            }
            lowestPricedParatransitTrip.travelTime = humanizeDuration(paratransitTrip.duration * 1000,  { units: ["hours", "minutes"], round: true });
            lowestPricedParatransitTrip.startTime = moment(paratransitTrip.start_time).format('h:mm a')
          }
        });
        return lowestPricedParatransitTrip;
      }

      this.getItinerariesBySegmentAndMode = function(itineraries){
        var itinerariesBySegmentThenMode = {};
        var that = this;
        angular.forEach(itineraries, function(itinerary, index) {

          that.prepareItinerary(itinerary);
          var mode = itinerary.returned_mode_code;
          var segment_index = itinerary.segment_index;
          if (itinerariesBySegmentThenMode[segment_index] == undefined){
            itinerariesBySegmentThenMode[segment_index] = {};
          }
          if (itinerariesBySegmentThenMode[segment_index][mode] == undefined){
            itinerariesBySegmentThenMode[segment_index][mode] = [];
          }
          itinerariesBySegmentThenMode[segment_index][mode].push(itinerary);
        }, itinerariesBySegmentThenMode);
        return itinerariesBySegmentThenMode;
      }

      this.prepareTransitOptionsPage = function(transitItineraries){
        var transitInfos = [];
        angular.forEach(transitItineraries, function(itinerary, index) {
          var transitInfo = {};
          transitInfo.id = itinerary.id;
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
        return transitInfos;
      }

      this.prepareItinerary = function(itinerary){
        this.setItineraryDescriptions(itinerary);
        if(itinerary.cost){
          itinerary.cost = parseFloat(Math.round(itinerary.cost * 100) / 100).toFixed(2);

        }
        if(itinerary.json_legs){
          var that = this;
          angular.forEach(itinerary.json_legs, function(leg, index) {
            that.setItineraryLegDescriptions(leg);
            if(leg.steps){
              angular.forEach(leg.steps, function(step, index) {
                that.setWalkingDescriptions(step);
              });
            }
          });
          itinerary.destinationDesc = itinerary.json_legs[itinerary.json_legs.length - 1].to.name;
          itinerary.destinationTimeDesc = itinerary.json_legs[itinerary.json_legs.length - 1].endTimeDesc;
        }
      }

      this.setItineraryDescriptions = function(itinerary){
        itinerary.startDesc = this.getDateDescription(itinerary.start_time);
        itinerary.startDesc += " at " + moment(itinerary.start_time).format('h:mm a')
        itinerary.endDesc = this.getDateDescription(itinerary.end_time);
        itinerary.endDesc += " at " + moment(itinerary.end_time).format('h:mm a');
        itinerary.travelTime = humanizeDuration(itinerary.duration * 1000,  { units: ["hours", "minutes"], round: true });
        itinerary.walkTimeDesc = humanizeDuration(itinerary.walk_time * 1000,  { units: ["hours", "minutes"], round: true });
        itinerary.dayAndDateDesc = moment(itinerary.start_time).format('dddd, MMMM Do');
        itinerary.startTimeDesc = moment(itinerary.start_time).format('h:mm a');
        itinerary.endTimeDesc = moment(itinerary.end_time).format('h:mm a');
        itinerary.distanceDesc = ( itinerary.distance * 0.000621371 ).toFixed(2);
        itinerary.walkDistanceDesc = ( itinerary.walk_distance * 0.000621371 ).toFixed(2);
      }

      this.setItineraryLegDescriptions = function(itinerary){
        itinerary.startDateDesc = this.getDateDescription(itinerary.startTime);
        itinerary.startTimeDesc = moment(itinerary.startTime).format('h:mm a')
        itinerary.startDesc = itinerary.startDateDesc + " at " + itinerary.startTimeDesc;
        itinerary.endDateDesc = this.getDateDescription(itinerary.endTime);
        itinerary.endTimeDesc = moment(itinerary.endTime).format('h:mm a');
        itinerary.endDesc = itinerary.endDateDesc + " at " + itinerary.endTimeDesc;
        itinerary.travelTime = humanizeDuration(itinerary.duration * 1000,  { units: ["hours", "minutes"], round: true });
        itinerary.distanceDesc = ( itinerary.distance * 0.000621371 ).toFixed(2);
        itinerary.dayAndDateDesc = moment(itinerary.startTime).format('dddd, MMMM Do');
      }

      this.setWalkingDescriptions = function(step){
        step.distanceDesc = ( step.distance * 0.000621371 ).toFixed(2);
        step.arrow = 'straight';

        if(step.relativeDirection.indexOf('RIGHT') > -1){
          step.arrow = 'right';
        }else if(step.relativeDirection.indexOf('LEFT') > -1){
          step.arrow = 'left';
        }

        if(step.relativeDirection == 'DEPART'){
          step.description = 'Head ' + step.absoluteDirection.toLowerCase() + ' on ' + step.streetName;
        }else{
          step.description = this.capitalizeFirstLetter(step.relativeDirection) + ' on ' + step.streetName;
        }
        step.description = step.description.replace(/_/g,' ');
      }

      this.capitalizeFirstLetter = function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
      }

      this.getAddressDescriptionFromLocation = function(location){
        var description = {};
        if(location.poi){
          description.line1 = location.poi.name
          description.line2 = location.formatted_address;
          if(description.line2.indexOf(description.line1) > -1){
            description.line2 = description.line2.substr(description.line1.length + 2);
          }
        }else if(location.name){
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
        if(!date)
          return null;
        var description;
        var now = moment().startOf('day');
        var then = moment(date).startOf('day');
        var dayDiff = now.diff(then, 'days');
        if(dayDiff == 0) {
          description = "Today";
        } else if (dayDiff == 1) {
          description = "Tomorrow";
        }else{
          description = moment(date).format('dddd MMM DD, YYYY');
        }
        return description;
      }

      this.getTripPurposes = function($scope, $http) {
        this.fixLatLon(this.fromDetails);
        return $http.post('api/v1/trip_purposes/list', this.fromDetails, this.getHeaders()).
          success(function(data) {
            $scope.purposes = data.trip_purposes;
          }).
          error(function(data) {
            alert(data);
          });
      }

      this.selectItineraries = function($http, itineraryObject) {
        return $http.post('api/v1/itineraries/select', itineraryObject, this.getHeaders());
      }

      this.checkServiceArea = function($http, place) {
        this.fixLatLon(place);
        return $http.post('api/v1/places/within_area', place, this.getHeaders());
      }

      this.postItineraryRequest = function($http) {
        return $http.post('api/v1/itineraries/plan', this.itineraryRequestObject, this.getHeaders());
      }

      this.bookSharedRide = function($http) {
        var requestHolder = {};
        requestHolder.booking_request = [];

        var that = this;
        angular.forEach(this.paratransitItineraries, function(paratransitItinerary, index) {
          var bookingRequest = {};
          bookingRequest.itinerary_id = paratransitItinerary.id;

          if(that.hasEscort){
            bookingRequest.escort = that.hasEscort;
          }

          if(that.numberOfFamily){
            bookingRequest.family = that.numberOfFamily;
          }

          if(that.numberOfCompanions){
            bookingRequest.companions = that.numberOfCompanions;
          }

          if(that.driverInstructions){
            bookingRequest.note = that.driverInstructions;
          }
          requestHolder.booking_request.push(bookingRequest);
        });

        this.booking_request = requestHolder;

        return $http.post('api/v1/itineraries/book', requestHolder, this.getHeaders());

      }

      this.createItineraryRequest = function() {
        if(this.fromDetails.poi){
          this.fromDetails.name = this.fromDetails.poi.name
        }
        if(this.toDetails.poi){
          this.toDetails.name = this.toDetails.poi.name
        }
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

            //verify the location has a street address
            if(that.results.length < 10 && ((value.types.indexOf('route') > -1) || (value.types.indexOf('establishment') > -1))){
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
          if(that.recentSearchResults.length < 10 && key.toLowerCase().indexOf(text.toLowerCase()) > -1 && that.recentSearchResults.indexOf(key) < 0){
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
      this.poiData = [];
      var that = this;
      $http.get('api/v1/places/search?include_user_pois=true&search_string=%25' + text + '%25', config).
        success(function(data) {
          var locations = data.places_search_results.locations;
          angular.forEach(locations, function(value, index) {
            if(that.savedPlaceResults.length < 10){
              that.savedPlaceResults.push(value.name + " " + value.formatted_address);
              that.savedPlaceAddresses.push(value.formatted_address);
              that.savedPlaceIds.push(value.place_id);
              that.poiData.push(value);
            }
          });
          savedPlaceData.resolve({savedplaces:that.savedPlaceResults, placeIds: that.savedPlaceIds, savedplaceaddresses: that.savedPlaceAddresses, poiData: that.poiData});
        });
      return savedPlaceData.promise;
    }

    return LocationSearch;
  });
