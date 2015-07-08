'use strict';

angular.module('applyMyRideApp')
  .controller('ParatransitController', ['$scope','$routeParams', '$location', 'flash', 'planService', '$http',
    function ($scope, $routeParams, $location, flash, planService, $http) {

      $scope.location = $location.path();
      $scope.disableNext = true;
      $scope.tripid = $routeParams.tripid;
      $scope.showDiv = {};

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
          if(!result.booked  == true){
            $scope.booking_failed = true;
          }
        });

        $scope.booking_results = planService.booking_results;
        $scope.paratransitItineraries = planService.paratransitItineraries;

      }

      if($routeParams.test){
        $http.get('data/bookingresult.json').
          success(function(data) {
            planService.itineraryRequestObject = data.itinerary_request;
            planService.searchResults = data.itinerary_response;
            planService.booking_request = data.booking_request;
            planService.booking_results = data.booking_response.booking_results;
            planService.prepareTripSearchResultsPage(0);
            $scope.prepareTrip();
          });
      }else{
        $scope.prepareTrip();
      }
    }
  ]);
