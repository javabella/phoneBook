var app = angular.module('phoneBook', ['ngRoute', 'firebase']);

app.value('fbURL', 'https://phone-book-lenin.firebaseio.com/');

app.service('fbRef', ['fbURL', function (fbURL) {
	return new Firebase(fbURL);
}]);

app.service('fbSync', ['fbRef', '$firebase', function (fbRef, $firebase) {
	return $firebase(fbRef);
}]);

app.config(['$routeProvider', function ($routeProvider) {
	$routeProvider
		.when('/', {
			templateUrl: 'view/index.html',
			controller: 'IndexCtrl'
		})
		.when('/add', {
			templateUrl: 'view/add.html',
			controller: 'AddCtrl'
		})
		.when('/contact/:cId', {
			templateUrl: 'view/add.html',
			controller: 'ContactCtrl'
		})
		.otherwise({ redirectTo: '/' });
}]);

app.controller(
	'IndexCtrl', 
	['$scope', '$rootScope', 'fbSync', 
		function ($scope, $rootScope, fbSync) {

			$scope.data = fbSync.$asArray();
			$rootScope.title = 'Контакты';
			$rootScope.pageName = 'index';

		}
	]
);

app.controller(
	'AddCtrl', 
	['$scope', '$rootScope', 'fbSync', '$location', 
		function ($scope, $rootScope, fbSync, $location) {
	
			$scope.canShow = true;
			$rootScope.title = 'Добавить контакт';
			$rootScope.pageName = 'add';

			$scope.data = fbSync.$asArray();

			
			$scope.data.$loaded().then(function (data) {
				$scope.saveContact = function() {
					data.$add({
						email : ($scope.contactEmail ? $scope.contactEmail : null),
						lastname : ($scope.contactLastName ? $scope.contactLastName : null),
						name : ($scope.contactName ? $scope.contactName : null),
						tel : ($scope.contactTel ? $scope.contactTel : null)
					}); 
				};
			});
		}
	]
);

app.controller(
	'ContactCtrl', 
	['$scope', '$rootScope', 'fbSync', '$routeParams', '$location', 
		function ($scope, $rootScope, fbSync, $routeParams, $location) {
			$scope.canShow = false;
			$rootScope.title = 'Контакт';
			$rootScope.pageName = 'contact';

			$scope.data = fbSync.$asArray();
			
			$scope.data.$loaded().then(function (data) {

				$scope.contact = data[$routeParams.cId - 1];

				if (typeof($scope.contact) == 'undefined') { 
					$location.path('/add');
				} else {

					$scope.contactName = $scope.contact.name;
					$scope.contactLastName = $scope.contact.lastname;
					$scope.contactEmail = $scope.contact.email;
					$scope.contactTel = $scope.contact.tel;

					$scope.saveContact = function() {
						$scope.contact.name = $scope.contactName ? $scope.contactName : null;
						$scope.contact.lastname = $scope.contactLastName ? $scope.contactLastName : null;
						$scope.contact.email = $scope.contactEmail ? $scope.contactEmail : null;
						$scope.contact.tel = $scope.contactTel ? $scope.contactTel : null; 

						data.$save($scope.contact); 
					};

					$scope.removeContact = function() {
						data.$remove($scope.contact); 
					};
				}
				
				$scope.canShow = true;

			});
		}
	]
);

app.controller('ShowContactCtrl', ['$scope', '$location', function ($scope, $location) {
	$scope.show = function() { 
		$location.path('/contact/' + (this.$index + 1));
	};
}]);