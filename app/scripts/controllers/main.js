'use strict';

angular.module('applyMyRideApp')
	.controller('MainController', ['$rootScope', '$scope', '$location',
	function ($rootScope, $scope, $location) {
		// Found or created a user for the account
		if ($location.path() === '/registration/success') {
			$scope.next = function () {
				$location.path(HOMEPAGE);
			};

			$scope.logout = function () {
        $rootScope.$emit('Logout');
			};
		}
	}
]);
	