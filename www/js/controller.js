angular.module('starter.controllers', ['ionic'])

.controller('MapCtrl', ['$scope', 'MyYelpAPI', function($scope, $cordovaGeolocation, MyYelpAPI) {
// Code will be here
  // $scope.businesses = [];
  // MyYelpAPI.retrieveYelp('', 'San+Francisc', function(data) {
  //     $scope.businesses = data.businesses;
  //     console.log($scope.businesses);
  // });
  var posOptions = {timeout: 10000, enableHighAccuracy: false};
  $cordovaGeolocation
    .getCurrentPosition(posOptions)
    .then(function (position) {
      var lat  = position.coords.latitude
      var long = position.coords.longitude
    }, function(err) {
      // error
    });


  var watchOptions = {
    timeout : 3000,
    enableHighAccuracy: false // may cause errors if true
  };

  var watch = $cordovaGeolocation.watchPosition(watchOptions);
  watch.then(
    null,
    function(err) {
      // error
    },
    function(position) {
      var lat  = position.coords.latitude
      var long = position.coords.longitude
  });


  watch.clearWatch();

}]).factory("MyYelpAPI", function($http) {
  return {
    "retrieveYelp": function(name, location, callback) {
      var method = 'GET';
      var url = 'http://api.yelp.com/v2/search';
      var params = {
        callback: 'angular.callbacks._0',
        location: location,
        oauth_consumer_key: 'jav4PWJJXDTcDxnj_8iV8g', //Consumer Key
        oauth_token: 'kqN1AqyCR10HImtusXMbu2yeEGNf7L6R', //Token
        oauth_signature_method: "HMAC-SHA1",
        oauth_timestamp: new Date().getTime(),
        oauth_nonce: randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'),
        limit: 10
      };
      var consumerSecret = 'nhousV-f_M_DFH5q7l0rqFb_vQE'; //Consumer Secret
      var tokenSecret = 'YSJOlxzGtYF5LtRWobyF1Cr5FZE'; //Token Secret
      var signature = oauthSignature.generate(method, url, params, consumerSecret, tokenSecret, { encodeSignature: false});
      params['oauth_signature'] = signature;
      $http.jsonp(url, {params: params}).success(callback);
    }
  }
})


.directive('map', function(MyYelpAPI) {
    return {
      restrict: 'A',
      link:function(scope, element, attrs){

        var zValue = scope.$eval(attrs.zoom);
        var lat = scope.$eval(attrs.lat);
        var lng = scope.$eval(attrs.lng);
        // var businesses = MyYelpAPI.retrieveYelp('', attrs.location, function(data)).data.businesses;

        var myLatlng = new google.maps.LatLng(lat,lng),
        mapOptions = {
              zoom: zValue,
              center: myLatlng
        },
        map = new google.maps.Map(element[0],mapOptions);
        // console.log(businesses);
      }
    };
})

// .controller('BusinessCtrl', ['$scope', 'MyYelpAPI', function($scope, MyYelpAPI) {
//   $scope.businesses = [];
//   MyYelpAPI.retrieveYelp('', function(data) {
//       $scope.businesses = data.businesses;
//       console.log($scope.businesses);
//   });
//
// }]).factory("MyYelpAPI", function($http) {
//   return {
//     "retrieveYelp": function(name, callback) {
//       var method = 'GET';
//       var url = 'http://api.yelp.com/v2/search';
//       var params = {
//         callback: 'angular.callbacks._0',
//         location: 'San+Francisc',
//         oauth_consumer_key: 'jav4PWJJXDTcDxnj_8iV8g', //Consumer Key
//         oauth_token: 'kqN1AqyCR10HImtusXMbu2yeEGNf7L6R', //Token
//         oauth_signature_method: "HMAC-SHA1",
//         oauth_timestamp: new Date().getTime(),
//         oauth_nonce: randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'),
//       };
//       var consumerSecret = 'nhousV-f_M_DFH5q7l0rqFb_vQE'; //Consumer Secret
//       var tokenSecret = 'YSJOlxzGtYF5LtRWobyF1Cr5FZE'; //Token Secret
//       var signature = oauthSignature.generate(method, url, params, consumerSecret, tokenSecret, { encodeSignature: false});
//       params['oauth_signature'] = signature;
//       $http.jsonp(url, {params: params}).success(callback);
//     }
//   }
// });

function randomString(length, chars) {
  var result = '';
  for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
  return result;
}
