'use strict';

(function () {
    var eprosesoApp = angular.module("eprosesoApp");
    var jq = $.noConflict();



    // eprosesoApp.value('clientId', { value: 'gg'} );

         eprosesoApp.factory('ClientService', function() {
        return {
            pending : '',
            renewal : '',
            application_id:'',
            cid:'',
            logout:''
        };
    });

  
    var ClientController = function ($scope,ClientService, $http, $routeParams,$location,$timeout,$ngBootbox, $sce)
    {
    	$scope.working = 'Angular is Working';
        //common error function
    	var onError = function (error) {
            $scope.error = error.data;
        };
        //end error function

        ClientService.logout = false;

         
       $scope.currentProjectUrl = $sce.trustAsResourceUrl("http://ec2-54-186-5-126.us-west-2.compute.amazonaws.com/report/view.php");
      
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
       

        
      /*    if(localStorageService.isSupported) {
           console.log("supported");
          }

         if(typeof localStorageService.get("login") === 'undefined'){
            $location.path('/login');
          }


          function clearAll() {
         return localStorageService.clearAll();
        }
          $scope.logout=  function(){
             clearAll();
             console.log(":clear");
             $location.path('/login');
          };*/
        
         $scope.$on('$routeChangeError', function (ev, current, previous, rejection) {
            if (rejection === 'VALIDATION FAILED') {
              $location.path('/clients');
            
                
            }
        });

          
        $scope.clients_expired_list = []; //declare an empty array
         $http.get("/clients/expired").success(function(response){ 
                $scope.clients_expired_list =  response;
                //console.log(response);


                 angular.forEach($scope.clients_expired_list, function(value, key){
                    console.log(value._id);
                      $http.put("/clients/expired/update",{"application_id":value._id}).then(
                        function(response){ 
                        //renewal list
                        //console.log(response);
                        } 
                    ,onError);

                });
        });


         $scope.next_disabled =true;
         $scope.checkRequirements = function(num){
            if($scope.requirement1 && $scope.requirement2 && $scope.requirement3 && $scope.requirement4){
                $scope.next_disabled = false;
            }else{
                $scope.next_disabled =true;
            }
         };

         $scope.getID = function(id,cid,vcode){
           ClientService.application_id = id;
           ClientService.cid = cid;
           $http.put("/healthcard/application",{"cid":ClientService.cid,"application_id":ClientService.application_id}).then(
                function(response){
                    //$scope.client = null;//response.data;
                   // refresh();
                 // console.log(response.data)
                } 
            ,onError);
         };

         $scope.getClientID = function(id){
           ClientService.application_id = id;
           $scope.requirement1 = "false";
           $scope.requirement2 = "false";
           $scope.requirement3 = "false";
           $scope.requirement4 = "false";
           $scope.checkedRequirements="false";
           $scope.next_disabled= "true";
           jq('#verification_code').val("");
           jq('#verification_code').parent().parent().removeClass("has-error");
           jq('#verification_code').next().css("display","none");

           jq('#verify-client').modal({
                show: 'false'
            }); 

         };

        
         $scope.selectClientPending = function(id,lastname,firstname){
           ClientService.pending = id;
         };

         $scope.checkedRequirements = true;
         $scope.verifyNext =  function(){
            $scope.checkedRequirements = false;
            jq('.message-alert').empty();
         };
           var load_clients = function(){


           $scope.clients_pending_list = []; //declare an empty array
        $scope.pending_list = [];
        $scope.pending_list2 = [];
            $http.get("/clients/pending").success(function(response){ 
                $scope.clients_pending_list =  response;
                //console.log($scope.clients_pending_list);
                var ctr = 0;
                 angular.forEach($scope.clients_pending_list, function(value, key){
                   
                                //console.log(value.application_id);
                                $http.get('/client/' + value.application_id).then(
                                    function(response2){
                                        $scope.pending_list.push(response2.data);
                                    }
                                , onError);
                    
                           // console.log($scope.pending_list);
                            ctr++;
                   

                });

            });
            $scope.sortpending = function(keyname){
                $scope.sortKey = keyname;   //set the sortKey to the param passed
                $scope.reverse = !$scope.reverse; //if true make it false and vice versa
            }

            $scope.clients_approved_list = []; //declare an empty array
            $http.get("/clients/approved").success(function(response){ 
                $scope.clients_approved_list = response;  //ajax request to fetch data into $scope.data
            });
            $scope.sortapproved = function(keyname){
                $scope.sortKey = keyname;   //set the sortKey to the param passed
                $scope.reverse = !$scope.reverse; //if true make it false and vice versa
            }

            

          $scope.clients_renewal_list = []; //declare an empty array
          $http.get("/clients/renewal").success(function(response){ 
                $scope.clients_renewal_list = response;  //ajax request to fetch data into $scope.data
            });
            $scope.sortrenewal = function(keyname){
                $scope.sortKey = keyname;   //set the sortKey to the param passed
                $scope.reverse = !$scope.reverse; //if true make it false and vice versa
            }

        };
           


         $scope.verifySubmit= function(){
            var error_verify = false;
            jq('.message-alert').empty();
            if(jq("#verification_code").val().length > 0){
                jq("#verification_code").parent().parent().removeClass("has-error");
                jq(".vc-help").css("display","none");
            }else{
                error_verify = true;
                jq("#verification_code").parent().parent().addClass("has-error");
                jq(".vc-help").text("Please enter Verification Code");
                jq(".vc-help").css("display","block");
            }


            if(error_verify == false){
               
                $http.get('/healthcard/'+ClientService.application_id)
                .then(function(res){
                    console.log(res.data.verification_code);
                   if($scope.verification_code == res.data.verification_code){
                        jq("#verification_code").parent().parent().removeClass("has-error");
                        jq(".vc-help").css("display","none");


                            var date_expired = new Date();
                            var dd = date_expired.getDate();
                            var mm = date_expired.getMonth()+1; //January is 0!
                            var yyyy = date_expired.getFullYear() + 1;
                            var yy = date_expired.getFullYear();
                            if(dd<10) {
                                dd='0'+dd;
                            } 
                            if(mm<10) {
                                mm='0'+mm;
                            } var mm_text = "";
                            if(mm == 1) {
                                mm_text ="Jan";
                            }else if(mm == 2) {
                                mm_text ="Feb";
                            }else if(mm == 3) {
                                mm_text ="Mar";
                            }else if(mm == 4) {
                                mm_text ="Apr";
                            }else if(mm == 5) {
                                mm_text ="May";
                            }else if(mm == 6) {
                                mm_text ="Jun";
                            }else if(mm == 7) {
                                mm_text ="Jul";
                            }else if(mm == 8) {
                                mm_text ="Aug";
                            }else if(mm == 9) {
                                mm_text ="Sep";
                            }else if(mm == 10) {
                                mm_text ="Oct";
                            }else if(mm == 11) {
                                mm_text ="Nov";
                            }else if(mm == 12) {
                                mm_text ="Dec";
                            }
                            var date_expired_number = yyyy+mm+dd;
                            var date_expired_text = mm_text+"-"+dd+"-"+yyyy;
                            var d = mm_text+"-"+dd+"-"+yy;
                            var m = mm_text;
                            var y = yy;
                            var verification_code = $scope.verification_code;
                            var gid =1;
                            if(res.data.hc_sex=="female"){
                              gid= 0;
                            }
                            var hid = yy + "-"+mm+verification_code+dd+"-"+gid;

                            var client_data = {
                                                "_id":ClientService.application_id,
                                                "date_expired_number":date_expired_number,
                                                "date_expired_text":date_expired_text,
                                                "d":d,
                                                "m":m,
                                                "y":y,
                                                "hid":hid
                                               };

                            $http.put("/client/approved/", client_data).then(
                                    function(response){
                                      
                                    }
                                ,onError);


                             var healthcard_data = {
                                                "application_id":ClientService.application_id,
                                               };
                            $http.put("/healthcard/approved/", healthcard_data).then(
                                function(response){
                                     jq('.message-alert').append('<div class="callout callout-success"> <h4>Client has been successfully verified.</h4> </div>');
                                    
                                    $timeout(function(){
                                        load_clients();
                                        jq('#verify-client .close').trigger("click"); 
                                    }, 2500);

                                    
                                    
                                }
                            ,onError);

                       }else{
                            jq("#verification_code").parent().parent().addClass("has-error");
                            jq(".vc-help").text("Invalid Verification Code");
                            jq(".vc-help").css("display","block");
                       }
                    
                });


            }
                
           /*if($scope.verification_code){
            window.alert($scope.verification_code);
           }else{
            window.alert("Please enter verification code.");
           }*/
         };

        

        var isValidEmailAddress = function (emailAddress) {
              var pattern = /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
              return pattern.test(emailAddress);
          };

         $scope.getClientRenew = function(id){
            jq('.message-alert-renew').empty();
            ClientService.renew = id;
             $http.get('/client/renew/'+ClientService.renew).then(
                function(response){
                        $scope.client_renew = response.data;
                       jq("#r_lastname").val(response.data.lastname);
                       jq("#r_firstname").val(response.data.firstname);
                       jq("#r_gender").val(response.data.gender);
                       jq("#r_birthday").val(response.data.birthday);
                       jq("#r_age").val(response.data.age);
                       jq("#r_civilstatus").val(response.data.status);
                       jq("#r_residence").val(response.data.address);
                       jq("#r_ioe_name").val(response.data.ioe_name);
                       jq("#r_ioe_relation").val(response.data.ioe_relation);
                       jq("#r_ioe_address").val(response.data.ioe_address);
                       jq("#r_ioe_contact").val(response.data.ioe_contact);
                        //console.log($scope.client_renew);
                            $http.get('/healthcard/'+id)
                                    .then(function(res){
                                       $scope.healthcard_renew = res.data;
                                       jq("#r_job_category").val(res.data.hc_job_category);
                                       jq("#r_job_position").val(res.data.hc_position);
                                       jq("#r_business_employment").val(res.data.hc_business_employment);
                                       jq("#r_middlename").val(res.data.hc_middlename);
                                       jq("#r_age").val(res.data.hc_age);
                                       jq("#r_ethnic_group").val(res.data.hc_ethnic_group);
                                    });
                        
                }
            , onError);
         };

          $scope.renewSubmit= function(){
            jq('.message-alert-renew').empty();

              var has_error_edit = false;

         /*   jq('.form-renew .form-control').each(function(item){
                if(jq(this).val().length > 0){
                  jq(this).parent().parent().removeClass("has-error");
                }else{
                    jq(this).parent().parent().addClass("has-error");
                    has_error_edit = true;
                }   
            });
*/          

            jq('.form-renew .form-control').each(function(i, item){
      
                          if(jq('.form-renew .form-control').eq(i).val() !=''){
                            jq(this).parent().parent().removeClass("has-error");
                          }else{
                              jq(this).parent().parent().addClass("has-error");
                              has_error_edit = true;
                          }   
                      });

            if(has_error_edit === false){

           

            var date_expired = new Date();
            var dd = date_expired.getDate();
            var mm = date_expired.getMonth()+1; //January is 0!
            var yyyy = date_expired.getFullYear() + 1;
            if(dd<10) {
                dd='0'+dd;
            } 
            if(mm<10) {
                mm='0'+mm;
            }
            var mm_text = "";
            if(mm == 1) {
                mm_text ="Jan";
            }else if(mm == 2) {
                mm_text ="Feb";
            }else if(mm == 3) {
                mm_text ="Mar";
            }else if(mm == 4) {
                mm_text ="Apr";
            }else if(mm == 5) {
                mm_text ="May";
            }else if(mm == 6) {
                mm_text ="Jun";
            }else if(mm == 7) {
                mm_text ="Jul";
            }else if(mm == 8) {
                mm_text ="Aug";
            }else if(mm == 9) {
                mm_text ="Sep";
            }else if(mm == 10) {
                mm_text ="Oct";
            }else if(mm == 11) {
                mm_text ="Nov";
            }else if(mm == 12) {
                mm_text ="Dec";
            }
            var date_expired_number = yyyy+mm+dd;
            var date_expired_text = mm_text+"-"+dd+"-"+yyyy;


                var client_data = {
                    _id : ClientService.renew,
                    lastname: jq("#r_lastname").val(),
                    firstname: jq("#r_firstname").val(),
                    gender: jq("#r_gender").val(),
                    birthday: jq("#r_birthday").val(),
                    status : jq("#r_civilstatus").val(),
                    address : jq("#r_residence").val(),
                    ioe_name : jq("#r_ioe_name").val(),
                    ioe_relation: jq("#r_ioe_relation").val(),
                    ioe_address :jq("#r_ioe_address").val(),
                    ioe_contact :jq("#r_ioe_contact").val(),
                    date_expired_text: date_expired_text,
                    date_expired_number: date_expired_number
            };


            var healthcard_data = {
                application_id : ClientService.renew,
                hc_job_category : jq("#r_job_category").val(),
                hc_position : jq("#r_job_position").val(),
                hc_business_employment: jq("#r_business_employment").val(),
                hc_middlename : jq("#r_middlename").val(),
                hc_age : jq("#r_age").val(),
                hc_ethnic_group: jq("#r_ethnic_group").val(),
                hc_lastname : jq("#r_lastname").val(),
                hc_firstname : jq("#r_firstname").val(),
                hc_sex : jq("#r_gender").val(),
                hc_civilstatus : jq("#r_civilstatus").val(),
                hc_icoe_name  : jq("#r_ioe_name").val(),
                hc_icoe_relation: jq("#r_ioe_relation").val(),
                hc_icoe_address : jq("#r_ioe_address").val(),
                hc_icoe_contact_number : jq("#r_ioe_contact").val()
            };

            if (window.confirm("Are you sure you want to renew?")) { 

            $http.put("/client/renew/update/", client_data).then(
                function(response){
                  
                }
            ,onError);
            $http.put("/healthcard/renew/update/", healthcard_data).then(
                function(response){
                   load_clients();
                   jq('#renew-client .close').trigger("click"); 

                   /*jq('.message-alert-renew').append('<div class="callout callout-success"> <h4>Client has been successfully renewed.</h4> </div>');
                                    $timeout(function(){
                                        load_clients();
                                        jq('#renew-client .close').trigger("click"); 
                                    }, 2500);*/
                }
            ,onError);

          }

         }else{
          window.alert("Please enter all fields.");
         }

         };

       


              //get all clients
        var refresh = function(){
            $http.get('/clients').then(
                function(response){
                    $scope.clients = response.data;
                }
            , onError);
        };


        var getAge = function (dateString) {
		        var today = new Date();
		        var birthDate = new Date(dateString);
		        var age = today.getFullYear() - birthDate.getFullYear();
		        var m = today.getMonth() - birthDate.getMonth();
		        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
		            age--;
		        }
		        return age;
    		};

  

         //get clients by Id
        $scope.searchclient = function(id){
            $http.get('/client/' + id).then(
                function(response){
                    $scope.client = response.data;
                    $location.path('/clients');
                }
            , onError);
        };

        var getClient = function(id){

             $http.get('/client/'+id).then(
                function(response){
                    if(response.data.status=="invalid"){
                        $location.path('/clients');
                        $scope.client = null;
                    }else{
                        $scope.client = response.data;
                        $scope.lastname2 = response.data.lastname;
                        $scope.firstname2 = response.data.firstname;
                        var birthday = response.data.birthday,
                            bday = birthday.split("-");
                            $scope.bmonth= bday[0];
                            $scope.bday= bday[1];
                            $scope.byear= bday[2];
                        $http.get('/healthcard/'+id)
                                .then(function(res){
                                   $scope.healthcard = res.data;
                                  
                                  var cedula = res.data.hc_cedula_date_issued,
                                      cday = cedula.split("-");
                                      $scope.cmonth= cday[0];
                                      $scope.cday= cday[1];
                                      $scope.cyear= cday[2];
                                      console.log(response.data.hc_cedula_date_issued);

                                  var orday = res.data.hc_OR_fee_number_date_issued,
                                      oday = orday.split("-");
                                      $scope.ormonth= oday[0];
                                      $scope.orday= oday[1];
                                      $scope.oryear= oday[2];
                                      var age = "";
                                      if(res.data.hc_age==""){
                                      	$scope.healthcard.hc_age = getAge(birthday);	
                                      }

                                });
                    }
                }
            , onError);
        };


        var isEmail = function (emailAddress) {
            var pattern = /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
            return pattern.test(emailAddress);
        }


    /*  $scope.url = 'http://ec2-54-186-5-126.us-west-2.compute.amazonaws.com/report/view.php';
       $scope.$watch('url', function () {
        $scope.parser.href = $scope.url;
    });
    $scope.init = function () {
  
        $scope.parser = document.createElement('a');
        $scope.url = window.location;

        $('#openColorbox p').click(function (e) {
              window.alert('k');
            $.colorbox({
                inline: true,
                height: "400px",
                width: "400px",
                href: "div#colorboxContent"
            });

        });

        $("#colorboxCloseBtn").click(function () {
            $.colorbox.close();
        });
    }
     $scope.init();*/

   /*  $('#openColorbox a').click(function (e) {
      //e.preventDefault();

         //window.alert("k");
            $.colorbox({
                iframe: true,
                height: "400px",
                width: "400px",
                href: "div#colorboxContent"
            });
         
         $.colorbox({iframe:true, width:"90%", height:"90%"});

        });
*/

     
        if($location.url()=="/clients"){
             //refresh();
              load_clients();

              

        }else if($location.url()=="/clients/add"){
            $scope.client = null;

        }else{
            //Get ID out of current URL
            $scope.cid = $routeParams.id;
            getClient($scope.cid);
        }
        
        $scope.next_id= 1;
        $http.post('/clients/count')
            .then(function(response){
                $scope.next_id = response.data + 1;
            });
        var next_id = function(){
            $http.post('/clients/count')
                .then(function(response){
                    $scope.next_id = response.data + 1;
                    $scope.client = null;

                });
            };


       
       // $('#civilstatus').

        //add new client
        $scope.addClient = function(client,healthcard){
            var date_expired = new Date();
            var dd = date_expired.getDate();
            var mm = date_expired.getMonth()+1; //January is 0!
            var yyyy = date_expired.getFullYear() + 1,
                yy = date_expired.getFullYear();
            if(dd<10) {
                dd='0'+dd;
            } 
            if(mm<10) {
                mm='0'+mm;
            }
            var mm_text = "";
            if(mm == 1) {
                mm_text ="Jan";
            }else if(mm == 2) {
                mm_text ="Feb";
            }else if(mm == 3) {
                mm_text ="Mar";
            }else if(mm == 4) {
                mm_text ="Apr";
            }else if(mm == 5) {
                mm_text ="May";
            }else if(mm == 6) {
                mm_text ="Jun";
            }else if(mm == 7) {
                mm_text ="Jul";
            }else if(mm == 8) {
                mm_text ="Aug";
            }else if(mm == 9) {
                mm_text ="Sep";
            }else if(mm == 10) {
                mm_text ="Oct";
            }else if(mm == 11) {
                mm_text ="Nov";
            }else if(mm == 12) {
                mm_text ="Dec";
            }
            //var date_expired_number = yyyy+mm+dd;
            var date_expired_number = yyyy+mm+dd;
            var date_expired_text = mm_text+"-"+dd+"-"+yyyy;
            var d = mm_text+"-"+dd+"-"+yy;
            var m = mm_text;
            var y = yy;
            var y_id = yy.toString().substr(-2);
            var verification_code = Math.floor(1000 + Math.random() * 9000);
            var gid =1;
            if(client.gender=="female"){
              gid= 0;
            }
            var hid = y_id + "-"+mm+verification_code+dd+"-"+gid;

            var has_error = false;
            jq('.form-control').each(function(item){
                if($(this).val().length > 0){
                  $(this).parent().parent().removeClass("has-error");
                }else{
                    $(this).parent().parent().addClass("has-error");
                    has_error = true;
                }   
            });

       /*if(jq('.content').hasClass("client-add")){
          jq('#civilstatus [value="? undefined:undefined ?"]').remove();
       }*/

      if(jq('#civilstatus').val()=='? undefined:undefined ?'){
        jq('#civilstatus').parent().parent().addClass("has-error");
        has_error = true;
      }else{
         jq('#civilstatus').parent().parent().removeClass("has-error");
      }

     if(jq("input[name='gender']:checked").val() == undefined){
        jq(".txt-gender").addClass("has-error");
        has_error = true;
     }else{
        jq(".txt-gender").removeClass("has-error");
     }

      if(isValidEmailAddress(jq("#email").val())){
        jq('#email').parent().parent().removeClass("has-error");
        jq('.txt-email').css("display","none");
      }else{
        jq('#email').parent().parent().addClass("has-error");
        jq('.txt-email').css("display","block");
        has_error = true;
      }

      var is_bday = false,
          bday = "",
          cday = "",
          orday = "",
          age = "";
        jq('.bd, .dd').each(function(item){
                if($(this).val() == "0"){
                  $(this).css("border-color","#dd4b39");
                    has_error = true;
                }else{
                    $(this).css("border-color","#d2d6de"); 
                    is_bday = true;
                }   
            });
      if(is_bday == true){
        bday = jq("#bd-month").val()+"-"+jq("#bd-day").val()+"-"+jq("#bd-year").val();
        cday = jq("#c-month").val()+"-"+jq("#c-day").val()+"-"+jq("#c-year").val();
        orday = jq("#or-month").val()+"-"+jq("#or-day").val()+"-"+jq("#or-year").val();
      
         if(parseInt(jq("#age").val()) <= 17){
            has_error = true;
            jq('#age').parent().parent().addClass("has-error");
            jq('.txt-age').css("display","block");
         }else{
          jq('#age').parent().parent().removeClass("has-error");
          jq('.txt-age').css("display","none");
          age = jq("#age").val();
         }
      }







           
            if(has_error === false){

                var client_data = {
                "id":$scope.next_id,
                "username" : "",
                "password" : "",
                "password_confirm" : "",
                "firstname":client.firstname,
                "lastname":client.lastname,
                //"middlename":healthcard.middlename,
                "email":client.email,
                "nickname":client.nickname,
                "gender":client.gender,

                "birthday":bday,
                "status":client.civilstatus,
                "nationality":client.nationality,
                "contact":client.contactno,
                "address":client.residence,
                "note":"",
                
                "ioe_name":client.icoe_name,
                "ioe_relation":client.icoe_relation,
                "ioe_address":client.icoe_address,
                "ioe_contact":client.icoe_contactno,

                "ioe_establishment":"n/a",
                "profile_picture":"",
                "account_status":"approved",
                "type":"Walk-in",
                 "__v":0,
                "date_expired_text":date_expired_text,
                "date_expired_number":parseInt(date_expired_number),
                "d":d
            };

            var healthcard_data = {
                "cid" : $scope.next_id,
                "hc_lastname" : client.lastname,
                "hc_firstname" : client.firstname,
                "hc_middlename" : healthcard.middlename,
                "hc_age" : age,
                "hc_sex" : client.gender,
                "hc_civilstatus" : client.civilstatus,
                "hc_nationality" : client.nationality,
                "hc_cedula" : healthcard.cedula,
                "hc_cedula_date_issued" : cday,
                "hc_OR_fee_number" : healthcard.or_fee_no,
                "hc_OR_fee_number_date_issued" : orday,
                "hc_icoe_name" : client.icoe_name,
                "hc_icoe_relation": client.icoe_relation,
                "hc_icoe_address" : client.icoe_address,
                "hc_icoe_contact_number" : client.icoe_contactno,
                "hc_business_employment" : healthcard.business_employment,
                "hc_job_category" : healthcard.job_category,
                "hc_position": healthcard.job_position,
                "hc_ethnic_group" : healthcard.ethnic_group,
                "request_status" : "approved",
                "verification_code": "0000",
                "hc_contact": client.contactno,
                "application_id": "",
                "d":d,
                "m":m,
                "y":y,
                "hid":hid
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

                                      $http.post("/clients/check",{lastname:client.lastname, firstname:client.firstname}).then(
                                        function(response){
                                    
                                          if(response.data !== null){
                                            $('#lastname,#firstname').parent().parent().addClass("has-error");
                                             window.alert("Name already exists, Please enter a new name.");

                                          }else{
                                              $http.post('/client/add', client_data).then(
                                        function(response){
                                            $scope.client = response.data;
                                            next_id();
                                        }
                                    , onError);

                                        $http.post('/healthcard/add', healthcard_data).then(
                                            function(response){
                                                $scope.healthcard = response.data;
                                                next_id();
                                                 $location.path('/clients');
                                            }
                                        , onError);

                                          }
                                         
                                        } 
                                    ,onError);




                                 }
                             }
                        }
                    };
                  $ngBootbox.customDialog(options);


 
               

          







            }else{
                //window.alert("Please enter all fields.");

                $ngBootbox.alert('Please enter all fields.');

            }
                

           
            
        };
        //end add new client

        //delete client
        $scope.deleteClient = function(id){
            $http.delete('/client/delete/' + id)
                .then(onclientDeleteCompleted,  onError);
            console.log(id);
        };

        var onclientDeleteCompleted = function(response){
            $scope.client = response.data;
            refresh();
        };
        //end delete client

        //update client
        $scope.updateClient = function(client,healthcard){
            jq('.msg-alert').empty();
              var has_error_edit = false;

            $('.client-edit .form-control').each(function(item){
                if($(this).val().length > 0){
                  $(this).parent().parent().removeClass("has-error");
                }else{
                    $(this).parent().parent().addClass("has-error");
                    has_error_edit = true;
                }   
            });

             if(isValidEmailAddress(jq("#email").val())){
                jq('#email').parent().parent().removeClass("has-error");
                jq('.txt-email').css("display","none");
              }else{
                jq('#email').parent().parent().addClass("has-error");
                jq('.txt-email').css("display","block");
               has_error_edit = true;
              }


            var is_bday = false,
            bday = "",
            age = "",
            cday = "",
            orday = "";
            jq('.bd, .dd').each(function(item){
                    if($(this).val() == "0"){
                      $(this).css("border-color","#dd4b39");
                        has_error_edit = true;
                    }else{
                        $(this).css("border-color","#d2d6de"); 
                        is_bday = true;
                    }   
                });
          if(is_bday == true){
            bday = jq("#bd-month").val()+"-"+jq("#bd-day").val()+"-"+jq("#bd-year").val();
            cday = jq("#c-month").val()+"-"+jq("#c-day").val()+"-"+jq("#c-year").val();
            orday = jq("#or-month").val()+"-"+jq("#or-day").val()+"-"+jq("#or-year").val();
             
             if(parseInt(jq("#age").val()) <= 17){
                has_error_edit = true;
                jq('#age').parent().parent().addClass("has-error");
                jq('.txt-age').css("display","block");
             }else{
              jq('#age').parent().parent().removeClass("has-error");
              jq('.txt-age').css("display","none");
               age = jq('#age').val();
             }
          }


            if(has_error_edit === false){

              client.birthday = bday;

               healthcard.lastname = client.lastname;
                healthcard.firstname = client.firstname;
                healthcard.hc_age  = age;
                healthcard.hc_cedula_date_issued = cday;
                healthcard.hc_OR_fee_number_date_issued = orday;
                healthcard.gender  = client.gender;
                healthcard.civilstatus = client.status;
                healthcard.nationality = client.nationality;
                healthcard.ioe_name = client.ioe_name;
                healthcard.ioe_relation = client.ioe_relation;
                healthcard.ioe_address = client.ioe_address;
                healthcard.ioe_contact = client.ioe_contact;
                //window.alert(client.lastname);





            if(jq('#lastname2').val() == jq('#lastname').val() && jq('#firstname2').val() == jq('#firstname').val()){


                var options = {
                        message: 'Are you sure you want to update?',
                        buttons: {
                             warning: {
                                 label: "No",
                                 className: "btn-danger"
                             },
                             success: {
                                 label: "Yes",
                                 className: "btn-success",
                                 callback: function() { 
                    
                                    $http.put("/client/update/", client).then(
                                      function(response){
                                        
                                      }
                                  ,onError);

                                      $http.put("/healthcard/update/", healthcard).then(
                                      function(response){
                                           
                                          jq('.msg-alert').append('<div class="alert alert-success alert-dismissible"> <button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button> <h4><i class="icon fa fa-check"></i> Successfully updated.</h4> </div> ');

                                         jq('html, body').animate({
                                              scrollTop: jq(".header-name").offset().top
                                          }, 1000);

                                      }
                                  ,onError);


                                 }
                             }
                        }
                    };
                  $ngBootbox.customDialog(options);




            }else if((jq('#lastname2').val() == jq('#lastname').val() && jq('#firstname2').val() != jq('#firstname').val()) || (jq('#firstname2').val() == jq('#firstname').val() && jq('#lastname2').val() != jq('#lastname').val())){
              

               $http.post("/clients/check",{lastname:client.lastname, firstname:client.firstname}).then(
                function(response){
            
                  if(response.data !== null){
                    $('#lastname,#firstname').parent().parent().addClass("has-error");
                     window.alert("Name already exists, Please enter a new name.");

                  }else{

                   
                     
                     var options = {
                        message: 'Are you sure you want to update?',
                        buttons: {
                             warning: {
                                 label: "No",
                                 className: "btn-danger"
                             },
                             success: {
                                 label: "Yes",
                                 className: "btn-success",
                                 callback: function() { 

                                    $http.put("/client/update/", client).then(
                function(response){
                  
                }
            ,onError);

                $http.put("/healthcard/update/", healthcard).then(
                function(response){
                     
                    jq('.msg-alert').append('<div class="alert alert-success alert-dismissible"> <button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button> <h4><i class="icon fa fa-check"></i> Successfully updated.</h4> </div> ');

                   jq('html, body').animate({
                        scrollTop: jq(".header-name").offset().top
                    }, 1000);

                }
            ,onError);
                

                                 }
                             }
                        }
                    };
                  $ngBootbox.customDialog(options);


                    

            

                    


                  }
                 
                } 
            ,onError);

            }

            }else{
                $ngBootbox.alert('Please enter all fields.');
            }
            
        };

    /*  $scope.viewReport = function(){
          $http.post

      };*/

      $scope.viewReportBy = function(){
        window.alert("k");
      };

     

    }
    eprosesoApp.controller('ClientController', ClientController);

}());

