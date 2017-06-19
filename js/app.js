var fApi;
var curretntCoffeePlace;

var FoursquareAPI = function(distance, placesCount, lat, lon) {
	this.distance = distance;
	this.placesCount = placesCount;
	this.lat = lat;
	this.lon = lon;
	
	this.nearCoffeeShopsUrl = "https://api.foursquare.com/v2/venues/explore/?ll="+lat+","+lon+"&radius="+distance+"&section=coffee&query=coffee&limit="+placesCount+"&openNow=1&venuePhotos=1&section=food&client_id=YZQZP1Q2HEJWMD5ZVBMIQD3VSZC1W4BQCCQTVFEPJWNHL0RK&client_secret=ORHPL2VKKHUTB3KTJVDTB4D20AXBRCFKWVL12EPQNJNDFYBX&v=20131124";
	this.places=[];
	this.getAllCoffeeShops = function() {
		$.ajax({
			url: this.nearCoffeeShopsUrl,
			dataType: 'json',
			context: this,
			success: function(data){
				$("#loading").remove();
				$("#coffeePlacesList").text("");
				this.places = data.response.groups[0].items;
				this.sortPlacesByDistance();
				this.displayList();
			},
			error: function(data) {
				console.log(data);
				showModal("Error",data.statusText);
				$("#loading").remove();
			}
		});
	}
	
	this.displayList = function() {
		$("#coffeePlacesList").children().remove()
		var places = this.places;
		for (var i = 0;i<places.length;i++) {
			var img = places[i].venue.featuredPhotos.items[0].prefix + places[i].venue.featuredPhotos.items[0].width+"x"+places[i].venue.featuredPhotos.items[0].height+ places[i].venue.featuredPhotos.items[0].suffix;
			var element = $("<li class='listItemContainer'><div class='fh5co-food-desc listItem'><figure><img src="+img+" class='img-responsive' alt='X'></figure><div><h3>"+places[i].venue.name+"</h3></div></div><div class='fh5co-food-pricing'>Distance: "+places[i].venue.location.distance/1000+"km</div></li>");
			$("#coffeePlacesList").append(element);
			$(element).attr("id",places[i].venue.id);
			$(element).attr("distance",places[i].venue.location.distance);
			$(element).on("mousedown",function(e){
				if (e.which=="3") {
					return;
				}
				console.log(e.which);
				postdata($(this).attr("id")+":"+$(this).attr("distance"));
			});
		}
		if (places.length==0) {
			$("#coffeePlacesList").append("<div class='fh5co-food-desc listItem'>There are no open coffee shops 1 km around you</div></li>");
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
			type: 'GET',
			dataType: 'json',
			context: this,
			success: function(data){
				this.place = data.response.venue;
				this.tips = this.place.tips.groups[this.place.tips.groups.length-1].items;
				$("#coffeeTitle").text(this.place.name);
				$("#priceDetails").text("Price: "+this.place.price.message + "("+this.place.price.currency+")");
				$("#distanceDetails").text("Destination: "+window.location.search.split(":")[1]/1000+"km");
				this.appendTips();
			},
			error: function(data) {
				console.log(data);
				showModal("Error",data.statusText);
				$("#loading").remove();
			}
		});
	}
	this.getPhotos = function() {
		$.ajax({
			url: this.imagesUrl,
			dataType: 'json',
			type: 'GET',
			context: this,
			success: function(data){
				this.photos = data.response.photos.items;
				this.appendToGalery();
			},
			error: function(data) {
				console.log(data);
				showModal("Error",data.statusText);
				$("#loading").remove();
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
			var imageHeight = 400;
			var coeficient = photos[i].width/photos[i].height;
			var imageWidth = parseInt(400*coeficient);
			var img = photos[i].prefix + imageWidth+"x"+imageHeight+ photos[i].suffix;
			$("#slideshow").append('<div class="item '+active+'"><img src='+img+' alt="O" style="height:100%; width:100%;"></div>');
			$("#indicators").append('<li data-target="#myCarousel" data-slide-to='+i+' class='+active+'></li>')
		}
	  
	}
	this.appendTips = function(all) {
		var tips = this.tips;
		for (var i = 0;i<tips.length;i++) {
			if (tips[i].text.toUpperCase().indexOf("COFFEE")>=0 || all) {
				if (i==0) $("#coffeeTips").text("");
				var img = tips[i].photourl;
				img = (img==undefined)?"template/images/home_page_background.png":img;
				var element = $("<li><div class='fh5co-food-desc listItem'><figure><img src="+img+" class='img-responsive' alt='X'></figure><div><h3>"+tips[i].text+"</h3></div></div><div class='fh5co-food-pricing'>Likes: "+tips[i].likes.count+"</div></li>");
				$("#coffeeTips").append(element);
			}
		}
	}
}

function init() {
	loadForm();
	getLocation();
	$("#enableLocation").on("mouseup",function(){
		window.location.href = window.location.href;
	});
	
}
function getLocation(){
	navigator.geolocation.getCurrentPosition(locationSuccess, locationFail);
}
var latitude;
var longitude;
function locationSuccess(position) {
    latitude = position.coords.latitude;
	longitude = position.coords.longitude;
	fApi = new FoursquareAPI(1000, 10, latitude, longitude);
	fApi.getAllCoffeeShops();
	$("#sortDistance").on("mousedown", function(){
		fApi.sortPlacesByDistance();
	});
	$("#sortPrice").on("mousedown", function(){
		fApi.sortPlacesByExpensiveness();
	});
}

function locationFail(error) {
    showModal("Information","You must turn on the location to use this app");
	$("#loading").remove();
}

function populateDetailsForCoffeePlace() {
	curretntCoffeePlace = new CoffeePlace(window.location.search.substring(1).split(":")[0]);
	curretntCoffeePlace.getCoffeeShop();
	curretntCoffeePlace.getPhotos();
	$('html,body').animate({
        scrollTop: $("#fh5co-menus").offset().top
	},'slow');
	$("#showAllTips").on("mouseup",function(){
		curretntCoffeePlace.appendTips(true);
	});
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
function showModal(title, body) {
	$('#myModal').modal('show');
	$('#modal-title-info').text(title);
	$('#modal-content').text(body);
}