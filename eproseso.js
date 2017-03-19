'use strict';

(function () {
    var app = angular.module("eprosesoApp", ['ngRoute', 'angular-loading-bar','angularUtils.directives.dirPagination','angular.filter']);
    app.config(function ($routeProvider) {
        $routeProvider
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
        .otherwise({ redirectTo: "/clients" });

     

    });
}());
