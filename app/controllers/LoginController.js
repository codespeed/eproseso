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

       /* $scope.logout= function(){
          return true;
        };*/
        


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

       
    /*      //defined
          if(typeof localStorageService.get("login") !== 'undefined'){
            $location.path('/clients');
          }

            $scope.isLogin = localStorageService.get("login");


         $scope.logout=  function(){
             clearAll();
             $location.path('/login');
          };

        function clearAll() {
         return localStorageService.clearAll();
        }*/

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

