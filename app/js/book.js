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

app.config(
	['$routeProvider', 'fileUploadProvider',  
		function ($routeProvider, fileUploadProvider) {
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
	['$scope', '$rootScope', 'fbSync', '$location', '$http', 'uploadOptions',
		function ($scope, $rootScope, fbSync, $location, $http, uploadOptions) {
	
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


            $scope.loadingFiles = true;
            $http.get('server/php/')
                .then(
                    function (response) {
                        $scope.loadingFiles = false;
                        $scope.queue = response.data.files;
                    },
                    function () {
                        $scope.loadingFiles = false;
                    }
                );


            $scope.getQueue = function(q) {
            	$scope.curQueue = q;
            };

            $('#fileupload').bind('fileuploadadd', function (e, data) {
            	if ($scope.curQueue.length > 0) {
            		$scope.curQueue[0].$cancel();
            	}
            });

            $('#fileupload').bind('fileuploaddone', function (e, data) {
            	$scope.curQueue.length = 0;
            	$scope.contactNewImg = data.result.files[0].name;
            });


		}
	]
);

app.controller(
	'ContactCtrl', 
	['$scope', '$rootScope', 'fbSync', '$routeParams', '$location', 'uploadOptions',
		function ($scope, $rootScope, fbSync, $routeParams, $location, uploadOptions) {
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
					$scope.contactImg = $scope.contact.img;

					$scope.contactNewImg = $scope.contactImg;

					$scope.saveContact = function() {
						$scope.contact.name = $scope.contactName ? $scope.contactName : null;
						$scope.contact.lastname = $scope.contactLastName ? $scope.contactLastName : null;
						$scope.contact.email = $scope.contactEmail ? $scope.contactEmail : null;
						$scope.contact.tel = $scope.contactTel ? $scope.contactTel : null; 
						$scope.contact.img = $scope.contactNewImg ? $scope.contactNewImg : $scope.contactImg;

						data.$save($scope.contact); 
					};

					$scope.removeContact = function() {
						data.$remove($scope.contact); 
					};
				}
				
				$scope.canShow = true;

			});

			$scope.getQueue = function(q) {
            	$scope.curQueue = q;
            };

            $('#fileupload').bind('fileuploadadd', function (e, data) {
            	if ($scope.curQueue.length > 0) {
            		$scope.curQueue[0].$cancel();
            	}
            	data.submit();
            });

            $('#fileupload').bind('fileuploaddone', function (e, data) {
            	$scope.curQueue.length = 0;
            	$scope.contactNewImg = data.result.files[0].name;
            });
		}
	]
);

app.controller('ShowContactCtrl', ['$scope', '$location', function ($scope, $location) {
	$scope.show = function() { 
		$location.path('/contact/' + (this.$index + 1));
	};
}]);