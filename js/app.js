var FoursquareAPI = function(distance, placesCount, lat, lon, ) {
	this.distance = distance;
	this.placesCount = placesCount;
	this.lat = lat;
	this.lon = lon;
	
	this.nearCoffeeShopsUrl = "https://api.foursquare.com/v2/venues/explore/?ll="+lat+","+lon+"&radius="+distance+"&query=coffee&limit="+placesCount+"&isOpen=1&venuePhotos=1&section=food&client_id=YZQZP1Q2HEJWMD5ZVBMIQD3VSZC1W4BQCCQTVFEPJWNHL0RK&client_secret=ORHPL2VKKHUTB3KTJVDTB4D20AXBRCFKWVL12EPQNJNDFYBX&v=20131124";
	this.places=[];
	this.getAllCoffeeShops = function() {
		$.ajax({
			url: this.nearCoffeeShopsUrl,
			dataType: 'application/json',
			context: this,
			complete: function(data){
				this.places = JSON.parse(data.responseText).response.groups[0].items;
				this.sortPlacesByDistance();
				this.displayList();
				console.log(JSON.parse(data.responseText).response.groups[0].items);
			},
			success: function(data){
				console.log(JSON.parse(data.responseText).response.groups[0].items);
				this.places = JSON.parse(data.responseText).response.groups[0].items;
				
			},
			error: function(data) {
				
			}
		});
	}
	
	this.displayList = function() {
		$("#coffeePlacesList").children().remove()
		var places = this.places;
		for (var i = 0;i<places.length;i++) {
			var img = places[i].venue.featuredPhotos.items[0].prefix + places[i].venue.featuredPhotos.items[0].width+"x"+places[i].venue.featuredPhotos.items[0].height+ places[i].venue.featuredPhotos.items[0].suffix;
			$("#coffeePlacesList").append("<a href='shop_details.html'><li><div class='fh5co-food-desc listItem'><figure><img src="+img+" class='img-responsive' alt='X'></figure><div><h3>"+places[i].venue.name+"</h3></div></div><div class='fh5co-food-pricing'>Distance: "+places[i].venue.location.distance/1000+"km</div></li></a>");
		}
	}
	
	this.sortPlacesByDistance = function() {
		this.places.sort(function(a, b){
			 if (a.venue.location.distance<b.venue.location.distance)
				return -1;
			  if (a.venue.location.distance>b.venue.location.distance)
				return 1;
			  return 0;
		});
		this.displayList();
	}
	
	this.sortPlacesByExpensiveness = function() {
		this.places.sort(function(a, b){
			return a.venue.location.distance-b.venue.location.distance;
		});
		this.displayList();
	}
}
var curretntCoffeePlace;
var CoffeePlace = function(name, image, distance) {
	this.name = name;
	this.image = image;
	this.distance = distance;
	
}
var fApi;
function init() {
	navigator.geolocation.getCurrentPosition(locationSuccess, locationFail);
}
var latitude;
var longitude;
function locationSuccess(position) {
    latitude = position.coords.latitude;
	longitude = position.coords.longitude;
	fApi = new FoursquareAPI(10000, 10, latitude, longitude);
	fApi.getAllCoffeeShops();
	$("#sortDistance").on("mousedown", function(){
		console.log("gere");
		fApi.sortPlacesByDistance();
	});
}

function locationFail() {
    $('#myModal').modal('show');
	
}