'use strict';

(function () {
    var app = angular.module("eprosesoApp", ['ngRoute', 'angular-loading-bar','angularUtils.directives.dirPagination','angular.filter', 'slugifier','ngBootbox']);
    app.config(function ($routeProvider) {
        $routeProvider
         .when("/events", {
            templateUrl: 'app/views/events/list.html',
            controller: "EventController"
        })
          .when("/events/edit/:id", {
            templateUrl: 'app/views/events/edit.html',
            controller: "EventController",
            resolve: {
                    validation: function ($q, $route) {
                        var deferred = $q.defer(),
                            id = parseInt($route.current.params.id, 10);

                        if (!isNaN(id)) {
                            deferred.resolve();
                        } else {
                            deferred.reject('VALIDATION FAILED');
                        }

                        return deferred.promise;
                    }
                }
        })
         .when("/events/add", {
            templateUrl: 'app/views/events/add.html',
            controller: "EventController"
        })
        .when("/clients", {
            templateUrl: 'app/views/clients/list.html',
            controller: "ClientController"
        })
         .when("/clients/add", {
            templateUrl: 'app/views/clients/add.html',
            controller: "ClientController"
        })
         .when("/clients/edit/:id", {
            templateUrl: 'app/views/clients/edit.html',
            controller: "ClientController",
            resolve: {
                    validation: function ($q, $route) {
                        var deferred = $q.defer(),
                            id = parseInt($route.current.params.id, 10);

                        if (!isNaN(id)) {
                            deferred.resolve();
                        } else {
                            deferred.reject('VALIDATION FAILED');
                        }

                        return deferred.promise;
                    }
                }
        })
          .when("/login", {
            templateUrl: 'app/views/login.html',
            controller: "LoginController"
        })
           .when("/logout", {
            templateUrl: 'app/views/login.html',
            controller: "LogoutController"
        })
       .when("/report", {
            templateUrl: 'app/views/clients/report.html',
            controller: "ReportController"
        })
        .otherwise({ redirectTo: "/login" });
    })
    .filter('trustAsResourceUrl', ['$sce', function($sce) {
    return function(val) {
        return $sce.trustAsResourceUrl(val);
    };
}])



}());


