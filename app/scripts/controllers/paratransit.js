'use strict';

angular.module('applyMyRideApp')
  .controller('ParatransitController', ['$scope','$routeParams', '$location', 'flash', 'planService', '$http', 'ipCookie',
    function ($scope, $routeParams, $location, flash, planService, $http, ipCookie) {

      $scope.location = $location.path();
      $scope.disableNext = true;
      $scope.tripid = $routeParams.tripid;
      $scope.showDiv = {};
      $scope.loggedIn = !!planService.email;

      $scope.reset = function() {
        planService.reset();
        $location.path("/plan/where");
      };

      $scope.prepareTrip = function(){

        angular.forEach(planService.paratransitItineraries, function(result, index) {
          planService.setItineraryDescriptions(result);
        });
        
        angular.forEach(planService.booking_results, function(result, index) {
          result.wait_startDesc = moment.parseZone(result.wait_start).format('h:mm a');
          result.wait_endDesc = moment.parseZone(result.wait_end).format('h:mm a');
          // don't assume wait window is 30 minutes, get diff
          var d1 = new Date(result.wait_end);
          var d2 = new Date(result.wait_start);

          result.arrivalDesc = moment.parseZone(result.arrival).format('h:mm a');
          if (result.negotiated_duration)
            result.travelTime = humanizeDuration(result.negotiated_duration * 1000,  { units: ["hours", "minutes"], round: true });
          else {
            var itinDuration = null;
            var itin_id = result.itinerary_id;
            angular.forEach(planService.paratransitItineraries, function (itinerary, index) {
              if (itinerary.id === itin_id)
                itinDuration = itinerary.duration;
            });
            result.travelTime = humanizeDuration(itinDuration * 1000, { units: ["hours", "minutes"], round: true });
            var arrival = new Date(d1.getTime() + ((d2 - d1) / 2) + (itinDuration * 1000));
            result.arrivalDesc = moment(arrival.toLocaleString("en-US", {timeZone: "US/Eastern"})).format('h:mm a');
          }
          if(!result.booked  == true){
            $scope.booking_failed = true;
          }
        });

        $scope.purpose = planService.itineraryRequestObject.trip_purpose;

        $scope.tripCancelled = !planService.booking_results[0].booked;

        if(!$scope.booking_failed){
          ipCookie('rideCount', ipCookie('rideCount') + 1);
          $scope.rideCount = ipCookie('rideCount');
        }

        $scope.booking_results = planService.booking_results;
        $scope.paratransitItineraries = planService.paratransitItineraries;
        $scope.driverInstructions = planService.driverInstructions;
        if ($scope.driverInstructions == null) {
          $scope.driverInstructions = 'N/A';
        }

        $scope.escort = "";
        
        if (planService.hasEscort == true) {
          $scope.escort += "1 Escort";
        }

        if (planService.numberOfCompanions != null && planService.numberOfCompanions > 0) {
          if ($scope.escort) {
            $scope.escort += ', ';
          }
          $scope.escort += planService.numberOfCompanions + ' Companion';
          if (planService.numberOfCompanions > 1) {
            $scope.escort += 's';
          }
        }

        if ($scope.escort.length == 0) {
          $scope.escort = 'N/A';
        }

      }

      $scope.cancelTrip = function(){
        var message = "Are you sure you want to cancel this ride?";
        var successMessage = 'Your trip has been cancelled.'

        $scope.paratransitItineraries = planService.paratransitItineraries;

        if($scope.paratransitItineraries.length > 1 &&  !$scope.outboundCancelled &&  !$scope.returnCancelled){
          
          // DEAL WITH Round Trips
          bootbox.prompt({
              title: message,
              message: '<p>Please select an option below:</p>',
              inputType: 'radio',
              inputOptions: [
              {
                  text: 'Cancel Entire Trip',
                  value: 'BOTH',
              },
              {
                  text: 'Cancel Outbound Trip Only',
                  value: 'OUTBOUND',
              },
              {
                  text: 'Cancel Return Trip Only',
                  value: 'RETURN',
              }
              ],
              buttons: {
                  'cancel': {
                    label: 'Keep Ride'
                  },
                  'confirm': {
                    label: 'Cancel Ride'
                  }
              },
              callback: function(result){
                $scope.cancelCall(result);
              }
          });
        }else{

        // DEAL WITH 1 Way Trips
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
            if(result){
              if($scope.outboundCancelled){
                 $scope.cancelCall('RETURN')
              } else if($scope.returnCancelled){
                 $scope.cancelCall('OUTBOUND')
              } else {
                $scope.cancelCall('BOTH')
              }
            }
          }
        })
      }
      }

      $scope.cancelCall = function(result){
        if(result != 'BOTH' && result != 'OUTBOUND' && result != 'RETURN'){
          return;
        }

        var itinsToCancel; 
        var successMessage;
        if(result == 'BOTH'){
          itinsToCancel = $scope.paratransitItineraries
          successMessage = 'Your trip has been cancelled.';
        }
        else if(result == 'OUTBOUND'){
          itinsToCancel = [$scope.paratransitItineraries[0]];
          successMessage = 'Your outbound trip has been cancelled.';
        } else if(result == 'RETURN'){
          itinsToCancel = [$scope.paratransitItineraries[$scope.paratransitItineraries.length - 1]];
          successMessage = 'Your return trip has been cancelled.';
        }
        
        var cancel = {};

        cancel.bookingcancellation_request = [];
        
        angular.forEach(itinsToCancel, function(itinerary, index) {
          var bookingCancellation = {};
          if(itinerary.id){
            bookingCancellation.itinerary_id = itinerary.id;
          } else if(itinerary.booking_confirmation){
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
          if(result == 'BOTH'){
            $scope.tripCancelled = true;
            ipCookie('rideCount', ipCookie('rideCount') - 1);
          }
          else if(result == 'OUTBOUND'){
            $scope.outboundCancelled = true;
            if($scope.returnCancelled){
              ipCookie('rideCount', ipCookie('rideCount') - 1);
            }
          }else if(result == 'RETURN'){
            $scope.returnCancelled = true;
            if($scope.outboundCancelled){
              ipCookie('rideCount', ipCookie('rideCount') - 1);
            }
          }
        })
      }
      $scope.bookSharedRide = function(){
        var promise = planService.bookSharedRide($http);
        promise.then(function(result) {
          planService.booking_results = result.data.booking_results;
          $scope.tripCancelled = false;
          return;
          $location.path('/paratransit/confirm_shared_ride');
        });
        return false;
      }

      $scope.toggleEmail = function($event) {
        $scope.invalidEmail = false;
        $scope.showEmail = !$scope.showEmail;
        $event.stopPropagation();
      };

      $scope.sendEmail = function($event) {
        
        $event.stopPropagation();
        var bookingResults = $scope.booking_results;
        var emailString = $scope.emailString;

        if(emailString && bookingResults.length > 0){
          var result = planService.validateEmail(emailString);
          if(result == true){

            $scope.showEmail = false;

            var emailRequest = {};
            emailRequest.email_address = emailString;

            angular.forEach(bookingResults, function(result, index) {
              if(result.booked == true){
                if(index == 0){
                  emailRequest.booking_confirmations = [];
                }
                emailRequest.booking_confirmations.push(result.confirmation_id);            
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

      $scope.prepareTrip();

    }


  ]);
