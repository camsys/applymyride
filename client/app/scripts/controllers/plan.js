'use strict';

var app = angular.module('applyMyRideApp');

app.controller('PlanController', ['$scope', '$routeParams', '$location', 'planService',
    function($scope, $routeParams, $location, planService) {

      $scope.step = $routeParams.step;

      $scope.notYet = function() {
        return plan.from;
      };

      var plan = {};
      $scope.plan = plan;
      $scope.planService = planService;

      switch($routeParams.step) {
        case undefined:
        case 'needReturnTrip':
          $scope.showNext = false;
          break;
        default:
          $scope.showNext = true;
          break;        
      }

      if ($scope.step==='to') {
        if (!planService.from) {
          planService.from = '1230 Roosevelt Avenue, York, PA 17404';
        } else {
        }
      }

      // $scope.useCurrentLocation=true;
      // plan.useCurrentLocation=true;
      // plan.from = 'From place';
      // plan.to = 'To place';
      // plan.to = "Someplace else";
      // plan.depart = "2/14/2015 9:00 AM"

      $scope.addresses = [
        { place: '1230 Roosevelt Avenue, York, PA 17404' },
        { place: '1 W King St, York, PA 17401' },
        { place: '159 E Market St, York, PA 17401' },
        { place: '160 W Market St, York, PA 17401' },
        { place: '54 W Philadelphia St, York, PA 17401' },
        { place: '51 E Philadelphia St, York, PA 17401' },
        { place: '55 W Philadelphia St, York, PA 17401' },
        { place: '52 E Philadelphia St, York, PA 17401' }
      ];

      $scope.readyToPlan = function() {
        return plan.from && plan.to && plan.depart && (plan.return || $scope.returnTrip===false);
      };

      $scope.next = function() {
        switch($scope.step) {
          case 'start':
            $location.path('/plan/from');
            break;
          case 'from':
            planService.from = plan.from;
            $location.path('/plan/to');
            break;
          case 'to':
            planService.to = plan.to;
            $location.path('/plan/departDate');
            break;
          case 'departDate':
            planService.departDate = plan.departDate;
            $location.path('/plan/departTime');
            break;
          case 'departTime':
            var t = moment(plan.departTime, 'h:mm a');
            planService.departDate.hour(t.hour()).minute(t.minute()).second(0).millisecond(0);
            $location.path('/plan/needReturnTrip');
            break;
          case 'needReturnTrip':
            planService.needReturnTrip = plan.needReturnTrip;
            $location.path('/plan/returnDate');
            break;
          case 'returnDate':
            planService.returnDate = plan.returnDate;
            $location.path('/plan/confirm');
            break;
          case 'confirm':
            planService.returnDate = plan.returnDate;
            $location.path('/plan2');
            break;
        }
      };

      $scope.fromLocationChanged = function() {
      };

      $scope.restartPlan = function() {
        $scope.useCurrentLocation = null;
        plan.from = null;
        plan.to = null;
        plan.depart = null;
        plan.return = null;
        $scope.returnTrip = null;
      };

      $scope.$watch('useCurrentLocation', function(newValue) {
        plan.useCurrentLocation = newValue;
        if (newValue===true) {
          plan.from = '1230 Roosevelt Avenue, York, PA 17404';
        }
      });

      // TODO I don't think having these multiple $watches is good angular style.
      $scope.$watch('fromChoice', function(n) {
        if (n) {
          plan.from = n.title;
        }
      }
      );

      $scope.$watch('plan.from', function(n) {
        if (n) {
          $scope.notYet = false;
        }
      }
      );

      $scope.$watch('toChoice', function(n) {
        if (n) {
          plan.to = n.title;
        }
      }
      );


    }
  ]);


app.directive('date', function() {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, ngModelController) {
            
            ngModelController.$parsers.push(function(value) {
                return new Date(value).getTime();
            });
            
            ngModelController.$formatters.push(function(value) {
                return moment(value).format('MM/DD/YYYY');
            });
        }
    };
});

angular.module('applyMyRideApp').service('Map', ['$q', '$window', function($q, $window) {

    var google = $window.google;
    
    this.init = function() {
        var options = {
            // center: new google.maps.LatLng(40.7127837, -74.00594130000002),
            center: new google.maps.LatLng(39.9647747,-76.7291728),
            zoom: 13,
            disableDefaultUI: false    
        };
        this.map = new google.maps.Map(
            document.getElementById('map'), options
        );
        this.places = new google.maps.places.PlacesService(this.map);
        this.infoWindows = [];
    };
    
    this.search = function(str) {
        var d = $q.defer();
        this.places.textSearch({query: str,
          location: new google.maps.LatLng(39.9647747,-76.7291728),
          radius: 5000}, function(results, status) {
            if (status === 'OK') {
                d.resolve(results);
            }
            else
              {
                d.reject(status);
              }
        });
        return d.promise;
    };
    
    this.addMarker = function(res) {
        // if(this.marker) this.marker.setMap(null);
        // this.marker = new google.maps.Marker({
        //     map: this.map,
        //     position: res.geometry.location,
        //     animation: google.maps.Animation.DROP
        // });        
        for (var i = 0; i < this.infoWindows.length; i++) {
          this.infoWindows[i].close();
        }
        this.infoWindows = [];
        var max = (res.length > 5 ? 5 : res.length);
        var b = new google.maps.LatLngBounds();
        for (i = 0; i < max; i++) {
          var r = res[i];
          // if(this.infoWindow) this.infoWindow.close();
          var contentString = '' + r.name + ' <button class="btn btn-primary btn-xs" ng-click="console.log(\'click\');"><i class="fa fa-check"></i></button>';
          this.infoWindows[i] = new google.maps.InfoWindow({content: contentString, position: r.geometry.location});
          this.infoWindows[i].open(this.map);
          if (b.isEmpty()) {
            b = new google.maps.LatLngBounds(r.geometry.location, r.geometry.location);
          } else {
            b = b.union(new google.maps.LatLngBounds(r.geometry.location, r.geometry.location));
          }
          console.log(b.toString());
        }
        // this.map.setCenter(res[0].geometry.location);
        console.log(b);
        this.map.panToBounds(b);
    };
    
}]);

angular.module('applyMyRideApp').controller('NewPlaceController', ['$scope', '$window', 'Map', function($scope, $window, Map) {
    
    $scope.place = {};
    
    $scope.search = function() {
        $scope.apiError = false;
        Map.search($scope.searchPlace)
        .then(
            function(res) { // success
                Map.addMarker(res);
                // $scope.place.name = res.name;
                // $scope.place.lat = res.geometry.location.lat();
                // $scope.place.lng = res.geometry.location.lng();
            },
            function(status) { // error
                $scope.apiError = true;
                $scope.apiStatus = status;
            }
        );
    };
    
    $scope.send = function() {
        $window.alert($scope.place.name + ' : ' + $scope.place.lat + ', ' + $scope.place.lng);    
    };
    
    Map.init();
}]);
