'use strict';

angular.module('applyMyRideApp')
  .controller('ParatransitController', ['$scope','$routeParams', '$location', 'flash', 'planService', '$http', 'ipCookie',
    function ($scope, $routeParams, $location, flash, planService, $http, ipCookie) {

      $scope.location = $location.path();
      $scope.disableNext = true;
      $scope.tripid = $routeParams.tripid;
      $scope.showDiv = {};

      $scope.reset = function() {
        planService.reset();
        $location.path("/plan/fromDate");
      };

      $scope.prepareTrip = function(){

        angular.forEach(planService.paratransitItineraries, function(result, index) {
          result.wait_startDesc = moment(result.wait_start).format('h:mm a');
          result.wait_endDesc = moment(result.wait_end).format('h:mm a');
          result.arrivalDesc = moment(result.arrival).format('h:mm a');
        });
        $scope.purpose = planService.itineraryRequestObject.trip_purpose;
        angular.forEach(planService.booking_results, function(result, index) {
          result.wait_startDesc = moment(result.wait_start).format('h:mm a');
          result.wait_endDesc = moment(result.wait_end).format('h:mm a');
          result.arrivalDesc = moment(result.arrival).format('h:mm a');
          result.travelTime = humanizeDuration(result.negotiated_duration * 1000,  { units: ["hours", "minutes"], round: true });
          if(!result.booked  == true){
            $scope.booking_failed = true;
          }
        });

        if(!$scope.booking_failed){
          ipCookie('rideCount', ipCookie('rideCount') + 1);
          $scope.rideCount = ipCookie('rideCount');
        }

        $scope.booking_results = planService.booking_results;
        $scope.paratransitItineraries = planService.paratransitItineraries;
        $scope.driverInstructions = planService.driverInstructions;
        if($scope.driverInstructions == null)
          $scope.driverInstructions = 'N/A';

        $scope.escort = "";
        if(planService.hasEscort == true){
          $scope.escort += "1 Escort";
        }

        if(planService.numberOfCompanions != null && planService.numberOfCompanions > 0){
          if($scope.escort){
            $scope.escort += ', ';
          }
          $scope.escort += planService.numberOfCompanions + ' Companion';
          if(planService.numberOfCompanions > 1){
            $scope.escort += 's';
          }
        }

        if($scope.escort.length == 0)
          $scope.escort = 'N/A';

      }

      $scope.cancelTrip = function(paratransitItineraries){
        $event.stopPropagation();
        var message = "Are you sure you want to cancel this ride?";
        var successMessage = 'Your trip has been cancelled.'
        
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
            if(result == true){
              var cancel = {};
              cancel.bookingcancellation_request = [];
              angular.forEach(paratransitItineraries, function(itinerary, index) {
                var bookingCancellation = {};
                if(itinerary.id){
                  bookingCancellation.itinerary_id = itinerary.id;
                }
                else if(itinerary.booking_confirmation){
                  bookingCancellation.booking_confirmation = itinerary.booking_confirmation;     
                }
                cancel.bookingcancellation_request.push(bookingCancellation);
              });
              
              var cancelPromise = planService.cancelTrip($http, cancel)
              cancelPromise.error(function(data) {
                bootbox.alert("An error occurred, your trip was not cancelled.  Please call 1-844-PA4-RIDE for more information.");
              });
              cancelPromise.success(function(data) {
                bootbox.alert(successMessage, function(){
                    $location.path("/plan/where");
                });
                ipCookie('rideCount', ipCookie('rideCount') - 1);

              })
            }
          }
        });
      }

      $scope.prepareTrip();

    }


  ]);
