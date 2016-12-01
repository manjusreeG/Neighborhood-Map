/* The map variable is created here */
var map;
var markers = [];

/*Initialized the map  fn here */
function initMap() {
	map= new  google.maps.Map(document.getElementById('map'), {
		center: {
			lat: 13.074859, 
			lng: 80.222684
		},
		zoom: 6 //map zoom level is determined here
	});
 //asynchronising the codes here
ko.applyBindings(new Viewmodel());

}

var Viewmodel = function() {
	var self = this;
	//map boundary is controlled here
	var bounds = new google.maps.LatLngBounds();

	self.userInput = ko.observable('');
	self.isOpen = ko.observable(false);
	self.places = ko.observableArray(this.locations); //locations are stored here
	self.filter = ko.observable("");

	self.search = ko.computed(function() {
        return ko.utils.arrayFilter(self.places(), function(places) {

        //Setting up  search bar filter to connect with Google Maps markers

        if (places.name.toLowerCase().indexOf(self.filter().toLowerCase()) >= 0) {
            if (map !== null) places.marker.setMap(map);
            return true;
        } else {
            p.marker.setMap(null);
            return false;
        }
        });

    });

	self.select = function(parent) {
       openInfo(parent);		//opening the info window here
    };

	self.toggle = function() {
		this.isOpen(!this.isOpen()); // open list
	};

	self.close = function() {
		this.isOpen(false);		//close list window
		return true;
	};

	

	self.filtersMarkers = ko.observableArray(false); //filters markers

	// set the properties of marker here
	self.presentMarker = function() {

		for (var i = 0; i < self.locations().length; i++) {
		 self.locations()[i].marker.clicked = false;
		 google.maps.event.trigger(self.locations()[i].marker, 'mouseout')
		}
		this.marker.setIcon(MallIcon);
		console.log(this.marker.clicked);
		this.marker.clicked = true;
		self.populateInfoWindow(this.marker, infowindow);
	}

	self.filtersVisible = ko.observable('');

	// shopping malls locations are defined here
	self.locations= ko.observableArray([{
		title: 'Phoenix Market city,Chennai',
		coordinates: {lat: 12.992526, lng: 80.217214},
		place: ' Tami Nadu, India',
		marker: null,
		visible: ko.observable(true)
	}, {
		title: 'LuLu Mall, Kochi',
		coordinates: {lat: 10.028403, lng: 76.309428},		
		place: 'Kerala, India',
		marker: null,
		visible: ko.observable(true)
	}, {
		title: 'Express Avenue, Chennai',
		coordinates: {lat: 13.059996, lng: 80.266016}, 
		place: 'Tamil Nadu, India',
		marker: null,
		visible: ko.observable(true)
	}, {
		title: 'Brookefields Mall, Coimbatore', 
		coordinates: {lat: 11.010826, lng: 76.960597}, 
		place: 'Tamil Nadu, India',
		marker: null,
		visible: ko.observable(true)
	}, {title: 'Ampa SkyWalk, Chennai', 
		coordinates: {lat: 13.074859, lng: 80.222684},
		place: 'Tamil Nadu, India',
		marker: null,
		visible: ko.observable(true)
	}, {
		title: 'The Forum, Bengaluru', 
		coordinates: {lat: 12.935894, lng: 77.612657},
		place: ' Karnataka, India',
		marker: null,
		visible: ko.observable(true)
	}]);

	// the infoWindow is defined here
	self.populateInfoWindow = function (marker, infowindow) {

		map.fitBounds(bounds);

		if (infowindow.marker != marker) {
			infowindow.marker = marker;
		var address = getSearchTerms(marker.title);
		//wikipedia url is obtained here
		var wikiUrl = "https://en.wikipedia.org/w/api.php?action=isOpensearch&search=" + address.wikiSrcTxt + "&limit=1&redirects=resolve&namespace=0&format=json";

		infowindow.isOpen(map, marker);
		// shows error when wikipedia element is not shown.
		self.apiTimeout = setTimeout(function() {
			alert('ERROR: Data Loading failed ');
		}, 8000);

		$.ajax({
			url: wikiUrl,
			dataType: 'jsonp',
		}).success(function(data) {
		 	var wiki;
			if (data[2].length != 0) {
				var wikiInfo = {
					summary: data[2],
					url: data[3]
				};
				var wiki = '<p>'  + wikiInfo.summary + '</p><p><a href="' + wikiInfo.url + '">' + wikiInfo.url + '</a></p>';
			} else {
				wiki = '<p> Wikipedia Link is Not Available </p>';
			}
	    		
	    	InfoContent(marker, wiki);
			clearTimeout(self.apiTimeout);
			});
		}
		// marker infos are defined here
		var InfoContent = function(marker, wiki) { 
			infowindow.setContent('<div class = "info-window"><p><h4>' + marker.title + '</h4>' + wiki  + '</p></div>');
			//info window is closed once the close button is pressed
			infowindow.addListener('closeclick', function() {
				marker.setIcon(defaultIcon);
				marker.clicked = false;
				infowindow.marker = null;
				map.setCenter(map.center);
				map.fitBounds(bounds);
			});
			//close marker is closed
			google.maps.event.addDOMListener(map, 'click', function() {
				marker.setIcon(defaultIcon);
				marker.clicked = true;
				infowindow.marker = true;
				infowindow.close();
				map.fitBounds(bounds);
			});

			if ((self.isOpen) && ($(window).width() < 550)) {
				map.panBy(0, -140);
			}
			if ((self.isOpen) && ($(window).width() > 550)) {
				map.panBy(-200, 0);
			}
		}
	};

	self.writeConsole = ko.computed(function() {
        console.log(self.userInput());
    });

	self.createMarkers = function() {
		var infowindow = new google.maps.InfoWindow(); //info window is specified here
		// this specifies the lady icon when the pin marker is clicked
		var MallIcon = makeMarkerIcon('http://www.clipartkid.com/images/59/shopping-centers-and-shopping-malls-based-in-part-on-criteria-bl6mf2-clipart.jpg'); 
		// The pin marker is defined here
		var defaultIcon = makeMarkerIcon('http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|05F941|40|_|%E2%80%A2');
		// Location properties will be declared
		for (var i = 0; i < self.locations().length; i++) {
			var position  = self.locations()[i].coordinates;
			var title = self.locations()[i].title;
			var info = self.infowindow;
			//create the marker location property here
			marker = new google.maps.Marker({
				map: map,
				position: position,
				title: title,
				animation: google.maps.Animation.DROP,
				icon: defaultIcon,
				id: i,
				clicked: false,

			});
			markers.push(marker);
			self.locations()[i].marker = marker;
			//when marker is clicked infowindow will appear
			marker.addListener('click', function() {
				for (var i = 0; i < self.locations().length; i++) {
					self.locations()[i].marker.clicked = false;
					google.maps.event.trigger(self.locations()[i].marker, 'mouseout');
				}
				this.setIcon(MallIcon);
				self.populateInfoWindow(this, infowindow);
				this.clicked = true;
			});
			//Mallmarker function is defined here
			marker.addListener('mouseover', function() {
				this.setIcon(MallIcon);
			});
			//Lady marker function is defined here
			marker.addListener('mouseout', function(){
				if (!this.clicked) {
					this.setIcon(defaultIcon);
				}
			});
			//extend the marker postion by bounds
			bounds.extend(marker.position);
		}
		//map will fit withinthe boundary of map
		map.fitBounds(bounds);
	}
	self.createMarkers();

	self.ladyIcon = function() {
		this.marker.setIcon(MallIcon); //when mouse is over marker it changes to lady icon
	}

	self.resetIcon = function() {
		if (!this.marker.click){
			this.marker.setIcon(defaultIcon); // when mouse is out .. the pin marker will retained
		}
	}
};

//search input is defined here
function getSearchTerms(loc) {
	var userInput; //userInput is defined here

	var fullLoc = loc.split(",");

	for (var i = 0; i < fullLoc.length; i++) {
		fullLoc[i] = fullLoc[i].replace(/ /g, "+");
		fullLoc[i] = fullLoc[i].toLowerCase();
	}
	var address = {
		wikiSrcTxt: fullLoc[0]
	}
	return address;
}

function makeMarkerIcon(image) {
    var markerImage = new google.maps.MarkerImage(
        image,
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21, 34));
    return markerImage;
}

function googleMapsError() {

    alert("Google Maps Not Loading, Please check internet connection");
}
