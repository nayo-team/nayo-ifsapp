var homePage = angular.module('homePage', []);

function homeController($scope, $http, $window){
      
    //var rootURL = 'http://localhost:38080';
	var rootURL = 'http://192.169.255.134:38080';
    
	//Login Status
    $scope.getLoginStatus = function(){
        $scope.loginStatus = ''; //clear message
        
        $http.get(rootURL+'/api/login/status')
            .success(function(data){
               
                //$scope.message = data;
                console.log('success getLoginStatus:' + data + '<br>');
                console.log(data);
				
				$scope.loginStatus = data;
            })
            
            .error(function(data){
                $scope.message = data;
                console.log('error getLoginStatus :');
				console.log(data);
				
				$scope.loginStatus = data;
            });
    };
    
    $scope.submitLogout = function(){
               
        $http.get(rootURL+'/api/logout')
            .success(function(data){
                
                //$scope.message = data;
                console.log('successfully logout' + data + '<br>');
                console.log(data);
            
                $window.location.href = '/login'; //reroute
            })
            
            .error(function(data){
                $scope.message = data;
                console.log('error logout');
				console.log(data);
            });
    };
}