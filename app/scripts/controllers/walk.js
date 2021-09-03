'use strict';

angular.module('applyMyRideApp')
  .controller('WalkController', ['$scope','$routeParams', '$location', 'flash', 'planService', '$http',
    function ($scope, $routeParams, $location, flash, planService, $http) {

        $scope.location = $location.path();
        $scope.disableNext = true;

      $scope.loggedIn = !!planService.email;
      $scope.showEmail = false;

      $scope.reset = function() {
        planService.reset();
        $location.path("/plan/where");
      };

      $scope.toggleEmail = function() {
        $scope.invalidEmail = false;
        $scope.showEmail = !$scope.showEmail;
      };


      $scope.sendEmail = function() {
        if($scope.emailString){
          var result = planService.validateEmail($scope.emailString);
          if(result == true){

            $scope.showEmail = false;
            var addresses = $scope.emailString.split(/[ ,;]+/);
            var emailRequest = {};
            emailRequest.email_itineraries = [];
            angular.forEach(addresses, function(address, index) {
              var emailRequestPart = {};
              emailRequestPart.email_address = address;
              emailRequestPart.itineraries = [];
              var ids = [];
              ids.push(planService.outboundTripId);
              if(planService.returnTripId){
                ids.push(planService.returnTripId);
              }

              angular.forEach(ids, function(id, index) {
                emailRequestPart.itineraries.push({"trip_id":planService.searchResults.trip_id,"itinerary_id":id})
              });
              emailRequest.email_itineraries.push(emailRequestPart)
            });
            var emailPromise = planService.emailItineraries($http, emailRequest);
            emailPromise.error(function(data) {
              bootbox.alert("An error occurred on the server, your email was not sent.");
            });
            flash.setMessage('Your email was sent');
          }else{
            $scope.invalidEmail = true;
          }
        }
      };

      $scope.prepareTrip = function(){
        $scope.walkItineraries = planService.walkItineraries;
        $scope.purpose = planService.itineraryRequestObject.trip_purpose;
      }

      $scope.selectWalkingTrip = function(){
        $scope.walkItineraries = planService.walkItineraries;
        var selectedItineraries = [];
        var tripId = planService.tripId;
        angular.forEach(planService.walkItineraries, function(itinerary, index) {
          selectedItineraries.push({"trip_id":tripId, "itinerary_id":itinerary.id});
        });

        var selectedItineraries = {"select_itineraries": selectedItineraries};
        var promise = planService.selectItineraries($http, selectedItineraries);
        promise.then(function(result) {
          $scope.selected = true;
        });
      }

      $scope.prepareTrip();

    }
  ]);
