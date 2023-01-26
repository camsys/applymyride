'use strict';

// TODO (Drew) Remove unused dependencies
angular.module('applyMyRideApp')
  .controller('LoginController', ['$scope', '$rootScope', '$location', 'flash', 'planService', '$http', 'ipCookie', '$window', 'localStorageService', 'util', 'Idle',
    function ($scope, $rootScope, $location, flash, planService, $http, ipCookie, $window, localStorageService, util, Idle) {
      const currentPath = $location.path();
      // The keys of all the cookies for the app
      const sessionKeys = [
        "jwt",
        "refresh_token", 
        "account_type", 
        "authentication_token", 
        "sharedRideId", 
        "county", 
        "first_name", 
        "last_name", 
        "email"
      ];
      window.$location = $location;

      // skip initializing this controller if we're not on the page
      if( ["/login", '/login/error', '/registration', '/registration/error'].indexOf(currentPath) == -1) { return; }

      // Checks if user is logged in.
      // If user is a business partner or cwopa, they go to the admin site.
			// If logged in, and account is setup, redirect to new trip page.
      $scope.userInfo = getUserFromSession();
      if (hasKeystoneLogin()) {
        if ($scope.userInfo.account_type !== "CITIZEN") {
          let jwt = $scope.userInfo.jwt;
          setUserSession({}); // Clear frontend session
          document.location.href = "//" + APIHOST + "/api/v3/sso/admin?jwt=" + encodeURIComponent($scope.userInfo.jwt);
          return;
        }

        if (isLoggedIn()) { $location.path(HOMEPAGE); return; }
      }

      // --- Login Path ---
			// This is where we get redirected to by the backend with an authentication code
      // If code is present, then attempt to authenticate with otherwise redirect error page
      if (currentPath === "/login") {
        const code = $location.search().code;

        if (!code) { $location.path("/login/error"); return; }

        if (code) { 
          let authenticationPromise = authenticateAccount(code);
          authenticationPromise.success((resp) => {
            setUserSession(resp);
            $scope.login();
            $location.search("");

            // On successful login
            // If account is fully set up, then redirect to homepage.
            // Unless user is a business partner, they go to the admin site.
            if (isLoggedIn()) { 
              // TODO (Drew) load trip data
              $location.path(HOMEPAGE);
            } else {
              // Account is not set up, therefore redirect to registration.
              $location.path("/registration");
            }
          });
          authenticationPromise.error((err) => {
            console.log("Authentication Failure", err);
            // TODO (Drew) logout should include an API call, so it returns a promise
            // Should we be logging out here? yes.
            // $scope.logout();
            $location.path("/registration/error");
          });
        }
      }

      // --- Login Error Path ---
			// This is where we get redirected to if there was no auth code during login
      // or if the login itself faild somehow.
      if (currentPath === "/login/error") {
        $scope.back = function () {
          // TODO (Drew) logout should include an API call, so it returna promise
          $scope.logout();
        }
      }

      // --- Account Setup Path ---
      // TODO (Drew) rename path
      // Keystone login was not matched with an existing user. So we need more
      // information in order to find one.
      if (currentPath === "/registration") {
        if (!$scope.userInfo.jwt) { $location.path("/login/error"); }
        let existingServiceOptions = $scope.registration && $scope.registration.serviceOptions;

        $scope.registration = {
          hasSharedRideId: false,
          confirmationMethod: 'sharedRideId',
          sharedRideId: '',
          phoneNumber: '',
          formReady: false,
          serviceOptions: existingServiceOptions,
          serviceOption: {},
          dob: {}
        };

        // Only get counties if they haven't already been loaded
        if(!existingServiceOptions || true) {
          util.getCounties(function(response) {
            let county_services = response.data.county_services;
            let options = county_services.sort(function (a,b) { 
              return a.label > b.label ? 1 : -1;
            });

            $scope.registration.serviceOptions = options;
          }, function (err) {});
        }

        // Create functions for the registration page
        $scope.clickHasSharedRideId = function () { 
          $scope.registration.hasSharedRideId = true;
        };

        $scope.clickNoSharedRideId = function () {
          $location.path('/registration/error');
        };

        $scope.checkFormReady = function () {
          console.log($scope.registration)
          const { confirmationMethod, serviceOption, sharedRideId, dob } = $scope.registration;
          let isReady = false;

          // if (confirmationMethod === 'sharedRideID')
          switch (confirmationMethod) {
            case 'sharedRideId':
              const { month, day, year } = dob;
              isReady = !!(
                sharedRideId && 
                serviceOption.countyName && 
                serviceOption.serviceId && 
                month &&
                day &&
                year
              );
              break;
            case 'phoneNumber':
              isReady = !!(county && phoneNumber);
              break;
          }

          $scope.registration.formReady = isReady;
        }

        $scope.submitRegistration = function () {
          let registrationPromise = registerAccount($scope.userInfo.jwt, $scope.registration);
          registrationPromise.success((resp) => {
            setUserSession(resp);
            $scope.login();
            $location.path('/registration/success');
          });
          registrationPromise.error((err) => {
            console.log('Reg', err);
          });
        }

        $scope.back = function () {
          $scope.logout();
        }
      }

      // --- Account Setup Error Path ---
      // Most likely we couldn't find a matching user in exolane's database to
      // link the new account to. Or the account we did find was already claimed
      if (currentPath === "/registration/error") {
        $scope.back = function () {
          $location.path("/registration");
        }
      }

      // --- Generic Functions ---
      $scope.login = function () {
        const userInfo = getUserFromSession();

        $scope.userInfo = userInfo;

        // TODO (Drew) just Having userInfo should be good enough
        // change other depenencies
        $scope.email = userInfo["email"];
        $scope.first_name = userInfo["first_name"];
        $scope.last_name = userInfo["last_name"];
        $scope.full_name = [$scope.first_name, $scope.last_name].join(" ");

        planService.authentication_token = userInfo["authentication_token"];
				planService.sharedRideId = userInfo["sharedRideId"];
        planService.email = userInfo["email"];
        planService.county = userInfo["county"];
				planService.first_name = userInfo["first_name"];
				planService.last_name = userInfo["last_name"];
      };

      // TODO (Drew) We'll need to make an API call
      $scope.logout = function () {
        $scope.user_Info = {};
        $scope.email = undefined;
        $scope.first_name = undefined;
        $scope.last_name = undefined;
        $scope.full_name = undefined;

        planService.authentication_token = "";
        planService.sharedRideId = "";
        planService.county = "";
        planService.first_name = "";
				planService.last_name = "";
        planService.email = "";

        $rootScope.$emit('Logout');
      };

			// Is the user logged in?
			// returns true or false
			function hasKeystoneLogin () {
				return !!(
					$scope.userInfo &&
					$scope.userInfo.jwt
				);
			}

      // authentication_token is only returned if we find a user with a SharedRideId
      function isLoggedIn () {
        return !!(
          hasKeystoneLogin() &&
          $scope.userInfo.authentication_token
        );
      }

      // TODO (Drew) decide if we should stop using cookies and use local storage instead.
			// Gets the user info from Cookies
			// returns an object
			function getUserFromSession () {
				let userInfo =  {};
        sessionKeys.forEach((key) => {
          userInfo[key] = ipCookie(key);
        });

        return userInfo;
			}

      function setUserSession (sessionParams) {
        sessionKeys.forEach((key) => {
          let value = sessionParams[key];

          if (value) {
            ipCookie(key, value, {expires: 7, expirationUnit: "days"});
          } else {
            ipCookie.remove(key);
          }
        });
      }

      // --- API Calls ---

			function authenticateAccount (code) {
				return $http.post('//' + APIHOST + '/api/v3/sso/login', {code: code});
			}

      function registerAccount (jwt, registration) {
        const dob = registration.dob;

				return $http.post('//' + APIHOST + '/api/v3/sso/account_setup', { 
          jwt: jwt,
          esec: {
            confirmationMethod: registration.confirmationMethod,
            county: registration.serviceOption.countyName,
            serviceId: registration.serviceOption.serviceId,
            dob: `${dob.month}/${dob.day}/${dob.year}`,
            sharedRideId: registration.sharedRideId
            // phoneNumber: registration.phoneNumber
          } 
        });
			}

      // TODO (Drew) All these rootscope event handlers should be in the same place
      $rootScope.$on('IdleTimeout', function() {
        // The user has timed out (meaning idleDuration + timeout has passed without any activity)
        // Log the user out.
        $scope.logout();
      });
		}

    // var lastDest, lastOrigin;
    // if (loginResponse.last_destination && typeof loginResponse.last_destination !== "string" && loginResponse.last_destination.formatted_address){
    // 	lastDest = loginResponse.last_destination.formatted_address;
    // } else {
    // 	lastDest = loginResponse.last_destination || "";
    // }

    // if (loginResponse.last_origin && typeof loginResponse.last_origin !== "string" && loginResponse.last_origin.formatted_address){
    // 	lastOrigin = loginResponse.last_origin.formatted_address;
    // } else {
    // 	lastOrigin = loginResponse.last_origin || "";
    // }

    // localStorage.setItem('last_destination', lastDest);
    // localStorage.setItem('last_origin', lastOrigin);
    
    // await planService.getPastRides($http).success(function(data) {
    // 	planService.populateScopeWithTripsData($scope, planService.unpackTrips(data.data.trips, 'past'), 'past');
    // });

    // await planService.getFutureRides($http).success(function(data) {
    // 	var liveTrip = planService.processFutureAndLiveTrips(data, $scope, ipCookie);
    // 	if(liveTrip) {
    // 		$location.path('/itinerary'); // If it exists, go to itinerary page
    // 	}
    // });

    // await planService.getProfile($http).success(function(result) {
    // 	planService.profile = result.data;
    // 	if(currentPath === "/itinerary") { return; } // Don't redirect if already redirecting to Itinerary.
    // 	if(planService.to && planService.from && planService.fromDate){
    // 			$location.path('/plan/purpose');
    // 	} else {
    // 			$location.path('/plan/where');
    // 	}
    // });

    //   $scope.back = function(){
    //     $location.path('/');
    //   }

    //   // $scope.$watch('sharedRideId', function(n) {
    //   //   $('#LoginTemplate input.shared-ride-id').focus();
    //   //   return;
    //   // });
    //   // TODO (Drew) Rewrite because of ESEC
    //   $scope.authenticate = function(){
    //     var promise = $http.post('//'+APIHOST+'/api/v1/sign_in', login);
    //     promise.error(function(result) {
    //       $location.path('/login/error');
    //     });
    //     promise.then(function(result) {
    //       planService.authentication_token = result.data.authentication_token;
    //       planService.email = result.data.email;
    //       planService.first_name = result.data.first_name;
    //       planService.last_name = result.data.last_name;
    //       planService.getPastRides($http).then(function(data) {
    //         planService.populateScopeWithTripsData($scope, planService.unpackTrips(data.data.trips, 'past'), 'past');
    //       });
    //       planService.getFutureRides($http).then(function(data) {
    //         var liveTrip = planService.processFutureAndLiveTrips(data, $scope, ipCookie);

    //         if(liveTrip) {
    //           $location.path('/itinerary'); // If it exists, go to itinerary page
    //         }

    //       });
    //       var lastDest, lastOrigin;
    //       if(result.data.last_destination && typeof '' !== typeof result.data.last_destination && result.data.last_destination.formatted_address){
    //         lastDest = result.data.last_destination.formatted_address;
    //       }else{
    //         lastDest = result.data.last_destination || '';
    //       }
    //       if(result.data.last_origin && typeof '' !== typeof result.data.last_origin && result.data.last_origin.formatted_address){
    //         lastOrigin = result.data.last_origin.formatted_address;
    //       }else{
    //         lastOrigin = result.data.last_origin || '';
    //       }
    //       localStorage.setItem('last_destination', lastDest);
    //       localStorage.setItem('last_origin', lastOrigin);

    //       if($scope.rememberme == true){
    //         ipCookie('email', planService.email, {expires: 7, expirationUnit: 'days'});
    //         ipCookie('authentication_token', planService.authentication_token, {expires: 7, expirationUnit: 'days'});
    //         ipCookie('first_name', planService.first_name, {expires: 7, expirationUnit: 'days'});
    //         ipCookie('last_name', planService.last_name, {expires: 7, expirationUnit: 'days'});
    //       }else{
    //         ipCookie.remove('email');
    //         ipCookie.remove('authentication_token');
    //         ipCookie.remove('first_name');
    //         ipCookie.remove('last_name');
    //       }
    //       planService.getProfile($http).then(function(result) {
    //         planService.profile = result.data;
    //         if(currentPath === "/itinerary") { return; } // Don't redirect if already redirecting to Itinerary.
    //         if(planService.to && planService.from && planService.fromDate){
    //             $location.path('/plan/purpose');
    //         }else{
    //             $location.path('/plan/where');
    //         }
    //       });
    //       Idle.watch();
    //     });
    //   }
    // }
  ])
  .config(function(IdleProvider, KeepaliveProvider) {
    // configure Idle settings
    IdleProvider.idle(1); // in seconds
    IdleProvider.timeout(60 * 60); // in seconds
  })
  .run(function(Idle){
    // start watching when the app runs. also starts the Keepalive service by default.
    Idle.watch();
  });
