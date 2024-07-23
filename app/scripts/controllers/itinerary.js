'use strict';

angular.module('applyMyRideApp')
  .controller('ItineraryController', ['$scope','$routeParams', '$location', 'flash', 'planService', '$http','ipCookie',
    function ($scope, $routeParams, $location, flash, planService, $http, ipCookie) {
      $scope.showDiv = {};
      $scope.location = $location.path();
      $scope.savedItineraryView = true;
      $scope.trip = planService.selectedTrip;
      // If a trip exists, then fetch user notification preference defaults
      if ($scope.trip && $scope.trip.mode === 'mode_transit') {
        const notificationPrefs = $scope.trip.details ? $scope.trip.details.notification_preferences : {fixed_route: []}
        planService.getUserNotificationDefaults($http).then(() => {
        /**
         *** $scope.fixedRouteReminderPref format
         * @typedef {Object} NotificationPref
         *  @property {{reminders: Object[], disabled: boolean[]}} fixed_route
         *
         * @type {NotificationPref}
         */
          $scope.fixedRouteReminderPrefs = planService.syncFixedRouteNotifications(notificationPrefs, new Date($scope.trip.itineraries[0].departure))
        })
      }

      angular.forEach($scope.trip.itineraries, function(itinerary, index) {
        planService.prepareItinerary(itinerary);
      });
      if($scope.trip.mode == 'mode_transit'){
        $scope.itineraries = $scope.trip.itineraries;
      }else if($scope.trip.mode == 'mode_taxi'){
        $scope.taxiItinerary = $scope.trip.itineraries[0];
        if($scope.trip.itineraries.length > 1){
          $scope.taxiItinerary.returnItinerary = $scope.trip.itineraries[1];
        }
        if( !$scope.taxiItinerary.cost){
          $scope.taxiItinerary.cost = $scope.taxiItinerary.fare;
        }
        if( !$scope.taxiItinerary.destination.line1 && !$scope.taxiItinerary.destination.line2){
          $scope.taxiItinerary.destination.line2 = $scope.taxiItinerary.destination.formatted_address;
          $scope.taxiItinerary.origin.line2 = $scope.taxiItinerary.origin.formatted_address;
        }
      }else if($scope.trip.mode == 'mode_ride_hailing'){
        $scope.uberItinerary = $scope.trip.itineraries[0];
        if($scope.trip.itineraries.length > 1){
          $scope.uberItinerary.returnItinerary = $scope.trip.itineraries[1];
        }
        if( !$scope.uberItinerary.cost){
          $scope.uberItinerary.cost = $scope.uberItinerary.fare;
        }
        if( !$scope.uberItinerary.destination.line1 && !$scope.uberItinerary.destination.line2){
          $scope.uberItinerary.destination.line2 = $scope.uberItinerary.destination.formatted_address;
          $scope.uberItinerary.origin.line2 = $scope.uberItinerary.origin.formatted_address;
        }
      }else if($scope.trip.mode == 'mode_walk'){
        $scope.walkItineraries = $scope.trip.itineraries;
      }else if($scope.trip.mode == 'mode_paratransit'){
        $scope.paratransitItineraries = $scope.trip.itineraries;
        $scope.liveTrip = $scope.trip.isLive ? $scope.trip : null;
        if($scope.liveTrip) {
          planService.createEtaChecker($scope, $http, ipCookie);
        }

        var firstItinerary = $scope.trip.itineraries[0];

        angular.forEach($scope.paratransitItineraries, function(result, index) {
          result.wait_startDesc = moment.parseZone(result.wait_start).format('h:mm a');
          result.wait_endDesc = moment.parseZone(result.wait_end).format('h:mm a');
          result.arrivalDesc = moment(result.arrival).format('h:mm a');
        });

        $scope.escort = "";

        if (firstItinerary.assistant == true) {
          $scope.escort += "1 Escort";
        }

        if(firstItinerary.companions != null && firstItinerary.companions > 0){
          if ($scope.escort) {
            $scope.escort += ', ';
          }
          $scope.escort += firstItinerary.companions  + ' Companion';
          if (firstItinerary.companions > 1) {
            $scope.escort += 's';
          }
        }

        if ($scope.escort.length == 0) {
          $scope.escort = 'N/A';
        }

      }
      $scope.mode = $scope.trip.mode;
      if($scope.trip.itineraries.length > 0){
        $scope.tripCancelled = $scope.trip.itineraries[0].status == "canceled" ? true : false;
      }

      $scope.updateTransitTripReminders = function($event) {
        $event.preventDefault()
        // merge old notification preferences with updated ones
        const tripDetails = {
          notification_preferences: {
            ...planService.selectedTrip.details.notification_preferences,
            fixed_route: $scope.fixedRouteReminderPrefs.reminders
          }
        }
        // grab trip id(s) and build update trip request object
        const trip = $scope.trip.id
        const updateTripRequest = {trip, details: tripDetails}

        const planPromise = planService.updateTripDetails($http, updateTripRequest)
          planPromise.then(function(results) {
            const notificationPrefs = results.data.trip[0].details.notification_preferences
            $scope.fixedRouteReminderPrefs = planService.syncFixedRouteNotifications(notificationPrefs, new Date($scope.trip.itineraries[0].departure))
            bootbox.alert("Trip notification preferences updated!")
          })
      }

      $scope.cancelTrip = function() {
        var currentTime = new Date();
        var firstItinerary = $scope.trip.itineraries[0];
        var startTime = moment.parseZone(firstItinerary.wait_start).toDate();
      
        var timeDiff = startTime - currentTime;
        var oneHour = 60 * 60 * 1000;
      
        if (timeDiff < oneHour) {
          bootbox.alert("Your trip is within the one-hour cancellation window and cannot be cancelled through FMR Schedule. Please call your local transit agency for trip cancellation options.");
          return;
        }
      
        $scope.trip = planService.selectedTrip;
        var message = "Are you sure you want to cancel this ride?";
      
        // Show confirmation for canceling the current itinerary leg
        bootbox.confirm({
          message: message,
          buttons: {
            'cancel': {
              label: 'Keep Ride'
            },
            'confirm': {
              label: 'Cancel Ride'
            }
          },
          callback: function(result) {
            if (result) {
              if ($scope.trip.itineraries.length > 1) {
                if ($scope.outboundCancelled) {
                  $scope.cancelCall('RETURN'); // Cancel the return trip
                } else if ($scope.returnCancelled) {
                  $scope.cancelCall('OUTBOUND'); // Cancel the outbound trip
                } else {
                  $scope.cancelCall('OUTBOUND'); // Default to canceling the current leg
                }
              } else {
                $scope.cancelCall('BOTH'); // Cancel the single leg
              }
            }
          }
        });
      }
      

      $scope.cancelCall = function(result){
        if(result != 'BOTH' && result != 'OUTBOUND' && result != 'RETURN'){
          return;
        }
      
        var itinsToCancel; 
        var successMessage;
        if(result == 'BOTH'){
          itinsToCancel = $scope.trip.itineraries;
          successMessage = 'Your one-way trip cancellation was successful. Any related trips need to be canceled separately.';
        }
        else if(result == 'OUTBOUND'){
          itinsToCancel = [$scope.trip.itineraries[0]];
          successMessage = 'Your one-way trip cancellation was successful. Any related trips need to be canceled separately.';
        } else if(result == 'RETURN'){
          itinsToCancel = [$scope.trip.itineraries[$scope.trip.itineraries.length - 1]];
          successMessage = 'Your one-way trip cancellation was successful. Any related trips need to be canceled separately.';
        }
        
        var cancel = {};
        cancel.bookingcancellation_request = [];
        angular.forEach(itinsToCancel, function(itinerary, index) {
          var bookingCancellation = {};
          if(($scope.trip.mode == 'mode_transit' || $scope.trip.mode == 'mode_taxi' || $scope.trip.mode == 'mode_ride_hailing' || $scope.trip.mode == 'mode_walk') && itinerary.id){
            bookingCancellation.itinerary_id = itinerary.id;
          }
          else if($scope.trip.mode == 'mode_paratransit' && itinerary.booking_confirmation){
            bookingCancellation.booking_confirmation = itinerary.booking_confirmation;
          }
          cancel.bookingcancellation_request.push(bookingCancellation);
        });
      
        var cancelPromise = planService.cancelTrip($http, cancel);
        cancelPromise.then(function(data) {
          bootbox.alert(successMessage, function() {
        $scope.$apply(function() {
          $scope.viewMyRides();
            });
          });
        }, function(error) {
          bootbox.alert("An error occurred, your trip was not cancelled. Please contact your local transit authority for more information.");
        });
      }

      $scope.show = function(event){
        const index = $(event.target).parents('.accordion').attr('index');
        $scope.showDiv[index] = !$scope.showDiv[index];
      }

      $scope.viewMyRides = function() {
        $location.path("/plan/my_rides");
      };

      $scope.toggleEmail = function($event) {
        $scope.invalidEmail = false;
        $scope.showEmail = !$scope.showEmail;
        $event.stopPropagation();
      };

      $scope.sendEmail = function($event) {
        $event.stopPropagation();
        var trip = $scope.trip;
        var emailString = $scope.emailString;

        if(emailString){
          var result = planService.validateEmail(emailString);
          if(result == true){

            $scope.showEmail = false;

            var emailRequest = {};
            emailRequest.email_address = emailString;

            angular.forEach(trip.itineraries, function(itinerary, index) {
              if(itinerary.mode === "mode_paratransit"){
                if(index == 0){
                  emailRequest.booking_confirmations = [];
                }
                emailRequest.booking_confirmations.push(itinerary.booking_confirmation);
              }
              else if(index == 0){
                emailRequest.trip_id = itinerary.trip_id.toString();
              }
            });

            var emailPromise = planService.emailItineraries($http, emailRequest);
            emailPromise.error(function(data) {
              bootbox.alert("An error occurred on the server, your email was not sent.");
            });
            bootbox.alert('Your email was sent');
          }else{
            $scope.invalidEmail = true;
          }
        }
      }

      $scope.$on("$destroy", function () {
        planService.killEtaChecker();
      });
    }
]);
