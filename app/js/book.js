var app = angular.module('phoneBook', ['ngRoute', 'firebase', 'blueimp.fileupload']);

app.value('fbURL', 'https://phone-book-lenin.firebaseio.com/');

app.service('fbRef', ['fbURL', function (fbURL) {
	return new Firebase(fbURL);
}]);

app.service('fbSync', ['fbRef', '$firebase', function (fbRef, $firebase) {
	return $firebase(fbRef);
}]);

app.service('uploadOptions', ['$rootScope', function ($rootScope) {
	$rootScope.options = {
		url: 'server/php/',
		previewMaxWidth: 198,
		previewMaxHeight: 198
	};

	return $rootScope.options;
}]);

app.factory('loadFilesWatcher', ['$http', function ($http) {
	return function(scope){
		scope.loadingFiles = true;
		$http.get('server/php/')
			.then(
				function (response) {
					scope.loadingFiles = false;
					scope.queue = response.data.files;
				},
				function () {
					scope.loadingFiles = false;
				}
			);
	};
}]);

app.factory('queueWatcher', ['uploadOptions', function (uploadOptions){
	return function(scope) {
		scope.getQueue = function(q) {
			scope.curQueue = q;
		};

		$('#fileupload').bind('fileuploadadd', function (e, data) {
			if (scope.curQueue.length > 0) {
				scope.curQueue[0].$cancel();
			}
			data.submit();
		});

		$('#fileupload').bind('fileuploaddone', function (e, data) {
			scope.curQueue.length = 0;
			scope.con.contactNewImg = data.result.files[0].name;
		});
	};
}])

app.config(
	['$routeProvider', 'fileUploadProvider', '$httpProvider', 
		function ($routeProvider, fileUploadProvider, $httpProvider) {
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

			delete $httpProvider.defaults.headers.common['X-Requested-With'];
			angular.extend(fileUploadProvider.defaults, {
				disableImageResize: /Android(?!.*Chrome)|Opera/
					.test(window.navigator.userAgent),
				maxFileSize: 5000000,
				acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i
				
			});
		}
	]
);

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
	['$scope', '$rootScope', 'fbSync', '$location', 'loadFilesWatcher', 'queueWatcher',
		function ($scope, $rootScope, fbSync, $location, loadFilesWatcher, queueWatcher) {
	
			$scope.canShow = true;
			$rootScope.title = 'Добавить контакт';
			$rootScope.pageName = 'add';

			$scope.data = fbSync.$asArray();

			$scope.con = {
				contactName : '',
				contactLastName : '',
				contactEmail : '',
				contactTel : ''
			};

			$scope.data.$loaded().then(function (data) {
				$scope.saveContact = function() {
					data.$add({
						email : ($scope.con.contactEmail ? $scope.con.contactEmail : null),
						lastname : ($scope.con.contactLastName ? $scope.con.contactLastName : null),
						name : ($scope.con.contactName ? $scope.con.contactName : null),
						tel : ($scope.con.contactTel ? $scope.con.contactTel : null),
						img : ($scope.con.contactNewImg ? $scope.con.contactNewImg : null)
					}); 
					$location.path('/');
				};
			});

			loadFilesWatcher($scope);
			queueWatcher($scope);
		}
	]
);

app.controller(
	'ContactCtrl', 
	['$scope', '$rootScope', 'fbSync', '$routeParams', '$location', 'queueWatcher', 'loadFilesWatcher',
		function ($scope, $rootScope, fbSync, $routeParams, $location, queueWatcher, loadFilesWatcher) {
			$scope.canShow = false;
			$rootScope.title = 'Контакт';
			$rootScope.pageName = 'contact';

			$scope.data = fbSync.$asArray();

			loadFilesWatcher($scope);
			queueWatcher($scope);
			
			$scope.data.$loaded().then(function (data) {

				$scope.contact = data[$routeParams.cId - 1];

				if (typeof($scope.contact) == 'undefined') { 
					$location.path('/add');
				} else {
					$scope.con = {
						contactName : $scope.contact.name,
						contactLastName : $scope.contact.lastname,
						contactEmail : $scope.contact.email,
						contactTel : $scope.contact.tel,
						contactNewImg : $scope.contact.img
					};

					$scope.saveContact = function() {
						$scope.contact.name = $scope.con.contactName ? $scope.con.contactName : null;
						$scope.contact.lastname = $scope.con.contactLastName ? $scope.con.contactLastName : null;
						$scope.contact.email = $scope.con.contactEmail ? $scope.con.contactEmail : null;
						$scope.contact.tel = $scope.con.contactTel ? $scope.con.contactTel : null; 
						$scope.contact.img = $scope.con.contactNewImg ? $scope.con.contactNewImg : null;

						data.$save($scope.contact); 
						$location.path('/');
					};

					$scope.removeContact = function() {
						data.$remove($scope.contact); 
						$location.path('/');
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