'use strict';

angular.module('applyMyRideApp')
  .controller('ParatransitController', ['$scope','$routeParams', '$location', 'flash', 'planService', '$http',
    function ($scope, $routeParams, $location, flash, planService, $http) {

        $scope.location = $location.path();
        $scope.disableNext = true;
        $scope.tripid = $routeParams.tripid;
        $scope.showDiv = {};
        $scope.success = true;

      $scope.prepareTrip = function(){

        angular.forEach(planService.paratransitItineraries, function(result, index) {
          result.wait_startDesc = moment(result.wait_start).format('h:mm a');
          result.wait_endDesc = moment(result.wait_end).format('h:mm a');
          result.arrivalDesc = moment(result.arrival).format('h:mm a');
          if(!result.booked){
            $scope.success = false;
          }
        });
        $scope.purpose = planService.itineraryRequestObject.trip_purpose;
        angular.forEach(planService.booking_results, function(result, index) {
          result.wait_startDesc = moment(result.wait_start).format('h:mm a');
          result.wait_endDesc = moment(result.wait_end).format('h:mm a');
          result.arrivalDesc = moment(result.arrival).format('h:mm a');
          if(!result.booked){
            $scope.success = false;
          }
        });
        $scope.booking_result = planService.booking_results[0];
      }

      if($routeParams.test){
        $http.get('data/itineraries.json').
          success(function(data) {
            planService.searchResults = data;
            planService.prepareTripSearchResultsPage(0);
            $scope.fare_info = planService.fare_info;
            $scope.itinerary = planService.paratransitItinerary;
            $http.get('data/bookingresult.json').
              success(function(data) {
                planService.booking_results = data.booking_results;
                planService.itineraryRequestObject = {};
                planService.itineraryRequestObject.purpose = 'Medical';
                $scope.prepareTrip();
              });
          });
      }else{
        $scope.prepareTrip();
      }
    }
  ]);
