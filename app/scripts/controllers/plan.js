'use strict';

var app = angular.module('applyMyRideApp');

app.controller('PlanController', ['$scope', '$http','$routeParams', '$location', 'planService', 'flash', 'usSpinnerService', '$q', 'LocationSearch', 'localStorageService', 'ipCookie',

function($scope, $http, $routeParams, $location, planService, flash, usSpinnerService, $q, LocationSearch, localStorageService, ipCookie) {

  $scope.minReturnDate = new Date();

  $scope.marker = null;
  $scope.locations = [];
  $scope.placeIds = [];
  $scope.showConfirmLocationMap = false;
  $scope.mapOptions = {
    zoom: 17,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  $scope.step = $routeParams.step;
  $scope.disableNext = false;
  $scope.showUndo = false;
  $scope.showNext = true;
  $scope.showBack = false;
  $scope.planService = planService;
  $scope.fromDate = new Date();
  $scope.returnDate = new Date();

  $scope.openCalendar = function($event) {
    $event.preventDefault();
    $event.stopPropagation();
    $scope.opened = true;
  };

  $scope.setNoReturnTrip = function(){
    planService.returnDate = null;
    planService.returnTime = null;
    $location.path('/plan/confirm');
  }

  $scope.dateOptions = {
    formatYear: 'yy',
    startingDay: 0,
    showWeeks: false,
    showButtonBar: false
  };

  $scope.getFromDateString = function(){
    return $scope.getDateString(planService.fromDate, planService.fromTime, planService.fromTimeType)
  }

  $scope.getOtherRidersString = function(){
    var otherRidersString = '';
    if(planService.hasEscort){
      otherRidersString += '1 escort';
    }
    if(planService.numberOfCompanions){
      if(otherRidersString.length > 0){
        otherRidersString += ', ';
      }
      otherRidersString += planService.numberOfCompanions + ' companion';
      if(planService.numberOfCompanions > 1){
        otherRidersString += 's';
      }
    }
    if(planService.numberOfFamily){
      if(otherRidersString.length > 0){
        otherRidersString += ', ';
      }
      otherRidersString += planService.numberOfFamily + ' family member';
      if(planService.numberOfFamily > 1){
        otherRidersString += 's';
      }
    }
    return otherRidersString;
  }

  $scope.getReturnDateString = function(){
    return $scope.getDateString(planService.returnDate, planService.returnTime, planService.returnTimeType )
  }

  $scope.getDateString = function(date, time, type){
    var fromDateString = null
    if(date){
      fromDateString = moment(date).format('M/D/YYYY');
      if(type == 'asap'){
        fromDateString += " - As soon as possible"
      }else if(type == 'depart'){
        fromDateString += " - Depart at " + moment(time).format('h:mm a');
      }else if(type == 'arrive'){
        fromDateString += " - Arrive at " + moment(time).format('h:mm a');
      }
    }
    return fromDateString;
  }

  switch($routeParams.step) {
    case undefined:
    case 'start_current':
      $scope.showNext = false;
      break;
    case 'from':
      if(planService.from != null){
        $scope.fromDetails = planService.fromDetails;
        $scope.fromChoice = planService.from;
      }
      $scope.showNext = false;
      break;
    case 'fromDate':
      $scope.minDate = new Date();
      if(planService.fromDate != null){
        $scope.fromDate = planService.fromDate;
      }
      $scope.disableNext = false;
      break;
    case 'fromTime':
      if(planService.fromTime != null){
        $scope.fromTime = planService.fromTime;
      }else{
        $scope.fromTime = new Date();
      }
      $scope.disableNext = false;
      break;
    case 'to':
      if(planService.to != null){
        $scope.toChoice = planService.to;
        $scope.toDetails = planService.toDetails;
      }
      $scope.showNext = false;
      break;
    case 'returnDate':

      if(planService.returnDate != null){
        $scope.returnDate = planService.returnDate;
      }else{
        $scope.returnDate = planService.fromDate;
      }
      $scope.minReturnDate = planService.fromDate
      $scope.disableNext = false;
      break;
    case 'returnTime':
      if(planService.returnTime != null){
        $scope.returnTime = planService.returnTime;
      }else{
        $scope.returnTime = new Date();
      }
      $scope.disableNext = false;
      break;
    case 'purpose':
      planService.getTripPurposes($scope, $http);
      planService.purposes = $scope.purposes;
      $scope.showNext = false;
      break;
    case 'confirm':
      planService.prepareConfirmationPage($scope);
      $scope.showNext = false;
      break;
    case 'needReturnTrip':
      $scope.showNext = false;
      break;
    case 'fromTimeType':
      var fromDate = planService.fromDate;
      var now = moment().startOf('day'); ;
      var dayDiff = now.diff(fromDate, 'days');
      if(Math.abs(dayDiff) < 1){
        $scope.showAsap = true;
      }
      $scope.fromTimeType = 'arrive';
      planService.fromTimeType = 'arrive';
      $scope.fromTime = new Date();
      $scope.fromTime.setHours($scope.fromTime.getHours() + 2);
      $scope.showNext = true;
      break;
    case 'returnTimeType':
      var fromDate = planService.fromDate;
      var returnDate = planService.returnDate;
      if(planService.returnTime != null){
        $scope.returnTime = planService.returnTime;
      }else{
        if(moment(fromDate).format('M/D/YYYY') == moment(returnDate).format('M/D/YYYY')) {
          var fromTimeType = planService.fromTimeType;
          var fromTime = planService.fromTime
          if(fromTimeType == 'asap'){
            $scope.returnTime = new Date();
            $scope.returnTime.setHours($scope.returnTime.getHours() + 4);
          } else if(fromTimeType == 'depart'){
            $scope.returnTime = new Date(fromTime);
            $scope.returnTime.setHours($scope.returnTime.getHours() + 4);
          } else if(fromTimeType == 'arrive'){
            $scope.returnTime = new Date(fromTime);
            $scope.returnTime.setHours($scope.returnTime.getHours() + 2);
          }
        }else{
          $scope.returnTime = new Date();
        }
      }
      $scope.disableNext = false;
      $scope.returnTimeType = 'arrive';
      $scope.showNext = true;
      break;
    case 'from_confirm':
      if(planService.from == null){
        $location.path("/plan/fromDate");
        $scope.step = 'fromDate';
      }
      $scope.showNext = false;
      break;
    case 'list_itineraries':
      if($routeParams.test){
        $http.get('data/bookingresult.json').
          success(function(data) {
            planService.itineraryRequestObject = data.itinerary_request;
            planService.searchResults = data.itinerary_response;
            planService.booking_request = data.booking_request;
            planService.booking_results = data.booking_response.booking_results;
            planService.prepareTripSearchResultsPage();
            $scope.fare_info = planService.fare_info;
            $scope.paratransitItineraries = planService.paratransitItineraries;
            $scope.walkItineraries = planService.walkItineraries;
            $scope.transitItineraries = planService.transitItineraries;
            $scope.transitInfos = planService.transitInfos;
            $scope.noresults = false;
            if($scope.paratransitItineraries.length < 1 && $scope.transitItineraries.length < 1 && $scope.walkItineraries.length < 1){
              $scope.noresults = true;
            }else if($scope.paratransitItineraries.length < 1 && $scope.transitItineraries.length < 1 && $scope.walkItineraries.length > 0){
              $location.path("/plan/alternative_options");
              $scope.step = 'alternative_options';
            }else if($scope.walkItineraries.length > 0){
              $scope.showAlternativeOption = true;
            }
          });
      }else{
        planService.prepareTripSearchResultsPage();
        $scope.fare_info = planService.fare_info;
        $scope.paratransitItineraries = planService.paratransitItineraries;
        $scope.walkItineraries = planService.walkItineraries;
        $scope.transitItineraries = planService.transitItineraries;
        $scope.transitInfos = planService.transitInfos;
        $scope.noresults = false;
        if($scope.paratransitItineraries.length < 1 && $scope.transitItineraries.length < 1 && $scope.walkItineraries.length < 1){
          $scope.noresults = true;
        }else if($scope.paratransitItineraries.length < 1 && $scope.transitItineraries.length < 1 && $scope.walkItineraries.length > 0){
          $location.path("/plan/alternative_options");
          $scope.step = 'alternative_options';
        }else if($scope.walkItineraries.length > 0){
          $scope.showAlternativeOption = true;
        }
      }
      $scope.showNext = false;
      break;
    case 'discounts':
      var basefareIndex = null;
      angular.forEach(planService.paratransitItineraries[0].discounts, function(discount, index) {
        if(discount.base_fare && discount.base_fare == true){
          basefareIndex = index;
        }
        discount.fare = new Number(discount.fare).toFixed(2);
      });
      if(basefareIndex){
        var basefare = discounts[basefareIndex];
        planService.paratransitItineraries[0].discounts.splice(basefareIndex, 1);
        planService.paratransitItineraries[0].discounts.unshift(basefare);
      }
      $scope.paratransitItinerary = planService.paratransitItineraries[0];
      $scope.showNext = false;
      break;
    case 'book_shared_ride':
      $scope.showNext = false;
      break;
    case 'alternative_options':
      $scope.walkItineraries = planService.walkItineraries;
      $scope.showNext = false;
      break;
    case 'my_rides':
      planService.getRides($http, $scope, ipCookie);
      $scope.hideButtonBar = true;
      break;
    case 'sharedride_options_1':
      $scope.showNext = false;
      break;
    case 'sharedride_options_2':
      $scope.questionCodes = $.map(planService.paratransitItinerary.prebooking_questions, function(value, key) {
        return value.code;
      });
      $scope.showNext = true;
      $scope.disableNext = false;
      break;
    case 'sharedride_options_3':
      $scope.driverInstructions = planService.driverInstructions;
      break;
    default:

      break;
  }

  $scope.next = function() {
    if($scope.disableNext)
      return;
    switch($scope.step) {
      case 'fromDate':
        planService.fromDate = $scope.fromDate;
        $location.path('/plan/fromTimeType');
        break;
      case 'fromTimeType':
        planService.fromTime = $scope.fromTime;
        planService.fromTimeType = $scope.fromTimeType;
        $location.path('/plan/start_current');
        break;
      case 'from':
        $location.path('/plan/to');
        break;
      case 'from_confirm':
        $location.path('/plan/to');
        break;
      case 'to':
        $location.path('/plan/purpose');
        break;
      case 'needReturnTrip':
        $location.path('/plan/returnDate');
        break;
      case 'returnDate':
        planService.returnDate = $scope.returnDate;
        $location.path('/plan/returnTimeType');
        break;
      case 'returnTimeType':
        planService.returnTime = $scope.returnTime;
        planService.returnTimeType = $scope.returnTimeType;
        $location.path('/plan/confirm');
        break;
      case 'confirm':
        usSpinnerService.spin('spinner-1');
        var promise = planService.postItineraryRequest($http);
        promise.
          success(function(result) {
            planService.searchResults = result;
            $location.path('/plan/list_itineraries');
          }).
          error(function(result) {
            bootbox.alert("An error occured on the server, please retry your search or try again later.");
            usSpinnerService.stop('spinner-1');
          });
        break;
      case 'sharedride_options_2':
        planService.hasEscort = $scope.hasEscort;
        planService.numberOfCompanions = $scope.numberOfCompanions;
        planService.numberOfFamily = $scope.numberOfFamily;
        $location.path('/plan/sharedride_options_3');
        break;
      case 'sharedride_options_3':
        planService.driverInstructions = $scope.driverInstructions;
        $location.path('/plan/book_shared_ride');
        break;
      case 'book_shared_ride':
        usSpinnerService.spin('spinner-1');
        var promise = planService.bookSharedRide($http);
        promise.then(function(result) {
          planService.booking_results = result.data.booking_results;
          $location.path('/paratransit/confirm_shared_ride');
        });
        break;
    }
  };

  $scope.specifyTripPurpose = function(purpose){
    planService.purpose = purpose;
    $location.path("/plan/needReturnTrip");
    $scope.step = 'needReturnTrip';
  }

  $scope.specifyFromTimeType = function(type){
    $scope.fromTimeType = type;
    planService.fromTimeType = type;
    if(type == 'asap'){
      $scope.next();
    }
  }

  $scope.specifyReturnTimeType = function(type){
    $scope.returnTimeType = type;
    planService.returnTimeType = type;
  }

  $scope.clearFrom = function(){
    $scope.fromChoice = null;
  }

  $scope.clearTo = function(){
    $scope.toChoice = null;
  }

  $scope.getLocations = function(typed){
    if(typed){
      var config = planService.getHeaders();
      $scope.suggestions = LocationSearch.getLocations(typed, config);
      $scope.suggestions.then(function(data){

        var choices = [];
        $scope.placeLabels = [];
        $scope.placeIds = [];
        $scope.placeAddresses = [];

        var savedPlaceData = data[1].savedplaces;
        if(savedPlaceData && savedPlaceData.length > 0){
          choices.push({label:'Saved Places', option: false});
          angular.forEach(savedPlaceData, function(savedPlace, index) {
            choices.push({label:savedPlace, option: true});
          }, choices);
          $scope.placeLabels = $scope.placeLabels.concat(savedPlaceData);
          $scope.placeIds = $scope.placeIds.concat(data[1].placeIds);
          $scope.placeAddresses = $scope.placeAddresses.concat(data[1].savedplaceaddresses);
        }


        var recentSearchData = data[2].recentsearches;
        if(recentSearchData && recentSearchData.length > 0){
          choices.push({label:'Recently Searched', option: false});
          angular.forEach(recentSearchData, function(recentSearch, index) {
            choices.push({label:recentSearch, option: true});
          }, choices);
          $scope.placeLabels = $scope.placeLabels.concat(recentSearchData);
          $scope.placeIds = $scope.placeIds.concat(data[2].placeIds);
          $scope.placeAddresses = $scope.placeAddresses.concat(recentSearchData);
        }

        var googlePlaceData = data[0].googleplaces;
        if(googlePlaceData.length > 0){
          choices.push({label:'Suggestions', option: false});
          angular.forEach(googlePlaceData, function(googleplace, index) {
            choices.push({label:googleplace, option: true});
          }, choices);
          $scope.placeLabels = $scope.placeLabels.concat(googlePlaceData);
          $scope.placeIds = $scope.placeIds.concat(data[0].placeIds);
          $scope.placeAddresses = $scope.placeAddresses.concat(googlePlaceData);
        }

        $scope.locations = choices;
      });
    }
  }

  $scope.selectPlace = function(place){
    var map;
    if($routeParams.step == 'from'){
      map = $scope.fromLocationMap;
    }else if($routeParams.step == 'to'){
      map = $scope.toLocationMap;
    }
    var placeIdPromise = $q.defer();
    var placeId = $scope.placeIds[$scope.placeLabels.indexOf(place)];
    if(placeId) {
      placeIdPromise.resolve(placeId);
    }else{
      var labelIndex = $scope.placeLabels.indexOf(place);
      var address = $scope.placeAddresses[labelIndex];
      var autocompleteService = new google.maps.places.AutocompleteService();
      autocompleteService.getPlacePredictions(
        {
          input: address,
          offset: 0,
          componentRestrictions: {country: 'us'}
        }, function(list, status) {
          if(status == "ZERO_RESULTS" || list == null){
            bootbox.alert("We were unable to geocode the address you selected.");
          }else{
            var placeId = list[0].place_id;
            placeIdPromise.resolve(placeId);
          }
        });
    }

    placeIdPromise.promise.then(function(placeId) {
      var placesService = new google.maps.places.PlacesService(map);
      placesService.getDetails( { 'placeId': placeId}, function(result, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          var recentSearches = localStorageService.get('recentSearches');
          if(!recentSearches){
            recentSearches = {};
          }
          if (typeof(recentSearches[place]) == 'undefined'){
            recentSearches[place] = result;
            localStorageService.set('recentSearches', JSON.stringify(recentSearches));
          }

          //verify the location has a street address
          var datatypes = [];
          angular.forEach(result.address_components, function(component, index) {
            angular.forEach(component.types, function(type, index) {
              datatypes.push(type)
            });
          });

          if(datatypes.indexOf('street_number') < 0 || datatypes.indexOf('route') < 0){
            bootbox.alert("The location you selected does not have a valid street address, please select another location.");
            return;
          }

          if($routeParams.step == 'from'){
            planService.fromDetails = result;
          }else if($routeParams.step == 'to'){
            planService.toDetails = result;
          }

          if($scope.marker){
            $scope.marker.setMap(null);
          }

          $scope.showMap = true;
          $scope.showUndo = true;
          $scope.disableNext = false;
          $scope.showNext = true;
          $scope.$apply();

          google.maps.event.trigger(map, 'resize');


          map.setCenter(result.geometry.location);
          $scope.marker = new google.maps.Marker({
            map: map,
            position: result.geometry.location,
            animation: google.maps.Animation.DROP
          });

          var serviceAreaPromise = planService.checkServiceArea($http, result);
          serviceAreaPromise.
            success(function(serviceAreaResult) {
              if(serviceAreaResult.result == true){
                if($scope.marker){
                  $scope.marker.setMap(null);
                }

                $scope.showMap = true;
                $scope.showUndo = true;
                $scope.disableNext = false;
                $scope.showNext = true;

                google.maps.event.trigger(map, 'resize');
                var location = result.geometry.location;//$.extend(true, [], result.geometry.location); //new google.maps.LatLng(result.geometry.location.lat, result.geometry.location.lng);
                delete location.lat;
                delete location.lng;
                map.setCenter(location);

                $scope.marker = new google.maps.Marker({
                  map: map,
                  position: location,
                  animation: google.maps.Animation.DROP
                });
              }else{
                $scope.showMap = false;
                $scope.showNext = false;
                bootbox.alert("The location you selected is outside the service area.");
              }
            }).
            error(function(serviceAreaResult) {
              bootbox.alert("An error occured on the server, please retry your search or try again later.");
            });

        } else {
          alert('Geocode was not successful for the following reason: ' + status);
        }
      });
    })
  }

  $scope.getCurrentLocation = function() {
    usSpinnerService.spin('spinner-1');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition($scope.setOriginLocation, $scope.showError);
    } else {
      $scope.error = "Geolocation is not supported by this browser.";
    }
  };

  $scope.showError = function (error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        $scope.error = "User denied the request for Geolocation."
        break;
      case error.POSITION_UNAVAILABLE:
        $scope.error = "Location information is unavailable."
        break;
      case error.TIMEOUT:
        $scope.error = "The request to get user location timed out."
        break;
      case error.UNKNOWN_ERROR:
        $scope.error = "An unknown error occurred."
        break;
    }
    $scope.$apply();
  }

  $scope.setOriginLocation = function (position) {
    var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({'latLng': latlng}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (results[0]) {
          var result = results[0];

          var serviceAreaPromise = planService.checkServiceArea($http, result);
          serviceAreaPromise.
            success(function(serviceAreaResult) {
              if(serviceAreaResult.result == true){
                planService.from = result.formatted_address;
                planService.fromDetails = result;
                $location.path("/plan/from_confirm");
                $scope.step = 'from_confirm';
                $scope.$apply();
              }else{
                $scope.showMap = false;
                $scope.showNext = false;
                bootbox.alert("You are currently outside the service area.  To plan a trip, enter a starting location within the service area.");
                $location.path("/plan/from");
                $scope.step = 'from';
              }
            }).
            error(function(serviceAreaResult) {
              bootbox.alert("An error occured on the server, please retry your search or try again later.");
            });
        }
      }
    })
  }

  $scope.specifySharedRideCompanion = function(hasCompanion) {
    if(hasCompanion == 'true'){
      $location.path("/plan/sharedride_options_2");
      $scope.step = 'sharedride_options_2';
    }else{
      $location.path("/plan/sharedride_options_3");
      $scope.step = 'sharedride_options_3';
    }
  }

  $scope.selectSharedRide = function() {
    $location.path("/plan/sharedride_options_1");
    $scope.step = 'sharedride_options_1';
  }

  $scope.overrideCurrentLocation = function() {
    $scope.restartPlan();
    $location.path("/plan/from");
    $scope.step = 'from';
  };

  $scope.restartPlan = function() {
    planService.from = null;
    planService.fromDetails = null;
  };

  $scope.$watch('fromDate', function(n) {
      if($scope.step == 'fromDate'){
        if (n) {
          var now = moment().startOf('day');
          var datediff = now.diff(n, 'days');
          if(datediff < 1){
            $scope.fromDate = n;
            $scope.disableNext = false;
          }else{
            $scope.disableNext = true;
            planService.fromDate = null;
          }
        }else{
          $scope.disableNext = true;
          planService.fromDate = null;
        }
      }
    }
  );

  $scope.$watch('returnDate', function(n) {
      if($scope.step == 'returnDate'){
        if (n) {
          var now = moment().startOf('day');
          var datediff = now.diff(n, 'days');
          if(datediff < 1){
            $scope.returnDate = n;
            $scope.disableNext = false;
          }else{
            planService.returnDate = null;
            $scope.disableNext = true;
          }
        }else{
          planService.returnDate = null;
          $scope.disableNext = true;
        }
      }
    }
  );

  $scope.$watch('fromChoice', function(n) {
      if($scope.step == 'from'){
        planService.from = n;
        $scope.showMap = false;
        if(!n){
          $scope.showNext = false;
        }
      }
    }
  );

  $scope.$watch('fromDetails', function(n) {
      if($scope.step == 'from'){
        if (n) {
          $scope.showNext = true;
        }else{
          $scope.showNext = false;
        }
      }
    }
  );

  $scope.$watch('toChoice', function(n) {
      if($scope.step == 'to'){
        planService.to = n;
        $scope.showMap = false;
        if(!n){
          $scope.showNext = false;
        }
      }
    }
  );

  $scope.$watch('toDetails', function(n) {
      if($scope.step == 'to'){
        if (n) {
          $scope.showNext = true;
        }else{
          $scope.showNext = false;
        }
      }
    }
  );

  $scope.$watch('fromTime', function(n) {
      if($scope.step == 'fromTimeType'){
        if (n) {
          $scope.disableNext = false;
        }else{
          $scope.disableNext = true;  //not a valid time
        }
      }
    }
  );

  $scope.$watch('returnTime', function(n) {
      if($scope.step == 'returnTime'){
        if (n) {

          var fromDate = planService.fromDate;
          var fromTime = planService.fromTime;
          if(fromTime == null){
            fromTime = new Date();
          }
          fromTime.setYear(fromDate.getFullYear());
          fromTime.setMonth(fromDate.getMonth());
          fromTime.setDate(fromDate.getDate());
          var returnTime = $scope.returnTime;
          var returnDate = planService.returnDate;

          var now = moment(returnDate).startOf('day'); ;
          var dayDiff = now.diff(fromDate, 'days');
          if(Math.abs(dayDiff) < 1){
            //departing and returning on the same day, is the return time after departure?
            returnTime.setYear(returnDate.getFullYear());
            returnTime.setMonth(returnDate.getMonth());
            returnTime.setDate(returnDate.getDate());

            if((returnTime - fromTime) / 1000 / 60 < -1){
              $scope.disableNext = true;
            } else {
              $scope.disableNext = false;
            }
          }
        }else{
          $scope.disableNext = true;  //not a valid time
        }
      }
    }
  );

  $scope.$watch('fromLocationMap', function(map) {
    if(map && $routeParams.step == 'from' && planService.from){
        $scope.fromChoice = planService.from;
        var result = planService.fromDetails;
        delete result.geometry.location.lat;
        delete result.geometry.location.lng;
        if($scope.marker){
          $scope.marker.setMap(null);
        }
        map.setCenter(result.geometry.location);
        $scope.marker = new google.maps.Marker({
          map: map,
          position: result.geometry.location,
          animation: google.maps.Animation.DROP
        });
        $scope.showMap = true;
        $scope.disableNext = false;
        $scope.showNext = true;
        $scope.showUndo = true;
    }
  })

  $scope.$watch('toLocationMap', function(map) {
    if(map && $routeParams.step == 'to' && planService.to){
      $scope.toChoice = planService.to;
      var result = planService.toDetails;
      delete result.geometry.location.lat;
      delete result.geometry.location.lng;
      if($scope.marker){
        $scope.marker.setMap(null);
      }
      map.setCenter(result.geometry.location);
      $scope.marker = new google.maps.Marker({
        map: map,
        position: result.geometry.location,
        animation: google.maps.Animation.DROP
      });
      $scope.showMap = true;
      $scope.disableNext = false;
      $scope.showNext = true;
      $scope.showUndo = true;
    }
  })


  $scope.$watch('confirmFromLocationMap', function(n) {
      if (n) {
        if(planService.fromDetails && $scope.step == 'from_confirm'){
          var result = planService.fromDetails;
          delete result.geometry.location.lat;
          delete result.geometry.location.lng;
          n.setCenter(result.geometry.location);
          if($scope.marker){
            $scope.marker.setMap(null);
          }
          $scope.marker = new google.maps.Marker({
            map: n,
            position: result.geometry.location,
            animation: google.maps.Animation.DROP
          });
          var bounds = new google.maps.LatLngBounds(result.geometry.location, result.geometry.location);

          var contentString = '' + result.name;
          var infoWindow = new google.maps.InfoWindow({content: contentString, position: result.geometry.location});
          //infoWindow.open(map);

          google.maps.event.trigger(n, 'resize');
          n.setCenter(result.geometry.location);
          $scope.showMap = true;
          $scope.showConfirmLocationMap = true;
        }
      }
    }
  );
}
]);

