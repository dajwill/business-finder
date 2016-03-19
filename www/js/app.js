// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', ['ionic', 'ngCordova'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

app.config(function ($httpProvider) {
  $httpProvider.defaults.headers.common = {};
  $httpProvider.defaults.headers.post = {};
  $httpProvider.defaults.headers.put = {};
  $httpProvider.defaults.headers.patch = {};
});

app.controller('MapController', function($scope, $cordovaGeolocation, $ionicLoading, $http) {
  ionic.Platform.ready(function(){
    $ionicLoading.show({
        template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Acquiring location!'
    });

    var posOptions = {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0
    };

    $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
        var lat  = position.coords.latitude;
        var long = position.coords.longitude;
        var stringLatLong =lat +', ' + long
        $scope.businesses = []
        console.log(stringLatLong);
        var myLatlng = new google.maps.LatLng(lat, long);

        function findBusinesses(location){
          params = {
            v: 20130815,
            client_id: 'J5L2S0TPCFBV44DGYMFEODW51QFXSDLQ5Q15LYGGGC3YJEXR',
            client_secret: 'WH2NYJE0VNIP2J3MR5SPOWTWNRP2LC4FXP4ZKLT3QFPMFKPF',
            limit: 10,
            ll: location
          };
          $http.get('https://api.foursquare.com/v2/venues/explore', {params: params}).success(function(response){
            $scope.businesses = []
            angular.forEach(response.response.groups[0].items, function(item) {
              $scope.businesses.push(item.venue)
              item.venue.distance = calculateDistance(item.venue)
              console.log(item.venue)
            })
            console.log($scope.businesses);
          });
        }

        var businessMarkers = []

        function getBusinessMarkers(businesses) {
          angular.forEach(businesses, function(business) {
            var businessMarker = new google.maps.Marker({
              map: map,
              animation: google.maps.Animation.DROP,
              position: {lat: business.location.lat, lng: business.location.lng}
            });
            businessMarkers.push(businessMarker);
          })
        }

        function removeBusinessMarkers() {
          angular.forEach(businessMarkers, function(marker) {
            marker.setMap(null);
          })
        }

        function calculateDistance(venue) {
          var userPos = {
            lat: userLocation.position.lat(),
            lng: userLocation.position.lng()
          };
          var userPos = new google.maps.LatLng(userLocation.position.lat(), userLocation.position.lng())
          console.log($scope.businesses);
          var businessPos = new google.maps.LatLng(venue.location.lat, venue.location.lng)
          var distance = google.maps.geometry.spherical.computeDistanceBetween(userPos, businessPos)*0.000621371192;
          return distance
        }

        var mapOptions = {
            center: myLatlng,
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        var map = new google.maps.Map(document.getElementById("map"), mapOptions);

        userLocation = new google.maps.Marker({
          map: map,
          draggable: true,
          animation: google.maps.Animation.DROP,
          position: {lat: lat, lng: long}

        });
        findBusinesses(stringLatLong)
        getBusinessMarkers($scope.businesses)

        // marker.addListener('click', toggleBounce);
        userLocation.addListener('dragend', function(e){
          lat = e.latLng.lat()
          long = e.latLng.lng()
          console.log(lat)
          console.log(long)
          stringLatLong =lat +', ' + long
          console.log('Foursquare request');
          findBusinesses(stringLatLong)
          // businessMarkers = []
          removeBusinessMarkers()
          getBusinessMarkers($scope.businesses)
        })
        $scope.map = map;
        $ionicLoading.hide();
    }, function(err) {
        $ionicLoading.hide();
        console.log(err);
    });
  })
});

app.factory("YelpAPI", function($http) {
  return {
    "retrieveYelp": function(latLong, callback) {
      var method = 'GET';
      var url = 'http://api.yelp.com/v2/search';
      var params = {
        callback: 'angulat_callback.0',
        // location: location,
        ll: latLong,
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

function randomString(length, chars) {
  var result = '';
  for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
  return result;
}
