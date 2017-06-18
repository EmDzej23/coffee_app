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
			var element = $("<li><div class='fh5co-food-desc listItem'><figure><img src="+img+" class='img-responsive' alt='X'></figure><div><h3>"+places[i].venue.name+"</h3></div></div><div class='fh5co-food-pricing'>Distance: "+places[i].venue.location.distance/1000+"km</div></li>");
			$("#coffeePlacesList").append(element);
			$(element).attr("id",places[i].venue.id);
			$(element).attr("distance",places[i].venue.location.distance);
			$(element).on("mousedown",function(){
				postdata($(this).attr("id")+":"+$(this).attr("distance"));
			});
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
			 if (a.venue.price.tier<b.venue.price.tier)
				return -1;
			  if (a.venue.price.tier>b.venue.price.tier)
				return 1;
			  return 0;
		});
		this.displayList();
	}
}
var curretntCoffeePlace;
var CoffeePlace = function(id) {
	this.id = id;
	this.url = "https://api.foursquare.com/v2/venues/"+this.id+"?oauth_token=FM4AMWEDSK1VINMVKDUDYN3IBZ1HDMTJS4W0RKU1IDHAJL2X&v=20170618";
	this.imagesUrl = "https://api.foursquare.com/v2/venues/"+this.id+"/photos?oauth_token=FM4AMWEDSK1VINMVKDUDYN3IBZ1HDMTJS4W0RKU1IDHAJL2X&v=20170618&limit=10";
	this.place={};
	this.photos=[];
	this.tips=[];
	this.getCoffeeShop = function() {
		$.ajax({
			url: this.url,
			dataType: 'application/json',
			context: this,
			complete: function(data){
				console.log(JSON.parse(data.responseText));
				this.place = JSON.parse(data.responseText).response.venue;
				this.tips = this.place.tips.groups[this.place.tips.groups.length-1].items;
				$("#coffeeTitle").text(this.place.name);
				$("#priceDetails").text("Price: "+this.place.price.message);
				$("#distanceDetails").text("Destination: "+window.location.search.split(":")[1]/1000+"km");
				this.appendTips();
			},
			success: function(data){
				console.log(JSON.parse(data.responseText));
				this.place = JSON.parse(data.responseText).response.venue;
				
			},
			error: function(data) {
				
			}
		});
	}
	this.getPhotos = function() {
		$.ajax({
			url: this.imagesUrl,
			dataType: 'application/json',
			context: this,
			complete: function(data){
				console.log(JSON.parse(data.responseText));
				this.photos = JSON.parse(data.responseText).response.photos.items;
				this.appendToGalery ();
			},
			success: function(data){
				console.log(JSON.parse(data.responseText));
				this.photos = JSON.parse(data.responseText).response.photos.items;
			},
			error: function(data) {
				
			}
		});
	}
	this.appendToGalery = function() {
		var photos = this.photos;
		var active;
		for (var i = 0;i<photos.length;i++) {
			active = "";
			if (i==0) {
				active = "active";
			}
			var img = photos[i].prefix + photos[i].width+"x"+photos[i].height+ photos[i].suffix;
			$("#slideshow").append('<div class="item '+active+'"><img src='+img+' alt="Los Angeles" style="width:100%;"></div>');
			$("#indicators").append('<li data-target="#myCarousel" data-slide-to='+i+' class='+active+'></li>')
			$("#headerSlider").append('<li style="background-image: url('+img+');" data-stellar-background-ratio="0.5"></li>');
		}
	  
	}
	this.appendTips = function() {
		var tips = this.tips;
		for (var i = 0;i<tips.length;i++) {
			if (tips[i].text.toUpperCase.indexOf("COFFEE")>=0) {
				var img = tips[i].photourl;
				img = (img==undefined)?"template/images/home_page_background.png":img;
				var element = $("<li><div class='fh5co-food-desc listItem'><figure><img src="+img+" class='img-responsive' alt='X'></figure><div><h3>"+tips[i].text+"</h3></div></div><div class='fh5co-food-pricing'>Likes: "+tips[i].likes.count+"</div></li>");
				$("#coffeeTips").append(element);
				if ($("#coffeeTips").text()!="") $("#coffeeTips").text("");
			}
		}
	}
}
var fApi;
function init() {
	loadForm();
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
		fApi.sortPlacesByDistance();
	});
	$("#sortPrice").on("mousedown", function(){
		fApi.sortPlacesByExpensiveness();
	});
}

function locationFail() {
    $('#myModal').modal('show');
	
}

function populateDetailsForCoffeePlace() {
	curretntCoffeePlace = new CoffeePlace(window.location.search.substring(1).split(":")[0]);
	curretntCoffeePlace.getCoffeeShop();
	curretntCoffeePlace.getPhotos();
	
}

function loadForm(){

  var form = document.createElement("form");
  //form.target = uniqueString;
    form.name = "RespDataForm";
  form.method = "POST";

  var input = document.createElement("input");
  input.type = "hidden";
  input.name = "RespDataInput";

  form.appendChild(input);

  document.body.appendChild(form);
}

function postdata(id) {
	var form1 = document.getElementsByName("RespDataForm")[0];
	console.log(form1.name);
	var input1 = document.getElementsByName("RespDataInput")[0];
	input1.value = id;
	form1.action = 'shop_details.html?'+id;
	form1.submit();
	return false;
}