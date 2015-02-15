'use strict';

angular.module('applyMyRideApp')
  .controller('PlanController', ['$scope', '$location', '$routeParams',
    function($scope, $location, $routeParams) {
      var plan = {};
      $scope.plan = plan;
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

      $scope.$watch('useCurrentLocation', function(newValue, oldValue) {
        plan.useCurrentLocation = newValue;
        if (newValue===true) {
          plan.from = '1230 Roosevelt Avenue, York, PA 17404';
        } else {
          plan.from = null;
        }
      });

      $scope.$watch('fromChoice', function(n, o) {
        plan.from = n.title;
        }
      );


    }
  ]);

angular.module('applyMyRideApp').service('Map', ['$q', function($q) {
    
    this.init = function() {
        var options = {
            // center: new google.maps.LatLng(40.7127837, -74.00594130000002),
            center: new google.maps.LatLng(39.9647747,-76.7291728),
            zoom: 13,
            disableDefaultUI: false    
        }
        this.map = new google.maps.Map(
            document.getElementById("map"), options
        );
        this.places = new google.maps.places.PlacesService(this.map);
        this.infoWindows = [];
    }
    
    this.search = function(str) {
        var d = $q.defer();
        this.places.textSearch({query: str,
          location: new google.maps.LatLng(39.9647747,-76.7291728),
          radius: 5000}, function(results, status) {
            if (status == 'OK') {
                d.resolve(results);
            }
            else d.reject(status);
        });
        return d.promise;
    }
    
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
        for (var i = 0; i < max; i++) {
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
    }
    
}]);

angular.module('applyMyRideApp').controller('NewPlaceController', ['$scope', 'Map', function($scope, Map) {
    
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
    }
    
    $scope.send = function() {
        alert($scope.place.name + ' : ' + $scope.place.lat + ', ' + $scope.place.lng);    
    }
    
    Map.init();
}]);
