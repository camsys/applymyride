'use strict';


angular.module('applyMyRideApp')
    .service('planService', ['$rootScope', '$filter', function($rootScope, $filter) {

      this.reset = function(){
        delete this.fromDate;
        delete this.fromTime;
        delete this.fromTimeType;
        delete this.from;
        delete this.fromDetails;
        delete this.to;
        delete this.toDetails;
        delete this.returnDate;
        delete this.returnTime;
        delete this.returnTimeType;
        delete this.numberOfCompanions;
        delete this.hasEscort;
        delete this.driverInstructions;
        delete this.transitSaved;
        delete this.transitCancelled;
        delete this.taxiSaved;
        delete this.taxiCancelled;
        delete this.uberSaved;
        delete this.uberCancelled;
        delete this.walkSaved;
        delete this.walkCancelled;
        delete this.selectedBusOption;
        delete this.selectedTaxiOption;
        delete this.selectedUberOption;
        delete this.showBusRides;
      }

      var urlPrefix = '//' + APIHOST + '/';
      this.getPrebookingQuestions = function(){
        var questions = this.paratransitItineraries[0].prebooking_questions;
        var questionObj = {};
        angular.forEach(questions, function(question, index) {
          if(question.code == 'assistant'){
            questionObj.assistant = question.question;
          }else if(question.code == 'children' || question.code == 'companions'){
            questionObj.children = question.question;
            questionObj.limit = question.choices;
          }
        });
        return questionObj;
      }

      this.emailItineraries = function($http, emailRequest){
        return $http.post(urlPrefix + 'api/v1/trips/email', emailRequest, this.getHeaders())
      }

      this.cancelTrip = function($http, cancelRequest){
        return $http.post(urlPrefix + 'api/v1/itineraries/cancel', cancelRequest, this.getHeaders())
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

      this.getPastRides = function($http, $scope, ipCookie) {
        var tripType = 'past',
            urlPath = 'api/v1/trips/past_trips';
        return this.getRidesByType($http, $scope, ipCookie, tripType, urlPath);
      }

      this.getFutureRides = function($http, $scope, ipCookie) {
        var tripType = 'future',
            urlPath = 'api/v1/trips/future_trips';
        return this.getRidesByType($http, $scope, ipCookie, tripType, urlPath);
      }

      this.getRidesByType = function($http, $scope, ipCookie, tripType, urlPath) {
        var that = this;
        return $http.get(urlPrefix + urlPath, this.getHeaders()).
          success(function(data) {
    
            var sortable = [],
                tripDivs = [],
                trips = [];

            if(!$scope.trips)
              $scope.trips = {};

            if(!$scope.tripDivs)
              $scope.tripDivs = {};

            angular.forEach(data.trips, function(trip, index) {

              if(trip[0].departure && trip[0].status && (trip[0].status != "canceled" || tripType == 'past')){
                
                var i = 0;
                var trip_with_itineraries = {};
                
                trip_with_itineraries.itineraries = [];
                
                while(typeof trip[i] !== 'undefined'){

                  // Check for first itinerary to set Trip values
                  if(i == 0){ 
                    trip_with_itineraries.mode = trip[i].mode;
                    trip_with_itineraries.startDesc = that.getDateDescription(trip[i].wait_start || trip[i].departure);
                    trip_with_itineraries.startDesc += " at " + moment(trip[i].wait_start || trip[i].departure).format('h:mm a');

                    

                    var origin_addresses = trip[0].origin.address_components;
                    for(var n = 0; n < origin_addresses.length; n++){
                      var address_types = origin_addresses[n].types ;
                      if(address_types.length > 0 && address_types.indexOf("street_address") != -1){
                        trip_with_itineraries.from_place = origin_addresses[n].short_name;
                        break;
                      }  
                    }

                    if(!trip_with_itineraries.from_place && trip[0].origin.name){
                      trip_with_itineraries.from_place = trip[0].origin.name;
                    }

                    var destination_addresses = trip[0].destination.address_components;
                    for(var j = 0; j < destination_addresses.length; j++){
                      var address_types = destination_addresses[j].types ;
                      if(address_types.length > 0 && address_types.indexOf("street_address") != -1){
                        trip_with_itineraries.to_place = destination_addresses[j].short_name;
                        break;
                      }
                    }

                    if(!trip_with_itineraries.to_place && trip[0].destination.name){
                      trip_with_itineraries.to_place = trip[0].destination.name;
                    }

                  }

                  trip_with_itineraries.itineraries.push(trip[i]);
                  i++;
                }
                
                trip_with_itineraries.roundTrip = typeof trip[1] !== 'undefined' ? true : false;
                
                sortable.push([trip_with_itineraries, trip[0].departure])
              }
            });

            sortable.sort(function(a,b){ return a[1].localeCompare(b[1]); })
            
            angular.forEach(sortable, function(trip_and_departure_array, index) {
              trips.push(trip_and_departure_array[0]);
            });

            if(tripType == 'future'){
              $scope.trips.future = trips;
              $scope.tripDivs.future = tripDivs;
              ipCookie('rideCount', trips.length);
            }
            else {
              $scope.trips.past = trips;
              $scope.tripDivs.past = tripDivs;
            }

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
        this.confirmRequest = request;
      }

      this.prepareTripSearchResultsPage = function(){
        this.transitItineraries = [];
        this.paratransitItineraries = [];
        this.guestParatransitItinerary = null;
        this.taxiItineraries = [];
        this.uberItineraries = [];
        this.walkItineraries = [];
        this.tripId = this.searchResults.trip_id;
        var currencyFilter = $filter('currency');
        var freeFilter = $filter('free');
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
                itinerary.travelTime = humanizeDuration(itinerary.duration * 1000,  { units: ["hours", "minutes"], round: true });
                itinerary.startTime = moment(itinerary.start_time).format('h:mm a')
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
              lowestFare = currencyFilter(lowestFare);
              highestFare = currencyFilter(highestFare);
              if(lowestFare == highestFare || (mode_code == 'mode_paratransit' && that.email)){
                fare_info[[mode_code]] = freeFilter(lowestFare);  //if the user is registered, show the lowest paratransit fare
              }else{
                fare_info[[mode_code]] = lowestFare + "-" + highestFare;
              }
            }
          });
        });

        var itinerariesByModeOutbound = itinerariesBySegmentThenMode ? itinerariesBySegmentThenMode[0] : null;
        var itinerariesByModeReturn = itinerariesBySegmentThenMode ? itinerariesBySegmentThenMode[1] : null;

        if(itinerariesByModeOutbound){
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

          //Taxi trips are grouped by taxi company, ordered low to high
          if(itinerariesByModeOutbound.mode_taxi){
              this.taxiItineraries = itinerariesByModeOutbound.mode_taxi;
          }
          
          if(itinerariesByModeOutbound.mode_ride_hailing ){
              this.uberItineraries = itinerariesByModeOutbound.mode_ride_hailing;
          }

          if(itinerariesByModeOutbound.mode_walk){
              this.walkItineraries.push(itinerariesByModeOutbound.mode_walk[0]);
          }
        }

        //if a mode doesn't appear in both outbound and return itinerary lists, remove it

        if(itinerariesByModeReturn && fare_info.roundtrip == true){
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

          if(itinerariesByModeReturn.mode_taxi){
            //merge the return itineraries into the other itineraries, matching the service_ids
            itinerariesByModeReturn.mode_taxi.forEach(function(returnItinerary){
              //find the matching taxiItinerary, merge into that
              that.taxiItineraries.forEach(function(departItinerary){
                if(departItinerary.service_id == returnItinerary.service_id){
                  departItinerary.returnItinerary = returnItinerary;
                }
              })
            });
          }else{
            this.taxiItineraries = [];
          }
          
          if(itinerariesByModeReturn.mode_ride_hailing){
            //merge the return itineraries into the other itineraries, matching the service_ids
            itinerariesByModeReturn.mode_ride_hailing.forEach(function(returnItinerary){
              //find the matching itinerary, merge into that
              that.uberItineraries.forEach(function(departItinerary){
                if(departItinerary.service_id == returnItinerary.service_id){
                  departItinerary.returnItinerary = returnItinerary;
                }
              })
            });
          }else{
            this.uberItineraries = [];
          }

          if(itinerariesByModeReturn.mode_walk){
            this.walkItineraries.push(itinerariesByModeReturn.mode_walk[0]);
          }else{
            this.walkItineraries = [];
          }
        }

        this.transitInfos = [];
        if(itinerariesByModeOutbound && itinerariesByModeOutbound.mode_transit){
          this.transitInfos.push(this.prepareTransitOptionsPage(itinerariesBySegmentThenMode[0].mode_transit));
          
          //check for return, reseet transitInfos if this is round trip and no return
          if(itinerariesByModeReturn && itinerariesByModeReturn.mode_transit){
            //for round trips, show the fare as the sum of the two recommended fares
            this.transitInfos.push(this.prepareTransitOptionsPage(itinerariesBySegmentThenMode[1].mode_transit));
            if(this.selectedBusOption){
              var fare1 = this.transitInfos[0][ this.selectedBusOption[0] ].cost;
              var fare2 = this.transitInfos[1][ this.selectedBusOption[1] ].cost;
            }
            else{
              var fare1 = this.transitInfos[0][0].cost;
              var fare2 = this.transitInfos[1][0].cost;
            }
            fare_info.mode_transit = freeFilter(currencyFilter( (new Number(fare1) + new Number(fare2)).toFixed(2).toString() ));
          }else if (fare_info.roundtrip == true){
            this.transitInfos = [];
          }
        }

        if(this.email){
          if(this.paratransitItineraries.length > 1){
            //for round trips, show the fare as the sum of the two PARATRANSIT fares
            var fare1 = this.paratransitItineraries[0].cost || 0;
            var fare2 = this.paratransitItineraries[1].cost || 0;
            fare_info.mode_paratransit = freeFilter(currencyFilter( (new Number(fare1) + new Number(fare2)).toFixed(2).toString() ));
          }else if(this.paratransitItineraries.length == 1){
            fare_info.mode_paratransit = freeFilter(currencyFilter( new Number(this.paratransitItineraries[0].cost).toFixed(2).toString() ));
          }
        }
        this.fare_info = fare_info;
      }

      this.getLowestPricedParatransitTrip = function(paratransitTrips){
        var lowestPricedParatransitTrip;
        angular.forEach(paratransitTrips, function(paratransitTrip, index) {
          if( isNaN( parseInt( paratransitTrip.cost )) ){
            paratransitTrip.cost = 0;
          }
          if(paratransitTrip.duration && paratransitTrip.start_time && paratransitTrip.cost >= 0) {
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
          transitInfo.startDesc = itinerary.startTimeDesc;
          transitInfo.endDesc = itinerary.endTimeDesc;
          transitInfo.travelTime = itinerary.travelTime;
          transitInfo.duration = itinerary.duration;
          var found = false;
          angular.forEach(itinerary.json_legs, function(leg, index) {
            if(!found && leg.mode == 'BUS'){
              transitInfo.route = leg.routeShortName;
              found = true;
            }
          });
          transitInfo.walkTime = itinerary.walkTimeDesc;
          transitInfo.walkTimeInSecs = itinerary.walk_time;
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
          } else if (transitInfo.walkTimeInSecs < best.walkTimeInSecs / 2){
            transitInfo.label = "Less Walking"
          }else if (transitInfo.duration < best.duration){
            transitInfo.label = "Faster"
          } else if (transitInfo.walkTimeInSecs < best.walkTimeInSecs){
            transitInfo.label = "Less Walking"
          } else if(transitInfo.cost > best.cost){
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
        var startTime = itinerary.wait_start || itinerary.departure || itinerary.start_time;
        itinerary.startDesc = this.getDateDescription(startTime);
        itinerary.startDesc += " at " + moment(startTime).format('h:mm a')
        itinerary.endDesc = this.getDateDescription(itinerary.arrival);
        itinerary.endDesc += " at " + moment(itinerary.arrival).format('h:mm a');
        itinerary.travelTime = humanizeDuration(itinerary.duration * 1000,  { units: ["hours", "minutes"], round: true });
        itinerary.walkTimeDesc = humanizeDuration(itinerary.walk_time * 1000,  { units: ["hours", "minutes"], round: true });
        itinerary.dayAndDateDesc = moment(startTime).format('dddd, MMMM Do');
        itinerary.startTimeDesc = moment(itinerary.wait_start || itinerary.departure).format('h:mm a');
        itinerary.endTimeDesc = itinerary.arrival ? moment(itinerary.arrival).format('h:mm a') : "Arrive";
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
        }else if (dayDiff == -1) {
          description = "Tomorrow";
        }else if (dayDiff == 1) {
          description = "Yesterday";
        }else{
          description = moment(date).format('dddd MMM DD, YYYY');
        }
        return description;
      }

      this.getTripPurposes = function($scope, $http) {
        this.fixLatLon(this.fromDetails);
        return $http.post(urlPrefix + 'api/v1/trip_purposes/list', this.fromDetails, this.getHeaders()).
          success(function(data) {
            $scope.top_purposes = data.top_trip_purposes;
            data.trip_purposes = data.trip_purposes || [];
            $scope.purposes = data.trip_purposes.filter(function(el){
              var i;
              for(i=0; i<$scope.top_purposes.length; i+=1){
                if(el.code && $scope.top_purposes[i].code === el.code){
                  return false;
                }
              }
              return true;
            });
            if (data.default_trip_purpose != undefined && $scope.email == undefined){
              $scope.default_trip_purpose = data.default_trip_purpose;
              $scope.showNext = true;
            }
          }).
          error(function(data) {
            alert(data);
          });
      }

      this.selectItineraries = function($http, itineraryObject) {
        return $http.post(urlPrefix + 'api/v1/itineraries/select', itineraryObject, this.getHeaders());
      }

      this.checkServiceArea = function($http, place) {
        this.fixLatLon(place);
        return $http.post(urlPrefix + 'api/v1/places/within_area', place, this.getHeaders());
      }

      this.postItineraryRequest = function($http) {
        return $http.post(urlPrefix + 'api/v1/itineraries/plan', this.itineraryRequestObject, this.getHeaders());
      }

      this.postProfileUpdate = function($http) {
        return $http.post(urlPrefix + 'api/v1/users/update', this.profileUpdateObject, this.getHeaders());
      }

      this.getProfile = function($http) {
        return $http.get(urlPrefix + 'api/v1/users/profile', this.getHeaders());
      }

      this.getServiceHours = function($http){
        return $http.get(urlPrefix + '/api/v1/services/hours', this.getHeaders());
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

        return $http.post(urlPrefix + 'api/v1/itineraries/book', requestHolder, this.getHeaders());

      }

      this.createItineraryRequest = function() {
        if(this.fromDetails && this.fromDetails.poi){
          this.fromDetails.name = this.fromDetails.poi.name
        }
        if(this.toDetails && this.toDetails.poi){
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
        var fromDate = moment(this.fromDate).startOf('day').toDate();
        fromDate.setHours(fromTime.getHours());
        fromDate.setMinutes(fromTime.getMinutes());
        outboundTrip.trip_time = moment.utc(fromDate).format();
        if(this.asap){
          outboundTrip.trip_time = moment.utc(new Date()).format();
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
          var returnDate = moment(this.returnDate).startOf('day').toDate();
          returnDate.setHours(returnTime.getHours());
          returnDate.setMinutes(returnTime.getMinutes());
          var returnTimeString = moment.utc(returnDate).format();
          returnTrip.trip_time = returnTimeString;
          request.itinerary_request.push(returnTrip);
        }
        return request;
      };

      this.addStreetAddressToLocation = function(location) {
        return;
        /*
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
        */
      }

      this.fixLatLon = function(location) {
        /*

        do nothing, previously we had to mess around with the lat/lons

        if(typeof location.geometry.location.lat != 'number'){
          location.geometry.location.lat = location.geometry.location.lat();
          location.geometry.location.lng = location.geometry.location.lng();
        }

        */
      }

      this.getHeaders = function(){
        //return empty object if no email
        if(!this.email){ return {}; }
        var headers = {headers:  {
          "X-User-Email" : this.email,
          "X-User-Token" : this.authentication_token}
        };
        return headers;
      }

    }
  ]
);

angular.module('applyMyRideApp')
  .service('LocationSearch', function($http, $q, localStorageService, $filter){
    var countryFilter = $filter('noCountry');
    var urlPrefix = '//' + APIHOST + '/';

    var autocompleteService = new google.maps.places.AutocompleteService();

    var LocationSearch = new Object();

    LocationSearch.getLocations = function(text, config, includeRecentSearches) {

      var compositePromise = $q.defer();

      if(includeRecentSearches == true){
        $q.all([LocationSearch.getGooglePlaces(text), LocationSearch.getSavedPlaces(text, config), LocationSearch.getRecentSearches(text)]).then(function(results){
          compositePromise.resolve(results);
        });
      }else{
        $q.all([LocationSearch.getGooglePlaces(text), LocationSearch.getSavedPlaces(text, config)]).then(function(results){
          compositePromise.resolve(results);
        });
      }


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
            var formatted_address;
            //verify the location has a street address
            if(that.results.length < 10 && ((value.types.indexOf('route') > -1) || (value.types.indexOf('establishment') > -1) || (value.types.indexOf('street_address') > -1))){
              //var terms = [];
              //angular.forEach(value.terms, function(term, index) { terms.push(term.value); }, terms);
              formatted_address = countryFilter( value.description );
              that.results.push(formatted_address);
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
            that.recentSearchResults.push( countryFilter( key ) );
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
      $http.get(urlPrefix + 'api/v1/places/search?include_user_pois=true&search_string=%25' + text + '%25', config).
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

