'use strict';

(function () {
    var eprosesoApp = angular.module("eprosesoApp");
    //var jq = $.noConflict();
   

    


    var LoginController = function ($scope,ClientService, $http, $routeParams,$location,$timeout)
    {

        //common error function
      var onError = function (error) {
            $scope.error = error.data;
        };

     
     $scope.clients_expired_list = []; //declare an empty array
         $http.get("/clients/expired").success(function(response){
              console.log(response); 
                $scope.clients_expired_list =  response;
                 angular.forEach($scope.clients_expired_list, function(value, key){
                      $http.put("/clients/expired/update",{"application_id":value._id}).then(
                        function(response){ 
                       } 
                    ,onError);

                });
        });

        ClientService.logout = true;
       $http.post("/is_login/").then(
                function(response){
                  if(response.data !== null && response.data.is_login =="yes"){
                      ClientService.logout = false;
                      $scope.isHide=  false;
                      $location.path('/clients');

                  }
                 
                } 
            ,onError);

       $scope.isHide=  ClientService.logout;

   
      $scope.loginSubmit =  function(){
        
        $http.post("/login/check",{"username":$scope.username,"password":$scope.password}).then(
                function(response){
                  if(response.data){
                   
                    $http.put("/login").then(
                                    function(response){
                                      $location.path('/clients');
                                    }
                                ,onError);
                  }else{
                    window.alert("Invalid username and password!");
                  }
                } 
            ,onError);
      };


   
    }
    eprosesoApp.controller('LoginController', LoginController);

}());

