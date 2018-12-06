angular.module('starty', ['ngRoute'] ).
	config(function ($routeProvider, $locationProvider){
		//$locationProvider.html5Mode(true);
		$routeProvider
        .when('/', { templateUrl: 'pages/main.html'
		})
        .when('/gauss', { templateUrl: 'pages/ftdt.html' })
        .when('/well', { templateUrl: 'pages/well.html' })
		.otherwise({redirectTo:'/'});
	})

function AppCtrl($scope){
	$scope.crew = [
		{ name: "Adrian", description: "Me"},
		{ name: "Dominik", description: "Brother"},
		{ name: "Sebastian", description: "Brother"},
	];
}
