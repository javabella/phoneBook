var app = angular.module('phoneBook', ['ngRoute', 'firebase']);

app.value('fbURL', 'https://phone-book-lenin.firebaseio.com/');

app.service('fbRef', function (fbURL) {
	return new Firebase(fbURL)
});

app.service('fbSync', function (fbRef, $firebase) {
	return ($firebase(fbRef))
});

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
		.otherwise({ redirectTo: '/' });
}]);

app.controller('IndexCtrl', function ($scope, $rootScope, fbSync) {

	$scope.data = fbSync.$asArray();
	console.log($scope.data);

	$scope.title = 'Контакты';
	$rootScope.title = 'Контакты';
	$rootScope.pageName = 'index';

});

app.controller('AddCtrl', function ($scope, $rootScope, clickController) {
	$scope.title = 'Контакт';
	$rootScope.title = 'Контакт';
	$rootScope.pageName = 'add';
});
