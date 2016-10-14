'use strict';

angular.module('applyMyRideApp')
  .controller('ItineraryController', ['$scope','$routeParams', '$location', 'flash', 'planService', '$http','ipCookie',
    function ($scope, $routeParams, $location, flash, planService, $http, ipCookie) {
      $scope.showDiv = {};
      $scope.location = $location.path();
      $scope.savedItineraryView = true;
      $scope.trip = planService.selectedTrip;
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

        var firstItinerary = $scope.trip.itineraries[0];

        angular.forEach($scope.paratransitItineraries, function(result, index) {
          result.wait_startDesc = moment(result.wait_start).format('h:mm a');
          result.wait_endDesc = moment(result.wait_end).format('h:mm a');
          result.arrivalDesc = moment(result.arrival).format('h:mm a');
        });

        $scope.escort = "";

        if(firstItinerary.assistant == "true"){
          $scope.escort += "1 Escort";
        }

        if(firstItinerary.companions != null && firstItinerary.companions > 0){
          if($scope.escort){
            $scope.escort += ', ';
          }
          $scope.escort += firstItinerary.companions  + ' Companion';
          if(firstItinerary.companions > 1){
            $scope.escort += 's';
          }
        }

        if($scope.escort.length == 0)
          $scope.escort = 'N/A';

      }
      $scope.mode = $scope.trip.mode;

      if($scope.trip.itineraries.length > 0){
        $scope.tripCancelled = $scope.trip.itineraries[0].status == "canceled" ? true : false;
      }

      $scope.cancelTrip = function(){

        $scope.trip = planService.selectedTrip;
        

        var message = "Are you sure you want to cancel this ride?";
        var successMessage = 'Your trip has been cancelled.';
        
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
          callback: function(result){
            if(result == true){
              var cancel = {};

              cancel.bookingcancellation_request = [];
              angular.forEach($scope.trip.itineraries, function(itinerary, index) {
                var bookingCancellation = {};
                if(($scope.trip.mode == 'mode_transit' || $scope.trip.mode == 'mode_taxi' || $scope.trip.mode == 'mode_ride_hailing' || $scope.trip.mode == 'mode_walk') && itinerary.id){
                  bookingCancellation.itinerary_id = itinerary.id;
                }
                else if($scope.trip.mode == 'mode_paratransit' && itinerary.booking_confirmation){
                  bookingCancellation.booking_confirmation = itinerary.booking_confirmation;     
                }
                cancel.bookingcancellation_request.push(bookingCancellation);
              });
              
              var cancelPromise = planService.cancelTrip($http, cancel)
              cancelPromise.error(function(data) {
                bootbox.alert("An error occurred, your trip was not cancelled.  Please call 1-844-PA4-RIDE for more information.");
              });
              cancelPromise.success(function(data) {
                bootbox.alert(successMessage);
                ipCookie('rideCount', ipCookie('rideCount') - 1);
                $scope.tripCancelled = true;
              })
            }
          }
        })
      }

      $scope.show = function(event){
        var index = $(event.target).parents('.timeline').attr('index');
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

    }
]);
