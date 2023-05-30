'use strict';

// TODO (Drew) Remove unused dependencies
angular.module('applyMyRideApp')
  .controller('LoginController', ['$scope', '$rootScope', '$location', 'flash', 'planService', '$http', 'ipCookie', '$window', 'localStorageService', 'util', 'Idle',
    function ($scope, $rootScope, $location, flash, planService, $http, ipCookie, $window, localStorageService, util, Idle) {
      const currentPath = $location.path();
      // The keys of all the cookies for the app
      const sessionKeys = [
        'jwt',
        'refresh_token', 
        'account_type', 
        'authentication_token', 
        'sharedRideId', 
        'county', 
        'first_name', 
        'last_name', 
        'email'
      ];

      // skip initializing this controller if we're not on the page
      if ( ['/login', '/login/error', '/registration', '/registration/error'].indexOf(currentPath) === -1) { return; }

      // Check for login
      // if logged in, no need to re-authenticate

      // --- Login Path ---
			// This is where we get redirected to by the backend with an authentication code
      // If code is present, then attempt to authenticate with otherwise redirect error page
      if (currentPath === '/login') {
        if ($rootScope.getLoginState() > 0) {
          // TODO (Drew)
        }

        const code = $location.search().code;
        if (!code) { $location.path('/login/error'); return; }
        
        authenticateAccount(code)
          .then(function (resp) {
            $location.search('');
            setUserSession(resp.data);
            login();
            const loginState = $rootScope.getLoginState();

            // If user is a business partner or cwopa, they go to the admin site.
            if ($rootScope.redirectNonCitizens(loginState)) { return; }

            // If logged in, and account is setup, redirect to new trip page.
            switch ($rootScope.getLoginState()) {
              case 0:
                $location.path('/login/error');
                $window.location = '/#' + $location.path();
                break;
              case 1:
                $location.path('/registration');
                $window.location = '/#' + $location.path();
                break;
              case 2:
                $location.path(HOMEPAGE);
                $window.location = '/#' + $location.path();
                break;
            }

            return;
          })
          .catch(function (err) {
            $rootScope.clearData();
            $location.path('/login/error');
            $window.location = '/#' + $location.path();
          });

        return;
      }

      // --- Login Error Path ---
			// This is where we get redirected to if there was no auth code during login
      // or if the login itself faild somehow.
      if (currentPath === '/login/error') {
        $scope.back = function () {
          $scope.logout();
        };
      }

      // --- Account Setup Path ---
      // TODO (Drew) rename path
      // Keystone login was not matched with an existing user. So we need more
      // information in order to find one.
      if (currentPath === '/registration') {
        if (!$rootScope.userInfo.jwt) { $location.path('/login/error'); return; }
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

        // TODO (Drew) Remove || true
        // Only get counties if they haven't already been loaded
        if (!existingServiceOptions || true) {
          util.getCounties(function (countyServices) {
            let options = countyServices.sort(function (a,b) { 
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
          const { confirmationMethod, serviceOption, sharedRideId, dob } = $scope.registration;
          let isReady = false;

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
            // Phone Numbers are no longer planned
            // case 'phoneNumber':
            //   isReady = !!(county && phoneNumber);
            //   break;
          }

          $scope.registration.formReady = isReady;
        };

        $scope.submitRegistration = function () {
          let registrationPromise = registerAccount($rootScope.userInfo.jwt, $scope.registration);
          registrationPromise.success((resp) => {
            setUserSession(resp);
            $scope.login();
            $location.path('/registration/success');
          });
          registrationPromise.error((err) => {
            $location.path('/registration/error');
          });
        };

        $scope.back = function () {
          $scope.logout();
        };
      }

      // --- Account Setup Error Path ---
      // Most likely we couldn't find a matching user in exolane's database to
      // link the new account to. Or the account we did find was already claimed
      if (currentPath === '/registration/error') {
        $scope.back = function () {
          $location.path('/registration');
        };
      }

      // --- Generic Functions ---
      $scope.login = login;
      function login () {
        const userInfo = $rootScope.getUserFromCookies();
        $rootScope.userInfo = userInfo;

        // TODO (Drew) just Having userInfo should be good enough
        // change other depenencies
        $scope.email = userInfo.email;
        $scope.first_name = userInfo.first_name;
        $scope.last_name = userInfo.last_name;
        $scope.full_name = [$scope.first_name, $scope.last_name].join(' ');

        planService.authentication_token = userInfo.authentication_token;
				planService.sharedRideId = userInfo.sharedRideId;
        planService.email = userInfo.email;
        planService.county = userInfo.county;
				planService.first_name = userInfo.first_name;
				planService.last_name = userInfo.last_name;
      }

      // TODO (Drew) We'll need to make an API call
      $scope.logout = function () {
        $scope.user_Info = {};
        $scope.email = undefined;
        $scope.first_name = undefined;
        $scope.last_name = undefined;
        $scope.full_name = undefined;

        planService.authentication_token = '';
        planService.sharedRideId = '';
        planService.county = '';
        planService.first_name = '';
				planService.last_name = '';
        planService.email = '';

        $rootScope.$emit('Logout');
      };

      function isLoggedIn () {
        return !!(
          $rootScope.KeystoneLogin() &&
          $rootScope.userInfo.authentication_token
        );
      }

      function setUserSession (sessionParams) {
        sessionKeys.forEach((key) => {
          let value = sessionParams[key];
          if (key === 'authentication_token') { key = 'authentication_token'; }

          if (value) {
            ipCookie(key, value, {expires: 7, expirationUnit: 'days'});
          } else {
            ipCookie.remove(key);
          }
        });
      }

      // --- API Calls ---

			async function authenticateAccount (code, attempt=1) {
        let authResponse;
        const max_attempts = 1;
        authResponse = await $http.post(apiUrl('/api/v3/sso/login').toString(), {code: code})
                                  .catch(function (error) {
                                    if (attempt < max_attempts) {
                                      return authenticateAccount(code, attempt+1);
                                    } else {
                                      return error;
                                    }
                                  });

        if (authResponse.status >= 400) { throw authResponse; }
        return authResponse;
			}

      function registerAccount (jwt, registration) {
        const dob = registration.dob;

				return $http.post(apiUrl('/api/v3/sso/account_setup').toString(), { 
          jwt: jwt,
          esec: {
            confirmationMethod: registration.confirmationMethod,
            county: registration.serviceOption.countyName,
            serviceId: registration.serviceOption.serviceId,
            dob: `${dob.month}/${dob.day}/${dob.year}`,
            sharedRideId: registration.sharedRideId
          } 
        });
			}

      // TODO (Drew) All these rootScope event handlers should be in the same place
      // The user has timed out (meaning idleDuration + timeout has passed without any activity)
      // Log the user out.
      $rootScope.$on('IdleTimeout', function () {
        $scope.logout();
      });
		}
  ])
  .config(function (IdleProvider, KeepaliveProvider) {
    // configure Idle settings
    IdleProvider.idle(1); // in seconds
    IdleProvider.timeout(60 * 60); // in seconds
  })
  .run(function (Idle) {
    // start watching when the app runs. also starts the Keepalive service by default.
    Idle.watch();
  });
