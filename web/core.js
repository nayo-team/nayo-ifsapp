var loginPage = angular.module('loginPage', []);

function mainController($scope, $http, $window){
    $scope.username = "";
    $scope.password = "";
    $scope.message = "";
    
    var rootURL = 'http://localhost:38080';
    //when loginButton invoke (submitLogin), start login process
    $scope.submitLogin = function(){
        $scope.message = ''; //clear message
        
        $http.get(rootURL+'/api/login/'+$scope.username+'/'+$scope.password+'/web')
            .success(function(data){
               $window.location.href = '/home';
               //$scope.message = data;
               console.log('success login' + data + '<br>');
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
               $window.location.href = '/home';
               //$scope.message = data;
               console.log('success login' + data + '<br>');
            })
            
            .error(function(data){
                $scope.message = data;
                console.log('error login' + data);
            });
    };
}