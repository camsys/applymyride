'use strict';

var app = angular.module('applyMyRideApp');

app.controller('PlanController', ['$scope', '$http','$routeParams', '$location', 'planService', 'util', 'flash', 'usSpinnerService', 'debounce', '$q', 'LocationSearch', 'localStorageService', 'ipCookie', '$timeout', '$window', '$filter',
  function($scope, $http, $routeParams, $location, planService, util, flash, usSpinnerService, debounce, $q, LocationSearch, localStorageService, ipCookie, $timeout, $window, $filter) {
    // This variable exists to track whether or not we're still on initial focus with a default input
    let isOnInitFocus = true
    var currentLocationLabel = "Current Location";
    var urlPrefix = '//' + APIHOST + '/';

    var eightAm = new Date();
    var countryFilter = $filter('noCountry');
    var checkShowMap = function(){
      if(Object.keys( $scope.toFromMarkers ).length == 0){
        $scope.showMap = false;
      }
    }
    eightAm.setSeconds(0);
    eightAm.setMinutes(0);
    eightAm.setHours(8);
    eightAm.setDate( eightAm.getDate() - 1 );
    $scope.minReturnDate = new Date();
    $scope.locationClicked = true;
    $scope.marker = null;
    $scope.toFromMarkers = {};
    $scope.toFromIcons={'to' : '//maps.google.com/mapfiles/markerB.png',
                        'from' : '//maps.google.com/mapfiles/marker_greenA.png' };
    // Disable Swap Address determines when to disable the swap address inputs button
    $scope.disableSwapAddressButton = false
    /**
     * NOTE: THE FMR CODEBASE HANDLES ASYNCHRONOUS CODE VERY BADLY
     * - you'll see setTimeout in the codebase to handle asynchronous actions a lot
     * ...and that's generally not the correct way to handle async actions
     * - Ideally we'd return Promises and use then chaining to handle async code and callbacks
    */
    // have 2 separate locations suggestions arrays for each field rather than having a single locations array
    $scope.fromLocations = [];
    $scope.toLocations = [];
    $scope.placeIds = [];
    $scope.showConfirmLocationMap = false;
    // Desktop/ global map config
    // All other map options get their default values
    $scope.mapOptions = {
      zoom: 11,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    //disable some map options if mobile user
    if(util.isMobile()){
      $scope.mapOptions.scrollwheel = false; // Disable Scroll wheel
      $scope.mapOptions.navigationControl = false; // Config option doesn't exist anymore?
      $scope.mapOptions.mapTypeControl = false; // Disable Map Type controls
      $scope.mapOptions.scaleControl = false; // Disable the Scale Control
    }
    $scope.step = $routeParams.step;
    $scope.disableNext = false;
    $scope.showNext = true;
    $scope.showEmail = false;
    $scope.invalidEmail = false;
    $scope.showBack = false;
    $scope.planService = planService;
    $scope.fromMoment = moment( planService.fromDate || eightAm );
    $scope.returnMoment = null;
    $scope.serviceHours = null;
    $scope.fromTime = '';
    if(planService.fromDate && planService.returnDate){
      $scope.howLongMinutes = moment(planService.returnDate).diff( planService.fromDate, 'minutes');
      $scope.howLong = {minutes: ''+ $scope.howLongMinutes };
    }else{
      $scope.howLong = {minutes:'0'};
    }
    $scope.howLongOptions = [];
    $scope.fromDate = new Date();
    $scope.returnDate = new Date();
    $scope.showMap = false;
    $scope.location = $location.path();
    $scope.errors = {};
    $scope.showAllPurposes = false;
    $scope.backToConfirm = planService.backToConfirm;
    $scope.loggedIn = !!planService.email;
    $scope.tripId = planService.tripId

    // $scope.toDefault = countryFilter( localStorage.getItem('last_destination') || '');
    // $scope.to = countryFilter( planService.to || '');
    // $scope.fromDefault = countryFilter( localStorage.getItem('last_origin') || '' );
    // $scope.from = countryFilter( planService.from || '' );
    // Leave to and from blank for now until we can figure out why the default places sometimes fail to book
    $scope.toDefault = '';
    $scope.to = '';
    $scope.fromDefault = '';
    $scope.from = '';

    $scope.transitSaved = planService.transitSaved || false;
    $scope.transitCancelled = planService.transitCancelled || false;
    $scope.walkSaved = planService.walkSaved || false;
    $scope.walkCancelled = planService.walkCancelled || false;

    //plan/confirm bus options selected-tab placeholder
    $scope.selectedBusOption = planService.selectedBusOption || [0,0];
    if ($scope.step === 'transit') {
      planService.getUserNotificationDefaults($http).then(() => {
        $scope.fixedRouteReminderPrefs = planService.syncFixedRouteNotifications(null, new Date(planService.fromDate))
      })
    }

    $scope.reset = function() {
      planService.reset();
      $location.path("/plan/where");
    };

    $scope.goPlanWhere = function(){
      planService.backToConfirm = true;
      $location.path('/plan/where');
    }
    $scope.goPlanWhen = function(){
      planService.backToConfirm = true;
      $location.path('/plan/when');
    }
    $scope.goPlanPurpose = function(){
      planService.backToConfirm = true;
      $location.path('/plan/purpose');
    }
    $scope.goViewTransitOptions = function(){
      $location.path('/plan/transit_details');
    }
    $scope.goViewTransit = function(departId, returnId){
      //get the transit depart/return ids using the selectedBusOption (current tabs)
      departId = $scope.transitInfos[0][ $scope.selectedBusOption[0] ].id;
      if( $scope.transitInfos[1] && $scope.transitInfos[1][ $scope.selectedBusOption[1] ] ){
        returnId = $scope.transitInfos[1][ $scope.selectedBusOption[1] ].id;
      }else{
        returnId = 0;
      }
      $location.path('/plan/transit/'+departId+'/'+returnId);
    }
    $scope.goViewTaxi = function(taxiOption){
      if(taxiOption > -1){
        planService.selectedTaxiOption = taxiOption;
      }else{
        planService.selectedTaxiOption = planService.selectedTaxiOption || 0;
      }
      $location.path('/taxi');
    }
    $scope.goViewUber = function(uberOption){
      if(uberOption > -1){
        planService.selectedUberOption = uberOption;
      }else{
        planService.selectedUberOption = planService.selectedUberOption || 0;
      }
      $location.path('/uber');
    }

    $scope.goPlanLogin = function(){
      $location.path('/');
    }

    $scope.goViewWalk = function(departId, returnId){
      $location.path('/plan/walk/'+departId+'/'+returnId);
    }

    $scope.updateReturnTime = function(o){
      if(!o){return;}
      var destinationDuration = parseInt(o.minutes);
      if(destinationDuration > 0){
        $scope.returnMoment = $scope.fromMoment.clone().add( destinationDuration, 'm' );
        planService.returnDate = $scope.returnMoment.toDate();
        planService.returnTime = $scope.returnMoment.toDate();
      }else{
        $scope.returnMoment = null;
        planService.returnDate = null;
        planService.returnTime = null;
      }
      planService.howLong = destinationDuration;
    }

    $scope.rebook = function($event, tab, index) {
      planService.rebookTrip = $scope.trips[tab][index];
      $scope.step = 'rebook';
      $location.path('/plan/rebook');
    };

    $scope.updateTransitTripReminders = function($event) {
      $event.preventDefault()
      // build new trip details object
      const oldNotifications = $scope.transitTripDetails || {}
      const tripDetails = {
        notification_preferences: {
          ...oldNotifications,
          fixed_route: $scope.fixedRouteReminderPrefs.reminders
        }
      }
      // grab trip id(s) and build update trip request object
      const updateTripRequest = {trip: planService.tripId, details: tripDetails}
      const planPromise = planService.updateTripDetails($http, updateTripRequest)
        planPromise.then(function(results) {
          $scope.transitTripDetails = results.data.trip[0].details.notification_preferences
          $scope.fixedRouteReminderPrefs = planService.syncFixedRouteNotifications($scope.transitTripDetails, new Date(planService.fromDate))
          bootbox.alert("Trip notification preferences updated!")
        })
    }

    $scope.cancelThisBusOrRailTrip = function() {
      usSpinnerService.spin('spinner-1');
      var cancelRequest = {bookingcancellation_request: []};
      var leg1, leg2;
      leg1 = {itinerary_id: planService.transitItineraries[0][ $scope.selectedBusOption[0] ].id};
      cancelRequest.bookingcancellation_request.push( leg1 );
      if(planService.fare_info.roundtrip){
        leg2 = {itinerary_id: planService.transitItineraries[1][ $scope.selectedBusOption[1] ].id};
        cancelRequest.bookingcancellation_request.push( leg2 );
      }
      var cancelPromise = planService.cancelTrip($http, cancelRequest)
      cancelPromise.error(function(data) {
        bootbox.alert("An error occurred, your trip was not cancelled.  Please call 1-844-PA4-RIDE for more information.");
        usSpinnerService.stop('spinner-1');
      });
      cancelPromise.success(function(data) {
        bootbox.alert('Your trip has been canceled. Be sure to cancel any other relevant trips.');
        ipCookie('rideCount', ipCookie('rideCount') - 1);
        $scope.transitSaved = false;
        $scope.transitCancelled = true;
        planService.transitSaved = false;
        planService.transitCancelled = true;
        usSpinnerService.stop('spinner-1');
      })
    }

    $scope.cancelThisWalkTrip = function() {
      usSpinnerService.spin('spinner-1');
      var cancelRequest = {bookingcancellation_request: []};
      var leg1, leg2;
      leg1 = {itinerary_id: planService.walkItineraries[0].id};
      cancelRequest.bookingcancellation_request.push( leg1 );
      if(planService.fare_info.roundtrip){
        leg2 = {itinerary_id: planService.walkItineraries[1].id};
        cancelRequest.bookingcancellation_request.push( leg2 );
      }
      var cancelPromise = planService.cancelTrip($http, cancelRequest)
      cancelPromise.error(function(data) {
        bootbox.alert("An error occurred, your trip was not cancelled.  Please call 1-844-PA4-RIDE for more information.");
        usSpinnerService.stop('spinner-1');
      });
      cancelPromise.success(function(data) {
        bootbox.alert('Your trip has been canceled. Be sure to cancel any other relevant trips.');
        ipCookie('rideCount', ipCookie('rideCount') - 1);
        $scope.walkSaved = false;
        $scope.walkCancelled = true;
        planService.walkSaved = false;
        planService.walkCancelled = true;
        usSpinnerService.stop('spinner-1');
      })
    }

    $scope.cancelTrip = function(){
      $scope.trip = planService.selectedTrip;
      var message = "Are you sure you want to cancel this ride?";

      if(planService.fare_info.roundtrip ||  $scope.outboundCancelled ||  $scope.returnCancelled){
        // NOTE: NOT RESTYLING THIS TO MATCH THE PDS AS THE PDS'S RADIO BUTTONS ARE MUCH MORE INVOLVED
        //... AND MAKING BOOTBOX MATCH THAT DOES NOT SEEM EASILY DOABLE
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
      } else {
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
            $scope.cancelCall('BOTH');
          }
        });
      }
    }

    $scope.cancelCall = function(result){
      var itinsToCancel;
      var successMessage;
      if(result == 'BOTH'){
        itinsToCancel = $scope.trip.itineraries;
        successMessage = 'Your trip has been canceled. Be sure to cancel any other relevant trips.';
      }
      else if(result == 'OUTBOUND'){
        itinsToCancel = [$scope.trip.itineraries[0]];
        successMessage = 'Your outbound trip has been cancelled.';
      } else if(result == 'RETURN'){
        itinsToCancel = [$scope.trip.itineraries[$scope.trip.itineraries.length - 1]];
        successMessage = 'Your return trip has been cancelled.';
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
        }else if(result == 'RETURN'){
          $scope.returnCancelled = true;
        }
      })
    }

    $scope.selectTrip = function($event, tab, index) {
      $event.stopPropagation();
      var trip = $scope.trips[tab][index];
      trip.tab = tab;
      planService.selectedTrip = trip;
      switch(trip.mode) {
        case 'mode_paratransit':
          break;
        case 'mode_transit':
          break;
        case 'mode_walk':
          break;
      }
      $location.path('/itinerary');
    };

    $scope.toggleEmail = function($event) {
      $scope.invalidEmail = false;
      $scope.showEmail = !$scope.showEmail;
      $event.stopPropagation();
    };

    $scope.sendEmail = function($event) {
      $event.stopPropagation();

      var emailString = $scope.emailString;

      if(emailString && planService.tripId){
        var result = planService.validateEmail(emailString);
        if(result == true){

          $scope.showEmail = false;

          var emailRequest = {};
          emailRequest.email_address = emailString;
          emailRequest.trip_id = planService.tripId;

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

    $scope.openCalendar = function($event) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.opened = true;
    };

    $scope.openReturnCalendar = function($event) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.openedReturn = true;
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
      var otherRiders = [];

      if (planService.hasEscort) {
        otherRiders.push('Approved escort');
      }

      if (planService.hasCompanions) {
        if (planService.numberOfCompanions === 1) {
          otherRiders.push(planService.numberOfCompanions + ' companion');
        } else {
          otherRiders.push(planService.numberOfCompanions + ' companions');
        }
      }

      return otherRiders.length > 0 ? otherRiders.join(', ') : 'No companions';
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

    $scope.next = function() {
      if($scope.disableNext){ return; }
      $scope.showNext = false;

      var params = {};
      // Where
      if (planService.fromDetails) {
        let {lat, lng} = planService.fromDetails.geometry.location;
        params.origin = {lat, lng};
      }
      if (planService.toDetails) {
        let {lat, lng} = planService.toDetails.geometry.location;
        params.destination = {lat, lng};
      }
      // Purpose
      if (planService.purpose) params.purpose = planService.purpose;
      // When
      if ($scope.fromMoment) params.date = $scope.fromMoment.format('dddd-MM-D');
      if ($scope.fromTimeUpdated) params.start_time = $scope.fromMoment.format('h:mm:ss');

      switch($scope.step) {
        case 'where':
          // delete params.purpose;
          delete params.date;
          delete params.start_time;

          planService.getTravelPatterns($http, params)
                      .then((res) => {
                        $location.path('/plan/purpose');
                      })
                      .catch((err) => {
                        $location.path('/plan/where/error');
                      });
          break;
        case 'purpose':
          delete params.date;
          delete params.start_time;

          planService.getTravelPatterns($http, params)
                      .then((res) => {
                        let travelPatterns = res.data.data.flat();
                        let dates = travelPatterns
                        .filter(pattern => pattern.to_calendar)
                        .map(pattern => Object.keys(pattern.to_calendar))
                        .flat();
                        let sorted_dates = [...new Set(dates)].sort();
                        if (sorted_dates.length === 0) {
                          $location.path('/plan/when/error');
                          return; 
                        }
                        let lastDay = moment(sorted_dates[sorted_dates.length-1]);
                        let months = [];
                        let monthOffset = moment(sorted_dates[0], "YYYY-MM-DD").month();
                        let weekIndex = 0;

                        sorted_dates.forEach((dateString) => {
                          let date = moment(dateString, "YYYY-MM-DD");
                          let monthIndex = (date.month()-monthOffset+12)%12;
                          let day = date.date();
                          let weekday = date.weekday();

                          if (months[monthIndex] === undefined) {
                            months[monthIndex] = {
                              name: date.format("MMMM"),
                              weeks: [],
                              key: date.format("YYYY-MM"),
                            };

                            weekIndex = 0;
                          }

                          let month = months[monthIndex];
                          if (month.weeks[weekIndex] === undefined) {
                            month.weeks[weekIndex] = new Array(7);
                            for(let i=0; i<weekday; i++) {
                              let tempDate = date.clone().subtract(weekday-i, "Days");
                              month.weeks[weekIndex][i] = {
                                key: tempDate.format("YYYY-MM-DD"),
                                day: tempDate.date()
                              };
                            }
                          }

                          let week = month.weeks[weekIndex]
                          week[weekday] = {
                            key: date.format("YYYY-MM-DD"),
                            day: day,
                            moment: date,
                            startTime: Math.min(...travelPatterns.map(pattern => pattern.to_calendar[dateString].start_time)),
                            endTime: Math.max(...travelPatterns.map(pattern => pattern.to_calendar[dateString].end_time))
                          }

                          if (day == date.daysInMonth() || date.isSame(lastDay)) {
                            for(let i=weekday+1; i<7; i++) {
                              let tempDate = date.clone().add(i-weekday, "Days");
                              week[i] = {
                                key: tempDate.format("YYYYMM-DD"),
                                day: tempDate.date()
                              };
                            }
                          }
                          if (weekday == 6) { weekIndex += 1; }
                        });

                        planService.months = months
                        $location.path('/plan/when');
                      })
                      .catch((err) => {
                        $location.path('/plan/purpose/error');
                      });
          break;
        case 'when':
          _bookTrip().success((sec) => {
            $scope.paratransitResult = planService.paratransitResult;
            $scope.hasEscort = false;
            $scope.hasCompanions = false;
            planService.prepareTripSearchResultsPage();
            $location.path('/plan/companions');
          }).error((err, statusCode) => {
            // When the backend throws a 409: Conflict error, it's because there's a conflict with
            // an already booked trip.
            if(statusCode === 409) {
              $location.path('/plan/overlapping_trip/error');
            } else {
              $location.path('/plan/when/error');
            }
          });
          break;
        case 'companions':
          // The Companions page doesn't use a "next" button
          // See "specifySharedRideCompanions"
          break;
        case 'assistant':
          planService.hasEscort = $scope.hasEscort;
          planService.hasCompanions = $scope.hasCompanions;

          if($scope.hasCompanions){
            planService.numberOfCompanions = $scope.numberOfCompanions || 0;
          }else{
            planService.numberOfCompanions = 0;
          }

          $location.path('/plan/instructions_for_driver');
          break;
        case 'instructions_for_driver':
          $scope.$watch('howLong', function(newVal) {
            // Show return leg note text box if selected howLong value is more than 0
            $scope.isRoundTrip = newVal && newVal.minutes > 0;
          });

          $scope.updateCounter1 = function() {
            $scope.counter1 = $scope.planService.driverInstructions ? $scope.planService.driverInstructions.length : 0;
          };

          $scope.updateCounter2 = function() {
            $scope.counter2 = $scope.planService.driverInstructionsReturn ? $scope.planService.driverInstructionsReturn.length : 0;
          };

          $scope.updateCounter1(); // Initialize counter1 immediately
          $scope.updateCounter2(); // Initialize counter2 immediately

          _bookTrip().success((sec) => {
            $scope.stopSpin();
            $scope.paratransitResult = planService.paratransitResult;
            planService.prepareTripSearchResultsPage();
            $location.path('/plan/summary');
          }).error((err) => {
            $scope.stopSpin();
            console.log(err);
            $location.path('/plan/instructions_for_driver/error');
          });
          break;
        case 'summary':
          let res = planService.bookSharedRide($http);
          $scope.startSpin();

          res.success((result) => {
            $scope.stopSpin();
            $location.path('/plan/my_rides');
          }).error((err) => {
            $scope.stopSpin();
            console.log(err);
            $location.path('/plan/summary/error');
          });
          break;
      }
      return;
    };

    $scope.back = function (step) {
      $scope.showNext = true;
      if (step === 'overlapping_trip') { step = 'when'; }

      if (step === undefined) {
        step = 'where';
        switch($scope.step) {
          case 'when':
            step = 'purpose';
            break;
          case 'companions':
            step = 'when';
            break;
          case 'assistant':
            step = 'companions';
            break;
          case 'instructions_for_driver':
            step = (planService.hasEscort || planService.numberOfCompanions > 0) ? 'assistant' : 'companions';
            break;
          case 'summary':
            step = 'instructions_for_driver';
            break;
        }
      }

      switch (step) {
        case 'where':
          delete planService.purpose;
          planService.resetPurpose();
        case 'purpose':
          $scope.fromMoment = null;
          $scope.fromTimeUpdated = null;
          planService.serviceOpen = null;
          planService.serviceClose = null;
          planService.resetWhen();
        case 'when':
          planService.resetOther();
        case 'companions':
          $scope.hasEscort = false;
          $scope.hasCompanions = false;
          delete $scope.numberOfCompanions;
          planService.resetCompanions();
        case 'assistant':
        case 'instructions_for_driver':
        case 'summary':
          break;
      }

      $location.path('/plan/'+step);
    };

    $scope.saveBusOrRailTrip = function(){
      var tripId = planService.tripId;
      var selectedItineraries = [{"trip_id":tripId, "itinerary_id":planService.transitInfos[0][ $scope.selectedBusOption[0] ].id}];

      if(planService.fare_info.roundtrip == true){
        selectedItineraries.push({"trip_id":tripId, "itinerary_id":planService.transitInfos[1][ $scope.selectedBusOption[1] ].id});
      }
      var selectedItineraries = {"select_itineraries": selectedItineraries};

      var promise = planService.selectItineraries($http, selectedItineraries);
      promise.then(function(result) {
        ipCookie('rideCount', ipCookie('rideCount') + 1);
        $scope.rideCount = ipCookie('rideCount');
        $scope.transitSaved = true;
        planService.transitSaved = true;
        bootbox.alert("Your trip has been saved", $scope.goViewTransit());
      });
    }

    $scope.saveWalkTrip = function(){
      var tripId = planService.tripId;
      var selectedItineraries = [{"trip_id":tripId, "itinerary_id":planService.walkItineraries[0].id}];

      if(planService.fare_info.roundtrip == true){
        selectedItineraries.push({"trip_id":tripId, "itinerary_id":planService.walkItineraries[1].id});
      }
      var selectedItineraries = {"select_itineraries": selectedItineraries};

      var promise = planService.selectItineraries($http, selectedItineraries);
      promise.then(function(result) {
        ipCookie('rideCount', ipCookie('rideCount') + 1);
        $scope.rideCount = ipCookie('rideCount');
        $scope.walkSaved = true;
        planService.walkSaved = true;
        var departId = planService.walkItineraries[0].id;
        var returnId = planService.walkItineraries[1] ? planService.walkItineraries[1].id : 0;
        bootbox.alert("Your trip has been saved", $scope.goViewWalk(departId, returnId));
      });
    }

    // Rebuild and recenter the map
    function rebuildRecenterMap() {
      const map = $scope.whereToMap
      const bounds = new google.maps.LatLngBounds();
      Object.values($scope.toFromMarkers).forEach(function(marker) {
        bounds.extend(marker.position);
      })
      map.setCenter(bounds.getCenter());
      map.fitBounds(bounds);
      if(Object.keys($scope.toFromMarkers).length === 1 ){
        map.setZoom(15);
      }
    }

    function _bookTrip () {
      try {
        planService.prepareSummaryPage($scope);
      } catch (e) {
        bootbox.alert('The origin/destination address does not have a city included. Please go back and use a different address with a city included.');
        return Promise.reject('Could not find a city in the location components.');
      }
      planService.transitResult = [];
      planService.paratransitResult = null;
      usSpinnerService.spin('spinner-1');

      let promise = planService.postItineraryRequest($http);
      return promise.
        success(function(result) {
          var i;
          for (i=0; i<result.itineraries.length; i+=1) {
            result.itineraries[i].origin = planService.getAddressDescriptionFromLocation(result.itineraries[i].start_location);
            result.itineraries[i].destination = planService.getAddressDescriptionFromLocation(result.itineraries[i].end_location);
            if (result.itineraries[i].returned_mode_code == "mode_paratransit") {
              // If the trip purpose is eligible based on the valid date range, allow booking a shared ride.
              // Otherwise, display no shared ride message.
              var allPurposes = [...planService.top_purposes || [], ...planService.purposes || []];
              var tripPurposesFiltered = allPurposes.filter(e => e.code == planService.itineraryRequestObject.trip_purpose);
              if (tripPurposesFiltered.length > 0) {
                var tripPurposeObj = tripPurposesFiltered[0]
                window.test = tripPurposeObj
                if (tripPurposeObj.valid_from && tripPurposeObj.valid_until &&
                  result.itineraries[i].start_time >= tripPurposeObj.valid_from &&
                  result.itineraries[i].start_time <= tripPurposeObj.valid_until) {
                    // Check both dates if available.
                    planService.paratransitResult = result.itineraries[i];
                } else if (tripPurposeObj.valid_from && result.itineraries[i].start_time >= tripPurposeObj.valid_from) {
                    // Otherwise check from date if available.
                    planService.paratransitResult = result.itineraries[i];
                } else if (!tripPurposeObj.valid_from && !tripPurposeObj.valid_until) {
                    // If date range is not available, assume it's eligible.
                    planService.paratransitResult = result.itineraries[i];
                }
              }
            } else {
              planService.transitResult.push(result.itineraries[i]);
            }
          }
          planService.searchResults = result;
          usSpinnerService.stop('spinner-1');
        }).
        error(function(err, statusCode) {
          if(statusCode == 500) {
            bootbox.alert("An error occured on the server, please retry your search or try again later.");
          }
          usSpinnerService.stop('spinner-1');
        });
    }

    // CONFIRM
    // remove backToConfirm? remove isEditTrip?
    /**
     * @param {string} purpose - A string representing the trip purpose
     * @param {boolean} [isEditTrip] - An optional arg that a dev can include
     * ...to specify that the function call is the result of a user editing the trip purpose
     * - In the context of fixing PAMF-709, we're passing in $scope.backToConfirm to check
     * ...to make sure that we're not editing the trip
     *
     * Regardless of whether or not the trip is being edited, the trip purpose is updated
     * - if we are editing a trip, we should call next() and let that function call handle rebooking the trip
     * ...in order to prevent the app from trying to double book an updated trip(and subsequently hanging)
     * - if we are not editing a trip, then book the trip as normal
     */
    $scope.specifyTripPurpose = function(purpose, isEditTrip){
      planService.purpose = purpose;
    }

    $scope.specifyFromTimeType = function(type){
      $scope.fromTimeType = type;
      if(type == 'asap'){
        $scope.fromTime = new Date();
        $scope.fromTime.setMinutes($scope.fromTime.getMinutes() + 10);
        $scope.next();
      }
    }

    $scope.specifyReturnTimeType = function(type){
      $scope.returnTimeType = type;
      planService.returnTimeType = type;
    }

    $scope.clearFrom = function(){
      //$scope.showMap = false;
      $scope.showNext = false;
      $scope.from = null;
    }

    $scope.clearTo = function(){
      //$scope.showMap = false;
      $scope.showNext = false;
      $scope.to = null;
    }

    $scope.getFromLocations = function(typed){
      $scope.getLocations(typed, true, 'from');
    }

    $scope.getToLocations = function(typed){
      $scope.getLocations(typed, false, 'to');
    }

    $scope.getLocations = function(typed, addCurrentLocation, toFrom){
      if(typed){
        // The user has typed something, don't let the Next button activate until they have selected a location.
        $scope.locationClicked = false;

        var config = planService.getHeaders();
        //if this is run before the last promise is resolved, abort the promise, start over.
        var getLocationsPromise = LocationSearch.getLocations(typed, config, planService.email != null);
        getLocationsPromise.then(function(data){

          $scope.placeLabels = [];
          $scope.placeIds = [];
          $scope.placeAddresses = [];
          $scope.poiData = [];

          var choices = [];

          if(addCurrentLocation && util.isMobile()){
            choices.push({label: currentLocationLabel, option: true})
          }

          // Saved Places: These are POIs from 1-Click
          var savedPlaceData = data[1].savedplaces;
          if(savedPlaceData && savedPlaceData.length > 0){
            choices.push({label:'Saved Places', option: false});
            angular.forEach(savedPlaceData, function(savedPlace, index) {
              choices.push({label:savedPlace, option: true});
            }, choices);
            $scope.placeLabels = $scope.placeLabels.concat(savedPlaceData);
            $scope.placeIds = $scope.placeIds.concat(data[1].placeIds);
            $scope.poiData = data[1].poiData;
            $scope.placeAddresses = $scope.placeAddresses.concat(data[1].savedplaceaddresses);
          }

          // Recent Searches are stored locally.
          if(data.length > 2){
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
          }

          // These come from Google auto complete
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

          if (toFrom === 'from') {
            $scope.fromLocations = choices
          } else if (toFrom === 'to') {
            $scope.toLocations = choices
          }
        });
        return getLocationsPromise;
      }
      return false;
    }
    //begin private scope for keeping track of last input, and mapping when appropriate
    var lastFrom = $scope.from || $scope.fromDefault;
    var lastTo = $scope.to || $scope.toDefault;
    var lastMappedPlaces = {};
    var ignoreBlur=false;

    function mapOnBlur( place, toFrom )
    {
      var defaulted = false;
      //blur handler runs each time the autocomplete input is blurred via selecting, or just blurring
      //If it was blurred because of a selection, we don't want it to run -- let the selectTo or selectFrom run instead
      //return if no change, return if place is empty, or we're supposed to ignore blur events
      if( (place && lastMappedPlaces[toFrom] === place) || true === ignoreBlur){
        //hide the place marker if place is empty or too short
        if((!place || 1 > place.length) && $scope.toFromMarkers[toFrom]){
          $scope.toFromMarkers[toFrom].setMap(null);
        }
        checkShowMap();
        lastMappedPlaces[toFrom] = place;
        ignoreBlur = false;
        return;
      }else if(!place){
        place = $scope[toFrom + 'Default'];
        defaulted = true;
      }else{
        $scope.showNext = false;
      }
      lastMappedPlaces[toFrom] = place;
      setTimeout(function selectPlace(){
        //if $scope.to or $scope.from is different from place, the autocomplete input's select events are handling
        if(!defaulted && $scope[toFrom] !== place){
          return;
        // Else if we are on initial focus(i.e the from input is focused, inputs are still on defaults, and we clicked out of it)
        // ... toggle isOnInitFocus to false  and then return
        } if (isOnInitFocus === true && (place === $scope.fromDefault || place === $scope.toDefault)) {
          isOnInitFocus = false
          return
        }
        //otherwise, run selectPlace
        $scope.selectPlace(place, toFrom);
      }, 500);
    }

    // Determines whether or not to grey out the "Yes, looks good!" Button
    // This runs each time a character is typed in the to/from fields
    // It's also run when you hover over the map
    $scope.whereShowNext = function(){
      if(!$scope.locationClicked){
        return false;
      }

      if( !$scope.toFromMarkers.from || !$scope.toFromMarkers.to){
        return false;
      }
      return (!!$scope.toFromMarkers.from.map && !!$scope.toFromMarkers.to.map);
    }

    $scope.mapFrom = function(place){
      if(lastFrom != place){
        setTimeout(function(){
          mapOnBlur(place, 'from');
        }, 300);
      }
    }
    $scope.mapTo = function(place){
      if(lastTo != place){
        setTimeout(function(){
          mapOnBlur(place, 'to');
        }, 300);
      }
    }
    $scope.focusTo = function(e){
      lastTo = e.target.value;
    }
    $scope.focusFrom = function(e){
      lastFrom = e.target.value;
    }

    $scope.selectFrom = function(place){
      ignoreBlur = true;
      $scope.selectPlace(place, 'from');
      // If the user selected a place, then re-enable swap button
      $scope.disableSwapAddressButton = false
    }

    $scope.selectTo = function(place){
      ignoreBlur = true;
      $scope.selectPlace(place, 'to');
      // If the user selected a place, then re-enable swap button
      $scope.disableSwapAddressButton = false
    }

    /**
     * NOTE: implementation is similar to how $scope.checkServiceArea is implemented
     * ... only it's fully synchronous whereas checkServiceArea performs at least one asynchronous action
     */
    function swapMapMarkers() {
      const tempToDetails = {...planService.toDetails}
      const tempToName = planService.to
      const tempToDisplay = $scope.to !== '' ? $scope.to : $scope.toDefault
      const tempFromDetails = {...planService.fromDetails}
      const tempFromName = planService.from
      const tempFromDisplay = $scope.from !== '' ? $scope.from : $scope.fromDefault
      // rebuild map markers
      const map = $scope.whereToMap;
      Object.values($scope.toFromMarkers).forEach(function(marker) {
        marker.setMap(null)
      })

      // Check to ensure that at least the default inputs are present and if not, alert the user
      if (Object.keys(tempToDetails).length === 0 || Object.keys(tempFromDetails).length === 0 ) {
        bootbox.alert('One or more address inputs is empty. Please ensure both inputs have a valid address selected.')
        return
      }
      const fromLocation = tempFromDetails.geometry.location
      const toLocation = tempToDetails.geometry.location
      google.maps.event.trigger(map, 'resize');

      // Check if POI's have been selected, or if the location is in a format that isn't recognized by google maps
      const toLatType = typeof toLocation.lat === 'number' || typeof toLocation.lat === 'string'
      const fromLatType = typeof fromLocation.lat === 'number' || typeof fromLocation.lat === 'string'

      const newFromLocation = toLatType ? new google.maps.LatLng(Number(toLocation.lat), Number(toLocation.lng)) : toLocation
      const newToLocation = fromLatType ? new google.maps.LatLng(Number(fromLocation.lat), Number(fromLocation.lng)) : fromLocation

      // Rebuild map markers
      $scope.toFromMarkers.to = new google.maps.Marker({
        map: map,
        position: newToLocation,
        animation: google.maps.Animation.DROP,
        icon: $scope.toFromIcons.to
      });

      $scope.toFromMarkers.from = new google.maps.Marker({
        map: map,
        position: newFromLocation,
        animation: google.maps.Animation.DROP,
        icon: $scope.toFromIcons.from
      });

      // Rebuild map
      rebuildRecenterMap()

      // Swap to/ from
      planService.fromDetails = tempToDetails
      planService.from = tempToName;
      $scope.from = tempToDisplay;
      $scope.fromLocations = []

      planService.toDetails = tempFromDetails;
      planService.to = tempFromName;
      $scope.to = tempFromDisplay;
      $scope.toLocations = []
    }

    /**
     * Debounce swap address inputs
     * - it's asynchronous as the function holds off on executing the swap
     * ...operation for a bit to prevent from repeated calls within a short amount of time
     */
    $scope.debouncedSwapAddressInputs = async function() {
      // NOTE: DISABLE "Yes Looks Good" BUTTON
      $scope.locationClicked = false
      if ($scope.disableSwapAddressButton) {
        bootbox.alert("At least one address in the origin/ destination fields is invalid. Please search for another address and be sure to select one from the suggestions list.")
        return
      }
      $scope.disableSwapAddressButton = true
      await debounce(swapMapMarkers, 450)().then(function() {
        $scope.disableSwapAddressButton = false
        $scope.locationClicked = true
      })
    }

    const validateCityPresence = function(place) {
      const addressComponents = place.address_components
      const ADMIN_AREA_3 = 'administrative_area_level_3'
      const PENN = 'Pennsylvania'
      const locality = addressComponents.find(function(component) {
        const includesLocality = component.types.includes('locality') && component.long_name != null
        const includesAdminArea = component.types.includes(ADMIN_AREA_3) && component.long_name !== PENN && component.long_name !== 'US'  && component.long_name != null
        if (includesLocality || includesAdminArea) {
          return true
        } else {
          return false
        }
      });
    return locality != null
    }
    /**
     * Select Place
     * - This is run when you click a place in the list,
     * ...when you tap out of the to/from field,
     * ...and when the to/from page is loaded
     * - if the place is selected successfully
     * ...$scope.checkServiceArea is called
     * @param {string} place - an address
     * @param {string} toFrom - limited to a value of 'to' or 'from
     * @param {unknown} loadLocationsIfneeded - unsure
     */
    $scope.selectPlace = function(place, toFrom, loadLocationsIfNeeded){
      // Check to see if we have reset to the original place. If so, we can turn the button back on.
      if(toFrom == 'from'){
        if(place === $scope.fromDefault && place.length > 0){
          $scope.locationClicked = true
        }
      }else{
        if(place === $scope.toDefault && place.length > 0){
          $scope.locationClicked = true
        }
      }

      //when a place is selected, update the map
      $scope.poi = null;
      $scope.showMap = true;
      $scope.showNext = false;
      var placeIdPromise = $q.defer();
      $scope.placeLabels = $scope.placeLabels || [];

      // If we are on mobile, you can use the current location
      if(toFrom == 'from' && util.isMobile()){
        $scope.placeLabels.push(currentLocationLabel);
        $scope.locationClicked = true;
      }

      $scope.errors['noResults'+toFrom] = false;
      if($scope.toFromMarkers[toFrom]){
        $scope.toFromMarkers[toFrom].setMap(null);
      }
      if(!place){
        checkShowMap();
        return;
      }
      var selectedIndex = $scope.placeLabels.indexOf(place);

      // The person selected the current location.
      if(-1 < selectedIndex && $scope.placeLabels[selectedIndex] == currentLocationLabel){
        $scope.getCurrentLocation(toFrom);
        $scope.locationClicked = true;
      }
      // The person selected a POI
      else if(-1 < selectedIndex && selectedIndex < $scope.poiData.length){
        const hasCity = validateCityPresence($scope.poiData[selectedIndex])
        if (hasCity) {
          $scope.locationClicked = true;
          $scope.poi = $scope.poiData[selectedIndex];
          $scope.checkServiceArea($scope.poi, $scope.poi.formatted_address, toFrom);
        } else {
          bootbox.alert("Selected Point of Interest has no city, please search for another address.")
          return
        }
      }
      // The person selected either a recent place or a Google Place.
      else{
        var placeId = $scope.placeIds[selectedIndex];
        // The person selected a Google Place
        if(placeId) {
          placeIdPromise.resolve(placeId);
          $scope.locationClicked = true;
        }
        else{
        // The person did not select a Google Place
        // This means that we are going to use the string to determnie the location manually, or that a recent place was selected
        // This is used when the page is first loaded to get the lat/lng of the recently used place.
          var labelIndex = $scope.placeLabels.indexOf(place);
          var autocompleteService = new google.maps.places.AutocompleteService();
          var address;
          //if no place has been found, use place as address (manual input)
          if(-1 === labelIndex){
            address = place;
          }else{
            //A Recent place was selected
            address = $scope.placeAddresses[labelIndex];
            $scope.locationClicked = true;
          }

          autocompleteService.getPlacePredictions(
            {
              input: address,
              bounds: new google.maps.LatLngBounds(
                        // ALL PA
                        new google.maps.LatLng(39.719799, -80.519895),
                        new google.maps.LatLng(42.273734, -74.689502)
                      )
            }, function(list, status)
            {
              if(status == "ZERO_RESULTS" || list == null){
                if(loadLocationsIfNeeded){
                  //try again, loading the locations then selecting place
                  var locationsPromise = $scope.getLocations(place)
                  if(locationsPromise!==false){
                    locationsPromise.then(function(){
                      $scope.selectPlace(place, toFrom, false);
                    });
                    //exit before errors, new selectPlace will handle things
                    return;
                  }
                }
                $scope.errors['noResults'+toFrom] = true;
                $scope.disableSwapAddressButton = true
                checkShowMap();
              }else{
                var placeId = list[0].place_id;
                placeIdPromise.resolve(placeId);
              }
            });
        }

        // After a location has been picked or entered into the to/from field, we then Geocode that location
        // TODO: Why are we re-geocoding? If the autocomplete/Poi already has a lat/lng, this isn't necessary
        // This is only necessary for manual entry, which we no longer do.
        placeIdPromise.promise.then(function(placeId) {
          var placesService = new google.maps.places.PlacesService($scope.whereToMap);
          placesService.getDetails({
            'placeId': placeId, fields: ['address_component', 'geometry', 'vicinity', 'place_id', 'type', 'name'],
          }, function (result, status) {
            if (status == google.maps.GeocoderStatus.OK) {
              /* Verify that a street number and a locality/ city exists in the returned place */
              const datatypes = [];
              let route;
              angular.forEach(result.address_components, function(component, index) {
                angular.forEach(component.types, function(type, index) {
                  // if the component isn't empty, then push it into datatypes and parse the route
                  if (component.long_name != null) {
                    datatypes.push(type);
                    if(type == 'route'){
                      route = component.long_name;
                    }
                  }
                });
              });

              if(datatypes.indexOf('street_number') < 0 || datatypes.indexOf('route') < 0){
                if(datatypes.indexOf('route') < 0){
                  $scope.toFromMarkers[toFrom].setMap(null);
                  checkShowMap();
                  bootbox.alert("The location you selected does not have have a street associated with it, please select another location.", function() {
                    $scope.disableSwapAddressButton = true
                  });
                  return;
                }else if(datatypes.indexOf('street_number') < 0){
                  var streetNameIndex = place.indexOf(route);
                  if(streetNameIndex > -1){
                    var prefix = place.substr(0, streetNameIndex);
                    prefix = prefix.trim();
                    var streetComponent = {};
                    streetComponent.short_name = prefix;
                    streetComponent.long_name = prefix;
                    streetComponent.types = [];
                    streetComponent.types.push('street_number');
                    result.address_components.push(streetComponent);
                  }else{
                    if($scope.toFromMarkers[toFrom]){
                      $scope.toFromMarkers[toFrom].setMap(null);
                    }
                    checkShowMap();
                    bootbox.alert("The location you selected does not have a street number associated, please select another location.", function() {
                      $scope.disableSwapAddressButton = true
                    });
                    return;
                  }
                }
              } else if (datatypes.indexOf('locality') < 0 && datatypes.indexOf('administrative_area_level_3') < 0) {
                checkShowMap();
                bootbox.alert("The location you selected does not have a city associated to it, please select another location.");
                return;
              }

              // When we start typing we hide the Yes, looks good! button.
              // If we made it back here without selecting a place, then we shouldn't let the person continue.
              // When the page is first loaded, then this is used to populate the lat/lng for the previous locations, since the showButton is true by default, the button will be green assuming all other tests pass.
              if ($scope.locationClicked) {
                $scope.checkServiceArea(result, place, toFrom);
                $scope.disableSwapAddressButton = false;
                return;
              } else {
                bootbox.alert("Please select a location from the dropdown to continue.", function() {
                  $scope.disableSwapAddressButton = true
                });
                return;
              }

            } else {
              alert('Geocode was not successful for the following reason: ' + status);
            }
          });
        })
      }
    }

    $scope.getCurrentLocation = function(toFrom) {
      if (navigator.geolocation) {
        $scope.startSpin();
        //navigator.geolocation.getCurrentPosition($scope.setOriginLocation(showPosition, 'from'), $scope.showError);
        navigator.geolocation.getCurrentPosition(function (position) {
          var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
          var geocoder = new google.maps.Geocoder();
          var placeIdPromise = $q.defer();
          geocoder.geocode({'latLng': latlng}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
              if (results[0]) {
                var result = results[0];
                var place = result.formatted_address;

                if(result.place_id){
                  placeIdPromise.resolve();
                }
                else{
                  $scope.stopSpin();
                }

                placeIdPromise.promise.then($scope.mapAddressByPlaceId(result.place_id, place, toFrom, true));
              }
            }
          })
        }, $scope.showError);
      } else {
        $scope.error = "Geolocation is not supported by this browser.";
      }
    }

    $scope.mapAddressByPlaceId = function(placeId, place, toFrom, updateInput) {
      updateInput = util.assignDefaultValueIfEmpty(updateInput, false);
      var placesService = new google.maps.places.PlacesService($scope.whereToMap);
      placesService.getDetails( { 'placeId': placeId}, function(result, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          //verify the location has a street address
          var datatypes = [];
          var route;
          angular.forEach(result.address_components, function(component, index) {
            angular.forEach(component.types, function(type, index) {
              datatypes.push(type);
              if(type == 'route'){
                route = component.long_name;
              }
            });
          });

          if(datatypes.indexOf('street_number') < 0 || datatypes.indexOf('route') < 0){
            if(datatypes.indexOf('route') < 0){
              $scope.toFromMarkers[toFrom].setMap(null);
              bootbox.alert("The location you selected does not have have a street associated with it, please select another location.", function() {
                $scope.disableSwapAddressButton = true
              });
              $scope.stopSpin();
              return;
            }
            else if(datatypes.indexOf('street_number') < 0){
              var streetNameIndex = place.indexOf(route);
              if(streetNameIndex > -1){
                var prefix = place.substr(0, streetNameIndex);
                prefix = prefix.trim();
                var streetComponent = {};
                streetComponent.short_name = prefix;
                streetComponent.long_name = prefix;
                streetComponent.types = [];
                streetComponent.types.push('street_number');
                result.address_components.push(streetComponent);
              }
              else{
                $scope.toFromMarkers[toFrom].setMap(null);
                checkShowMap();
                bootbox.alert("The location you selected does not have a street number associated, please select another location.", function() {
                  $scope.disableSwapAddressButton = true
                });
                $scope.stopSpin();
                return;
              }
            }
          }
          $scope.checkServiceArea(result, place, toFrom, updateInput);
        }
        else {
          alert('Geocode was not successful for the following reason: ' + status);
          $scope.stopSpin();
        }
      });
    }

    // Take in a Google Place object and return the format that is shown
    // in the to/from fields in FMR
    $scope.getDisplayAddress = function(gPlace){
      var name = gPlace['name']
      var vicinity = gPlace['vicinity'];
      var formatted_address = gPlace['formatted_address']
      var city = null;

      // The formatted address works if the place doesn't have a name.
      if((name == null || name == "") && formatted_address != null){
        return formatted_address
      }

      // If we have a name and vicinity for the gPlace, return them.
      if(name != null && vicinity != null){
        return name + ', ' + vicinity;
      }

      // Find the City name from the address_components.
      // In the Google framework, the city name can be 'locality' or 'administrative_area_level_3' if 'locality' isn't present
      angular.forEach(gPlace['address_components'], function(value, key) {
        var types = value['types'];
        if($.inArray('locality',types) >= 0){
          city = value['long_name']
        } else if($.inArray('administrative_area_level_3',types) >= 0){
          city = value['long_name']
        }
      })

      // Check to see if we found a city name and return the string.
      if(name != null && city != null ){
        return name + ', ' + city;
      }
      else{
        return "undefined"
      }
    }

    $scope.checkServiceArea = function (result, place, toFrom, updateInput) {
      updateInput = util.assignDefaultValueIfEmpty(updateInput, false);
      if (result.formatted_address === undefined) { result.formatted_address = place; }
      var serviceAreaPromise = planService.checkServiceArea($http, result);
      $scope.showNext = false;
      serviceAreaPromise.
        success(function(serviceAreaResult) {
          if(serviceAreaResult.result == true){
            $scope.errors['rangeError'+toFrom] = false;
            var recentSearches = localStorageService.get('recentSearches');
            if(!recentSearches){
              recentSearches = {};
            }

            if (typeof(recentSearches[place]) == 'undefined'){
              recentSearches[place] = result;
              localStorageService.set('recentSearches', JSON.stringify(recentSearches));
            }

            var map = $scope.whereToMap;
            if($scope.toFromMarkers[toFrom]){
              $scope.toFromMarkers[toFrom].setMap(null);
            }

            $scope.showMap = true;
            $scope.showUndo = true;
            $scope.disableNext = false;
            $scope.showNext = true;

            setTimeout(function(){
              google.maps.event.trigger(map, 'resize');
              var location = result.geometry.location;//$.extend(true, [], result.geometry.location); //new google.maps.LatLng(result.geometry.location.lat, result.geometry.location.lng);
              if($scope.poi){
                var poilocation = $scope.poi.geometry.location;
                location = new google.maps.LatLng(Number(poilocation.lat), Number(poilocation.lng));
              }

              if(typeof location.lat == "number"){
                location = new google.maps.LatLng(Number(location.lat), Number(location.lng));
              }

              $scope.toFromMarkers[toFrom] = new google.maps.Marker({
                map: map,
                position: location,
                animation: google.maps.Animation.DROP,
                icon: $scope.toFromIcons[toFrom]
              });

              rebuildRecenterMap()
              if (toFrom == 'from') {
                planService.fromDetails = result;
                planService.from = place;
                // Update the typed text to reflect the geocoded place
                $("#whereFromInput").val($scope.getDisplayAddress(result));
                // Reset locations array
                $scope.fromLocations = []
              } else if (toFrom == 'to') {
                planService.toDetails = result;
                planService.to = place;
                // Update the typed text to reflect the geocoded place
                $("#whereToInput").val($scope.getDisplayAddress(result));
                // Reset locations array
                $scope.toLocations = []
              }
            }, 1);
          } else {
            //$scope.showMap = false;
            $scope.showNext = false;
            if ($scope.toFromMarkers[toFrom]) {
              $scope.toFromMarkers[toFrom].setMap(null);
            }
            checkShowMap();
            $scope.errors['rangeError'+toFrom] = true;
            bootbox.alert("The location you selected is outside the service area.");
            $scope.stopSpin();
          }
          $scope.stopSpin();
        }).
        error(function(serviceAreaResult) {
          bootbox.alert("An error occured on the server, please retry your search or try again later.");
          $scope.stopSpin();
        });
    }

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
      $scope.stopSpin();
    }

    $scope.isMobile = function(){
      return /Mobi/.test(navigator.userAgent);
    }

    $scope.startSpin = function(){
      usSpinnerService.spin('spinner-1');
    }

    $scope.stopSpin = function(){
      usSpinnerService.stop('spinner-1');
    }

    $scope.logout = function() {
      delete ipCookie.remove('email');
      delete ipCookie.remove('authentication_token');
      sessionStorage.clear();
      localStorage.clear();
      delete $scope.email;
      delete planService.email;
      $window.location.href = "#/";
      $window.location.reload();
      planService.to = '';
      planService.from = '';
    };

    $scope.specifySharedRideCompanion = function(hasCompanion) {
      if(hasCompanion == 'true'){
        $location.path("/plan/assistant");
        $scope.step = 'assistant';
      }else{
        $location.path("/plan/instructions_for_driver");
        $scope.step = 'instructions_for_driver';
      }
    }

    $scope.selectSharedRide = function() {
      $location.path("/plan/companions");
      $scope.step = 'companions';
    }

    $scope.overrideCurrentLocation = function() {
      planService.from = null;
      planService.fromDetails = null;
      $location.path("/plan/from");
      $scope.step = 'from';
    };

    $scope.submitRebookedTrip = function(){
      $scope.message = null;

      var fromDate = $scope.fromDate;
      if(!fromDate){
        $scope.message = 'Please enter a departure date.';
        return;
      }

      var fromTime = $scope.fromTime;
      if(!fromTime){
        $scope.message = 'Please enter a departure time.';
        return;
      }

      fromTime.setYear(fromDate.getFullYear());
      fromTime.setMonth(fromDate.getMonth());
      fromTime.setDate(fromDate.getDate());

      if(planService.rebookTrip.itineraries.length > 1){
        var returnTime = $scope.returnTime;
        var returnDate = $scope.returnDate;

        returnTime.setYear(returnDate.getFullYear());
        returnTime.setMonth(returnDate.getMonth());
        returnTime.setDate(returnDate.getDate());

        if(!returnDate){
          $scope.message = 'Please enter a return date.';
          return;
        }

        if(!returnTime){
          $scope.message = 'Please enter a return time.';
          return;
        }

        if(returnTime.getTime() < fromTime.getTime()){
          $scope.message = 'You requested a return trip that starts before your departure.  Please enter a valid return date and time.';
          return;
        }
      }

      var request = {};
      var trip = planService.rebookTrip;
      request.trip_purpose = trip.trip_purpose_raw;
      request.itinerary_request = [];
      var outboundTrip = {};
      outboundTrip.segment_index = 0;
      outboundTrip.start_location = trip.itineraries[0].origin;
      outboundTrip.end_location = trip.itineraries[0].destination;
      outboundTrip.assistant = trip.itineraries[0].assistant;
      outboundTrip.companions = trip.itineraries[0].companions;
      outboundTrip.note = trip.itineraries[0].note;

      var fromTimeString = moment.utc(fromTime).format();
      outboundTrip.trip_time = fromTimeString;
      outboundTrip.departure_type = trip.itineraries[0].requested_time_type;
      request.itinerary_request.push(outboundTrip);

      if(trip.itineraries.length > 1){
        var returnTrip = {};
        returnTrip.segment_index = 1;
        returnTrip.start_location = trip.itineraries[1].origin;
        returnTrip.end_location = trip.itineraries[1].destination;
        returnTrip.departure_type = trip.itineraries[1].requested_time_type;
        returnTrip.assistant = trip.itineraries[0].assistant;
        returnTrip.companions = trip.itineraries[0].companions;
        returnTrip.note = trip.itineraries[1].note;
        var returnTimeString = moment.utc(returnTime).format();
        returnTrip.trip_time = returnTimeString;
        request.itinerary_request.push(returnTrip);
      }
      planService.itineraryRequestObject = request;
      usSpinnerService.spin('spinner-1');
      var promise = planService.postItineraryRequest($http);
      promise.
        success(function(result) {
          planService.searchResults = result;
          var paratransitItineraries = [];

          angular.forEach(result.itineraries, function(itinerary, index) {
            if(itinerary.returned_mode_code == "mode_paratransit"){
              paratransitItineraries.push(itinerary);
            }
          }, paratransitItineraries);
          if(paratransitItineraries.length != trip.itineraries.length){
            bootbox.alert("No shared ride is available for your request. Please call 1-844-PA4-RIDE for more information.");
            usSpinnerService.stop('spinner-1');
          }else{
            planService.paratransitItineraries = paratransitItineraries;
            var promise = planService.bookSharedRide($http);
            promise.then(function(result) {
              planService.booking_results = result.data.booking_results;
              planService.hasEscort = trip.itineraries[0].assistant;
              planService.numberOfCompanions = trip.itineraries[0].companions;
              planService.driverInstructions = trip.itineraries[0].note;
              planService.driverInstructionsReturn = trip.itineraries[1].note;
              $location.path('/paratransit/confirm_shared_ride');
            });
          }
        })
    }

    $scope.selectDepartDate = function(day){
      if(!(day.startTime || day.startTime == 0)) { return; } // Return if the start time doesn't exist
      if(!(day.endTime > 0)) { return; } // Return if the end time doesn't exist

      let hour, minute;
      let serviceOpen = {hour: day.startTime / 3600, minute: (day.startTime % 3600) / 60};
      let serviceClose = {hour: day.endTime / 3600, minute: (day.startTime % 3600) / 60};

      //try to re-use the selected time if there is one, otherwise use the start time as a default
      if($scope.fromMoment && !$scope.fromMoment.isSame( moment(), 'day' )) {
        minute = $scope.fromMoment.minute();
        hour = $scope.fromMoment.hour();
      } else {
        hour = serviceOpen.hour;
        minute = serviceOpen.close;
      }

      planService.serviceOpen = day.moment.clone().set(serviceOpen)
      planService.serviceClose = day.moment.clone().set(serviceClose)
      $scope.fromMoment = day.moment.clone();
      $scope.fromMoment.hour( hour ).minute( minute ).seconds(0);

      setTimeout(function(){
        $('input.cs-hour').select();
      }, 100);
    }

    function _setupHowLongOptions(){
      var time, startingTime, endOfDay, beginOfDay, minDiff, hrsDiff, name, selectedIndex;
      //can only setup howlong if fromMoment is within service hours
      if(!$scope.fromMoment || !planService.serviceOpen || !planService.serviceClose) { return; }

      $scope.howLongOptions = [{
          minutes: 0,
          name: 'No return trip'
        }];

      time = $scope.fromMoment.clone();
      endOfDay = planService.serviceClose.clone()
      beginOfDay = planService.serviceOpen.clone()

      if(time.isBefore(beginOfDay)) {
        startingTime = beginOfDay;
        time = beginOfDay.clone()
      } else {
        startingTime = time.clone()
      }

      time.add(60, 'm')
      while (time.isBefore(endOfDay) || time.isSame(endOfDay)) {
        name = [];
        minDiff = time.diff(startingTime, 'minutes');
        hrsDiff = time.diff(startingTime, 'hours');

        if (hrsDiff > 0) { name.push(hrsDiff, (hrsDiff === 1 ? 'Hour' : 'Hours')) }
        if (minDiff % 60 > 0) { name.push(minDiff % 60, (minDiff % 60 === 1 ? 'Minute' : 'Minutes')) }

        $scope.howLongOptions.push({
          minutes: minDiff,
          name: name.join(' ')
        });

        if($scope.howLong && minDiff == $scope.howLong.minutes){
          selectedIndex = $scope.howLongOptions.length-1;
        }

        time.add(15, 'm');
      }

      selectedIndex = selectedIndex || 0;
      $scope.howLong = $scope.howLongOptions[ selectedIndex ];
      $scope.updateReturnTime($scope.howLong);
    }

    $scope.toggleShowBusRides = function(){
      $scope.showBusRides =! $scope.showBusRides;
      planService.showBusRides = $scope.showBusRides;
    }

    //initialize this step's state
    if ($scope.loggedIn) {
      planService.getCurrentBalance($scope, $http, ipCookie).then(function(){
        // Service sets ipCookie with currentBalance
      });
    }

    switch($routeParams.step) {

      case undefined:
        break;
      case 'transit':
        (function(){
          var startDate, endDate, end;
          var startDate = moment(new Date(planService.transitItineraries[0][ $scope.selectedBusOption[0] ].start_time));
          end = planService.transitItineraries[1] || planService.transitItineraries[0];
          var endDate = moment(new Date(end[$scope.selectedBusOption[1]].end_time));
          $scope.startDay = startDate.format('dddd');
          $scope.startDate = startDate.format('MMMM Do');
          $scope.startTime = startDate.format('h:mm a');
          $scope.endTime = endDate.format('h:mm a');
          $scope.transitInfos = planService.transitInfos;
          $scope.transit = "transit";
          $scope.mode = "transit";
        }());
      break;
      case 'walk':
        (function(){
          var startDate, endDate, end;
          var startDate = moment(new Date(planService.walkItineraries[0].start_time));
          end = planService.walkItineraries[1] || planService.walkItineraries[0];
          var endDate = moment(new Date(end.end_time));
          $scope.startDay = startDate.format('dddd');
          $scope.startDate = startDate.format('MMMM Do');
          $scope.startTime = startDate.format('h:mm a');
          $scope.endTime = endDate.format('h:mm a');
          $scope.walkItineraries = planService.walkItineraries;
          $scope.mode = "walk";
        }());
      break;
      case 'where':
        //load the map origin/destination
        if($scope.to){
          $scope.selectPlace($scope.to, 'to', true);
        }else if($scope.toDefault){
          $scope.selectPlace($scope.toDefault, 'to', true);
        }
        if($scope.from){
          $scope.selectPlace($scope.from, 'from', true);
        }else if($scope.fromDefault){
          $scope.selectPlace($scope.fromDefault, 'from', true);
        }
        break;
      case 'purpose':
        planService.getTripPurposes($scope, $http).then(function(){
          // pull trip purposes from planService after fetching them and then expose them for the front end to use
          $scope.purposes = planService.purposes
          $scope.top_purposes = planService.top_purposes
          usSpinnerService.stop('spinner-1');
          if ($scope.purposes.length + $scope.top_purposes.length <= 0) {
            $location.path('/plan/no_purposes/error');
          }
        });
        $scope.showNext = false;
        break;
      case 'when':
        $scope.showNext = false;
        $scope.whenShowNext = function(){
          //true to show next
          var fromOK, returnOK,

          _checkServiceHours = function(from, open, close, okNull) {
            var startMoment, endMoment;

            if(from === null){
              if( okNull === true ){ return true; }
              return false; // if the day is null return false (unless null is ok)
            }
            if( !(open && close) ){ return false; } //return false if selected day does not have service hours

            //return false if time not within the service hours
            startMoment = open.clone().subtract(1, 'seconds');
            endMoment = close.clone().add(1, 'seconds');
            if( !from.isBetween(startMoment, endMoment) ){ return false; } // help

            //make sure day is in the future
            if( moment().isAfter(from) ){ return false; } // help

            //passed all checks, ok to show next
            return true;
          };// end _checkServiceHours
          fromOK = _checkServiceHours( $scope.fromMoment, planService.serviceOpen, planService.serviceClose );
          returnOK = _checkServiceHours( $scope.returnMoment, planService.serviceOpen, planService.serviceClose, true);
          return fromOK && returnOK && $scope.fromTimeUpdated;
        }

        $scope.$watch('fromMoment', function (n) {
          $scope.showNext = false;
          if( !n || !n._isAMomentObject ){ return;}
          $scope.showNext = $scope.whenShowNext();
          _setupHowLongOptions();
          planService.fromDate = n.toDate();
          planService.fromTime = n.toDate();
          planService.fromTimeType = 'arrive';
          planService.returnTimeType =  'depart';
          planService.asap = false;
        });
        break;
      case 'confirm' :
        $scope.transitResult = planService.transitResult;
        $scope.paratransitResult = planService.paratransitResult;

        planService.prepareTripSearchResultsPage();
        $scope.fare_info = planService.fare_info;
        $scope.paratransitItineraries = planService.paratransitItineraries;

        // TODO (Drew Teter, 09/22/2022) Fully Remove ability for guest login.
        // We plan on doing this in the future, but as no tickets have been created yet
        // I'm just commenting out these lines for now.

        // if(planService.guestParatransitItinerary){
        //   //don't let there be paratransit itineraries if the guest itinerary is populated
        //   $scope.paratransitItineraries = [];
        // }

        if (!planService.paratransitResult) {
          // Don't let there be paratransit itineraries if the purpose is not eligible.
          $scope.paratransitItineraries = [];
        }

        // TODO (Drew Teter, 09/22/2022) Fully Remove ability for guest login.
        // We plan on doing this in the future, but as no tickets have been created
        // for this task yet, I'm just commenting out this line for now.

        // $scope.guestParatransitItinerary = planService.guestParatransitItinerary;

        $scope.walkItineraries = planService.walkItineraries;
        $scope.transitItineraries = planService.transitItineraries;
        $scope.transitInfos = planService.transitInfos;
        $scope.taxiItineraries = planService.taxiItineraries;
        $scope.hasTaxi = $scope.taxiItineraries.length > 0;
        $scope.uberItineraries = planService.uberItineraries;
        $scope.hasUber = $scope.uberItineraries.length > 0;
        $scope.noresults = false;
        $scope.request = planService.confirmRequest;
        $scope.showBusRides = planService.showBusRides;
        $scope.hasParatransit = $scope.paratransitItineraries.length > 0;
        $scope.hasTransit = $scope.transitInfos.length > 0;
        $scope.hasWalk = $scope.walkItineraries.length > 0;

        const firstItinerary = $scope.transitItineraries && $scope.transitItineraries[0] && $scope.transitItineraries[0][0];
        const firstTransit = firstItinerary && firstItinerary.json_legs.find(leg => leg.mode === 'BUS');
        $scope.transitRoute = firstTransit ? firstTransit.route : undefined;
        // If itinerary results is 0, return no results
        if($scope.paratransitItineraries.length < 1 && $scope.transitItineraries.length < 1 && $scope.walkItineraries.length < 1 && !$scope.hasUber && !$scope.hasTaxi){
          $scope.noresults = true;
        }

        // Check if Transit Itineraries exist before finding the name of the transit route
        if ($scope.transitItineraries && $scope.transitItineraries.length > 0) {
          const firstItinerary = $scope.transitItineraries[0][0]
          const firstTransit = firstItinerary.json_legs.find(leg => leg.mode === 'BUS') // check to see what happens if leg.mode doesn't exist
          $scope.transitRoute = firstTransit ? firstTransit.route : undefined
        }

        $scope.$watch('selectedBusOption', function(n){
          if(n && n.length && typeof n === 'object'){
            planService.selectedBusOption = n;
          }
        })
        break;
      case 'transit_details' :
        $scope.transitItineraries = planService.transitItineraries;
        $scope.transitInfos = planService.transitInfos;
        $scope.request = planService.confirmRequest;
        $scope.$watch('selectedBusOption', function(n){
          if(n && n.length && typeof n === 'object'){
            planService.selectedBusOption = n;
          }
        })
        break;
      case 'returnTimeType':
        var fromDate = planService.fromDate;
        var returnDate = planService.returnDate;
        if(planService.returnTime && planService.returnTimeType){
          $scope.returnTime = planService.returnTime;
          $scope.returnTimeType = planService.returnTimeType;
        }else{
          if(moment(fromDate).format('M/D/YYYY') == moment(returnDate).format('M/D/YYYY')) {
            var fromTimeType = planService.fromTimeType;
            var fromTime = planService.fromTime
            if(planService.asap == true){
              $scope.returnTime = new Date(fromTime);
              $scope.returnTime.setHours($scope.returnTime.getHours() + 2);
            } else if(fromTimeType == 'depart'){
              $scope.returnTime = new Date(fromTime);
              $scope.returnTime.setHours($scope.returnTime.getHours() + 4);
            } else if(fromTimeType == 'arrive'){
              $scope.returnTime = new Date(fromTime);
              $scope.returnTime.setHours($scope.returnTime.getHours() + 2);
            }
          }else{
            var now = moment().startOf('day');
            now.add(10, 'hours');
            $scope.returnTime = now.toDate();
          }
          //now round up to 15 min interval
          var start = moment($scope.returnTime);
          var remainder = (start.minute()) % 15;
          if(remainder != 0){
            remainder = Math.abs(remainder - 15);
            $scope.returnTime.setMinutes($scope.returnTime.getMinutes() + remainder);
          }
          $scope.disableNext = false;
          $scope.returnTimeType = 'depart';
        }
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
          $http.get('//' + APIHOST + '/data/bookingresult.json').
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
            $scope.step = 'alternative_options';
          }else if($scope.walkItineraries.length > 0){
            $scope.showAlternativeOption = true;
          }
        }
        $scope.showNext = false;
        break;
      // case 'discounts':
      //   var basefareIndex = null;
      //   angular.forEach(planService.paratransitItineraries[0].discounts, function(discount, index) {
      //     if(discount.base_fare && discount.base_fare == true){
      //       basefareIndex = index;
      //     }
      //     discount.fare = new Number(discount.fare).toFixed(2);
      //   });
      //   if(basefareIndex){
      //     var basefare = planService.paratransitItineraries[0].discounts[basefareIndex];
      //     planService.paratransitItineraries[0].discounts.splice(basefareIndex, 1);
      //     planService.paratransitItineraries[0].discounts.unshift(basefare);
      //   }
      //   $scope.paratransitItinerary = planService.paratransitItineraries[0];
      //   $scope.showNext = false;
      //   break;
      case 'my_rides':
        planService.reset();
        planService.getPastRides($http).then(function(data) {
          planService.populateScopeWithTripsData($scope, planService.unpackTrips(data.data.trips, 'past'), 'past');
        });
        planService.getFutureRides($http).then(function(data) {
          var liveTrip = planService.processFutureAndLiveTrips(data, $scope, ipCookie);
          if (liveTrip) { // If there's a live trip, check for realtime updates
            planService.createEtaChecker($scope, $http, ipCookie);
          }

          var navbar = $routeParams.navbar;
          if(navbar){
            $scope.tabFuture = true;
            delete $scope.tabPast;
          }

        });

        $scope.hideButtonBar = true;
        $window.visited = true;

        break;
      // case 'companions':
      //   $scope.showNext = false;
      //   break;
      case 'assistant':
        $scope.questions = planService.getPrebookingQuestions();
        $scope.hasEscort = planService.hasEscort;
        $scope.numberOfCompanions = planService.numberOfCompanions;

        if ($scope.numberOfCompanions === null || $scope.numberOfCompanions === undefined) {
          $scope.numberOfCompanions = 0;
        }

        $scope.hasCompanions = $scope.numberOfCompanions > 0
        break;

      case 'instructions_for_driver':
        $scope.driverInstructions = planService.driverInstructions;
        $scope.driverInstructionsReturn = planService.driverInstructionsReturn;
        $scope.$watch('howLong', function(newVal) {
          // Show return leg note text box if selected howLong value is more than 0
          $scope.isRoundTrip = newVal && newVal.minutes > 0;
        });

        $scope.updateCounter1 = function() {
          $scope.counter1 = $scope.planService.driverInstructions ? $scope.planService.driverInstructions.length : 0;
        };

        $scope.updateCounter2 = function() {
          $scope.counter2 = $scope.planService.driverInstructionsReturn ? $scope.planService.driverInstructionsReturn.length : 0;
        };

        $scope.updateCounter1();
        $scope.updateCounter2();

        break;
      case 'rebook':
        $scope.minDate = new Date();
        $scope.trip = planService.rebookTrip;
        if(planService.rebookTrip.itineraries.length > 1){
          $scope.roundTrip = true;
        }

        $scope.fromTime = moment($scope.trip.itineraries[0].requested_time).toDate();
        $scope.fromTimeType = $scope.trip.itineraries[0].requested_time_type;

        if($scope.fromTime.getTime() > new Date().getTime()){
          $scope.fromDate = moment($scope.fromTime).add(1, 'week').toDate();
        }else{
          $scope.fromDate = moment().add(1, 'week').toDate();
        }

        if($scope.trip.itineraries.length > 1){
          $scope.minReturnDate = $scope.fromDate;
          $scope.returnTime = moment($scope.trip.itineraries[1].requested_time).toDate();
          $scope.returnTimeType = $scope.trip.itineraries[1].requested_time_type;
          var datediff = Math.abs(moment($scope.trip.itineraries[0].end_time).diff(moment($scope.trip.itineraries[1].start_time), 'days'));
          $scope.returnDate = moment($scope.fromDate).add(datediff, 'day').toDate();
        }
        $scope.hideButtonBar = true;
        break;
      default:

        break;
    }

    $scope.$watch('fromTime', function(n) {
        if($scope.step == 'fromTimeType'){
          var fromDate = planService.fromDate;
          var now = moment(returnDate).startOf('day'); ;
          var dayDiff = now.diff(fromDate, 'days');
          if(Math.abs(dayDiff) < 1){
            var timeDiff = moment().diff(n, 'seconds');
            if(timeDiff > 0){
              $scope.showNext = false;
              $scope.message = 'Please enter a departure time after the current time.'
            }else{
              $scope.showNext = true;
              $scope.message = null;
            }
          }
        }
      }
    );

    $scope.$watch('returnTime', function(n) {
        if($scope.step == 'returnTimeType'){
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
              var timeDiff = moment(returnTime).diff(fromTime, 'minutes');
              if(timeDiff > 10){
                $scope.showNext = true;
                $scope.message = null;
              } else {
                $scope.showNext = false;
                $scope.message = 'Please enter a return time at least 10 minutes after the departure time.'
              }
            }
          }else{
            $scope.disableNext = true;  //not a valid time
          }
        }
      }
    );

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

            google.maps.event.trigger(n, 'resize');
            n.setCenter(result.geometry.location);
            $scope.showMap = true;
            $scope.showConfirmLocationMap = true;
          }
        }
      }
    );

    $scope.$on("$destroy", function () {
      planService.killEtaChecker();
    });

  }
]);
