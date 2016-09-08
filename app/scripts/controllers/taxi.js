'use strict';

angular.module('applyMyRideApp')
  .controller('TaxiController', ['$scope','$routeParams', '$location', 'flash', 'planService', '$http',
    function ($scope, $routeParams, $location, flash, planService, $http) {


      //pull the selected taxi out from selected taxi option, or send to plan again
      if( planService.selectedTaxiOption >= 0 ){
        $scope.taxiItinerary = planService.taxiItineraries[ (planService.selectedTaxiOption||0) ];
      }else{
        $location.path("/plan/where");
      }


    }
  ]);
