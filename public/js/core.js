var loginPage = angular.module('loginPage', []);

function mainController($scope, $http, $window){
    $scope.username = "";
    $scope.password = "";
    $scope.message = "";
    
    var rootURL = 'http://localhost:38080';
    //when loginButton invoke (submitLogin), start login process
    $scope.submitLogin = function(){
        $scope.message = ''; //clear message
        
        /*
        $http.get(rootURL+'/api/login/'+$scope.username+'/'+$scope.password+'/web')
        
            .success(function(data){
               
                //$scope.message = data;
                console.log('success login:' + data + '<br>');
                console.log(data);
            
                $window.location.href = '/home'; //reroute
            })
            
            .error(function(data){
                $scope.message = data;
                console.log('error login' + data);
            });
        */
        
        var data = JSON.stringify({
            username: $scope.username,
            password: $scope.password,
            mode: 'web'
        });
        
        var config = {
            headers : {
                'Content-Type': 'application/json'
            }
        }
        
        $http.post(rootURL+'/api/login', data, config)
            .success(function(data, status, header, config){
                console.log('success login:' + data + '<br>');
                console.log(data);

                $window.location.href = '/home'; //reroute

            })
            
            .error(function(data){
                $scope.message = data;
                console.log('error login' + data);
            });
    };
    
    $scope.submitLoginMobile = function(){
        $scope.message = ''; //clear message
        
        $http.get(rootURL+'/api/login/'+$scope.username+'/'+$scope.password+'/mobile')
            .success(function(data){
                
                //$scope.message = data;
                console.log('success login' + data + '<br>');
                console.log(data);
            
                //$window.location.href = '/home'; //reroute
            })
            
            .error(function(data){
                $scope.message = data;
                console.log('error login' + data);
            });
    };
}