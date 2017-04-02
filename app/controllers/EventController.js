'use strict';

(function () {
    var eprosesoApp = angular.module("eprosesoApp");
    //var jq = $.noConflict();

    var EventController = function ($scope,Slug, ClientService, $http, $routeParams,$location,$timeout,$ngBootbox)
    {

        //common error function
      var onError = function (error) {
            $scope.error = error.data;
        };

         $scope.clients_expired_list = []; //declare an empty array
         $http.get("/clients/expired").success(function(response){ 
                $scope.clients_expired_list =  response;
                console.log(response);
                 angular.forEach($scope.clients_expired_list, function(value, key){
                      $http.put("/clients/expired/update",{"application_id":value._id}).then(
                        function(response){ 
                       } 
                    ,onError);

                });
        });


       ClientService.logout = false;
        $http.post("/is_login/").then(
                function(response){
                  
                  if(response.data !== null && response.data.is_login =="no"){
                      $location.path('/login');
                      ClientService.logout = true;
                      $scope.isHide = ClientService.logout;
                  }
                 
                } 
            ,onError);
        $scope.isHide = ClientService.logout;


         
         var load_events = function(){
          $scope.events = []; //declare an empty array
           $http.get("/events").success(function(response){ 
                $scope.events = response;  //ajax request to fetch data into $scope.data
             // console.log(response);
            });
            $scope.sortevent = function(keyname){
                $scope.sortKey = keyname;   //set the sortKey to the param passed
                $scope.reverse = !$scope.reverse; //if true make it false and vice versa
            };

         };

          var getEvent = function(id){

             $http.get('/event/'+id).then(
                function(response){
                    if(response.data.status=="invalid"){
                        $location.path('/events');
                        $scope.event = null;
                    }else{
                        $scope.event = response.data;
                        $scope.title = $scope.event.title;
                        $scope.date = $scope.event.date;
                        $scope.location = $scope.event.location;
                        $scope.tinymceModel = $scope.event.description;
                        
                    }
                }
            , onError);
        };
             
              /*$scope.tinymceOptions = {
                plugins: 'link image code',
                //toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | code'
              };*/

               $scope.next_id= 1;
        $http.post('/events/count')
            .then(function(response){
                $scope.next_id = response.data + 1;
            });
        var next_id = function(){
            $http.post('/events/count')
                .then(function(response){
                    $scope.next_id = response.data + 1;
                    $scope.client = null;

                });
            };

              $scope.addEvent = function(event){
                var has_error = false;
                   if($("#title").val().length > 0){
                      $("#title").parent().parent().removeClass("has-error");
                    }else{
                        $("#title").parent().parent().addClass("has-error");
                        has_error = true;
                    }   

                    if($("#date").val().length > 0){
                      $("#date").parent().parent().removeClass("has-error");
                    }else{
                        $("#date").parent().parent().addClass("has-error");
                        has_error = true;
                    }  

                    if($("#location").val().length > 0){
                      $("#location").parent().parent().removeClass("has-error");
                    }else{
                        $("#location").parent().parent().addClass("has-error");
                        has_error = true;
                    }  

                  if(has_error== false){
                    $scope.slug= Slug.slugify(event.title);

                 
                    // For todays date;
                    Date.prototype.today = function () { 
                        return ((this.getDate() < 10)?"0":"") + this.getDate() +"/"+(((this.getMonth()+1) < 10)?"0":"") + (this.getMonth()+1) +"/"+ this.getFullYear();
                    }

                    // For the time now
                    Date.prototype.timeNow = function () {
                         return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes();
                    }

                    var newDate = new Date();
                    var datetime = newDate.today() + " " + newDate.timeNow();
                  


                    var event_data = {
                        "id" : $scope.next_id,
                        "title" : event.title,
                        "date" : event.date,
                        "location" : event.location,
                        "slug" : $scope.slug,
                        "description":$scope.tinymceModel,
                        "date_created":datetime,
                        "date_modified":datetime
                    };


                var options = {
                message: 'Are you sure you want to add?',
                buttons: {
                     warning: {
                         label: "No",
                         className: "btn-danger"
                     },
                     success: {
                         label: "Yes",
                         className: "btn-success",
                         callback: function() { 
                            $http.post('/events/add', event_data).then(
                              function(response){
                                next_id();
                                  $location.path('/events');
                              }
                          , onError);
                         }
                     }
                }
            };
          $ngBootbox.customDialog(options);



                    // if (window.confirm("Are you sure you want to add?")) { 
                   
                  // }

                  }

              };

              $scope.editEvent = function(event){
                var has_error = false;
                   if($("#title").val().length > 0){
                      $("#title").parent().parent().removeClass("has-error");
                    }else{
                        $("#title").parent().parent().addClass("has-error");
                        has_error = true;
                    }   

                     if($("#date").val().length > 0){
                      $("#date").parent().parent().removeClass("has-error");
                    }else{
                        $("#date").parent().parent().addClass("has-error");
                        has_error = true;
                    }  

                    if($("#location").val().length > 0){
                      $("#location").parent().parent().removeClass("has-error");
                    }else{
                        $("#location").parent().parent().addClass("has-error");
                        has_error = true;
                    }  

                  if(has_error== false){
                    $scope.slug= Slug.slugify(event.title);

                 
                    // For todays date;
                    Date.prototype.today = function () { 
                        return ((this.getDate() < 10)?"0":"") + this.getDate() +"/"+(((this.getMonth()+1) < 10)?"0":"") + (this.getMonth()+1) +"/"+ this.getFullYear();
                    }

                    // For the time now
                    Date.prototype.timeNow = function () {
                         return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes();
                    }

                    var newDate = new Date();
                    var datetime = newDate.today() + " " + newDate.timeNow();

                    var event_data = {
                        "_id" : $scope.id,
                        "title" : event.title,
                        "date" : event.date,
                        "location" : event.location,
                        "slug" : $scope.slug,
                        "description":$scope.tinymceModel,
                        "date_modified":datetime
                    };
                     
                      var options = {
                        message: 'Are you sure you want to delete?',
                        buttons: {
                             warning: {
                                 label: "No",
                                 className: "btn-danger"
                             },
                             success: {
                                 label: "Yes",
                                 className: "btn-success",
                                 callback: function() { 

                                     $http.put('/event/update', event_data).then(
                                function(response){
                                    $location.path('/events');
                                }
                            , onError);
                                 }
                             }
                        }
                    };
                  $ngBootbox.customDialog(options);
          

                    

                   }

               

              };

               $scope.deleteEvent = function(id){


                 var options = {
                message: 'Are you sure you want to delete?',
                buttons: {
                     warning: {
                         label: "No",
                         className: "btn-danger"
                     },
                     success: {
                         label: "Yes",
                         className: "btn-success",
                         callback: function() { 

                            $http.delete('/event/delete/' + id)
                              .then(function(){
                                load_events();
                              },  onError);

                         }
                     }
                }
            };
          $ngBootbox.customDialog(options);
            
    
            };


             $scope.$on('$routeChangeError', function (ev, current, previous, rejection) {
                  if (rejection === 'VALIDATION FAILED') {
                    $location.path('/events');
                  }
              });

              if($location.url()=="/events"){
                  load_events();
            }else if($location.url()=="/events/add"){
                $scope.event = null;

            }else{
                //Get ID out of current URL
                $scope.id = $routeParams.id;
                getEvent($scope.id);
            }

 



   
    }
    eprosesoApp.controller('EventController', EventController);

}());

