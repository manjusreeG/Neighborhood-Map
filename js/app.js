var map;

function initMap() {
	map= new google.maps.Map(document.getElementsById('map'), {
		center: {
			lat: 13.074859, 
			lng: 80.222684
		},
		zoom: 6 
	});

	var infowindow = new google.maps.Infowindow();
	var boundary = new google.maps.LatLngBounds();
	var defaultIcon = makeMarkerIcon('https://chart.googleapis.com/chart?chst=d_bubble_icon_text_small&chld=dollar|bb|Mall|FcFCDE|000000');
	var MallIcon = makeMarkerIcon('http://www.clipartkid.com/images/59/shopping-centers-and-shopping-malls-based-in-part-on-criteria-bl6mf2-clipart.jpg');

	ko.applyBindings(new Viewmodel());

}

var Viewmodel = function() {
	var self = this;

	this.isOpen = ko.observable(false);

	this.toggle = function() {
		this.isOpen(!this.isOpen());
	};

	this.close = function() {
		this.isOpen(false);
		return true;
	};

	this.ladyIcon = function() {
		this.marker.setIcon(MallIcon);
	}

	this.resetIcon = function() {
		if (!this.marker.clicked){
			this.marker.setIcon(defaultIcon);
		}
	}

	this.presentMarker = function() {
		for (var i = 0; i < self.locations().length; i++) {
		 self.locations()[i].marker.clicked = false;
		 google.maps.event.trigger(self.locations()[i].marker, 'mouseout')
		}
		this.marker.setIcon(MallIcon);
		console.log(this.marker.clicked);
		this.marker.clicked = true;
		self.populateInfoWindow(this.marker, infowindow);
	}

	this.filtersVisible = ko.observable(false);

	this.locations= ko.observableArray([{
		title: 'Phoenix Market city',
		coordinates: {lat: 12.992526, lng: 80.217214},
		place: 'Chennai, Tami Nadu, India',
		marker: null,
		visible: ko.observable(true)
	}, {
		title: 'LuLu Mall',
		coordinates: {lat: 10.028403, lng: 76.309428},		
		place: 'Kochi, Kerala, India',
		marker: null,
		visible: ko.observable(true)
	}, {
		title: 'Express Avenue',
		coordinates: {lat: 13.059996, lng: 80.266016}, 
		place: 'Chennai, Tamil Nadu, India',
		marker: null,
		visible: ko.observable(true)
	}, {
		title: 'Brookefields Mall', 
		coordinates: {lat: 11.010826, lng: 76.960597}, 
		place: 'Coimbatore, Tamil Nadu, India',
		marker: null,
		visible: ko.observable(true)
	}, {title: 'Ampa SkyWalk', 
		coordinates: {lat: 13.074859, lng: 80.222684},
		place: 'Chennai, Tamil Nadu, India',
		marker: null,
		visible: ko.observable(true)
	}, {
		title: 'The Forum', 
		coordinates: {lat: 12.935894, lng: 77.612657},
		place: 'Bengaluru, Karnataka, India',
		marker: null,
		visible: ko.observable(true)
	}]);

self.populateInfoWindow = function (marker, infowindow) {

	map.fitBounds(boundary);

	if (infowindow.marker != marker) {
		infowindow.marker = marker;
		var address = getSearchTerms(marker.title);
		var wikiUrl = "https://en.wikipedia.org/w/api.php?action=isOpensearch&search=" + address.wikiSrcTxt + "&limit=1&redirects=resolve&namespace=0&format=json";

		infowindow.isOpen(map, marker);

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

		var InfoContent = function(marker, wiki) { 
			infowindow.setContent('<div class = "info-window"><p><h4>' + marker.title + '</h4>' + wiki '</p></div>');

			infowindow.addListener('closeclick', function() {
				marker.setIcon(defaultIcon);
				marker.clicked = false;
				infowindow.marker = null;
				map.setCenter(map.center);
				map.fitBounds(boundary);
			});

			google.maps.event.addDOMListener(map, 'click', function() {
				marker.setIcon(defaultIcon);
				marker.clicked = false;
				infowindow.marker = null;
				infowindow.close();
				map.fitBounds(boundary);
			});

			if ((self.isOpen) && ($(window).width() < 550)) {
				map.panBy(0, -140);
			}
			if ((self.isOpen) && ($(window).width() > 550)) {
				map.panBy(-200, 0);
			}
		}
	};

	self.createMarkers = function() {
		for (var i = 0; i < self.locations().length; i++) {
			var position  = self.locations()[i].coordinates;
			var title = self.locations()[i].title;

			marker = new google.maps.Marker({
				map: map,
				position: position,
				title: title,
				animation: google.maps.Animation.DROP,
				icon: defaultIcon,
				id: i,
				clicked: false
			});
			markers.push(marker);
			self.locations()[i].marker = marker;

			marker.addListener('click', function() {
				for (var i = 0; i < self.locations().length; i++) {
					self.locations()[i].marker.clicked = false;
					google.maps.event.trigger(self.locations()[i].marker, 'mouseout');
				}
				this.setIcon(MallIcon);
				self.populateInfoWindow(this, infowindow);
				this.clicked = true;
			});

			marker.addListener('mouseover', function() {
				this.setIcon(MallIcon);
			});
			marker.addListener('mouseout', function(){
				if (!this.clicked) {
					this.setIcon(defaultIcon);
				}
			});

			boundary.extend(marker.position);
		}

		map.fitBounds(boundary);
	}
	self.createMarkers();
};

function getSearchTerms(loc) {
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