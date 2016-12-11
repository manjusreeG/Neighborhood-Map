/* All the global variables are created here */
var map;
var markers = [];
var Shoppinggirl;
var pinmarker;
var infowin;
var filter;

/*Initialized the map  fn here  and referenced basic map initialisation*/
function initMap() {
	map= new  google.maps.Map(document.getElementById('map'), {
		center: {
			lat: 13.074859, 
			lng: 80.222684
		},
		zoom: 6 //map zoom level is determined here
	});
	infowin = new google.maps.InfoWindow();
	//Google map is asynchronising the codes with knockout.js here
	ko.applyBindings(new Viewmodel());
}

/* The locations of shopping malls with details are defined here*/
var locations = [{
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
}];

//This function is used as a part in filtering the locations list in sidebar
var stringStartsWith = function (string, startsWith) {
    string = string || "";
    if (startsWith.length > string.length) {
        return false;
    }
    return string.substring(0, startsWith.length) === startsWith;
  };


/* Here comes the code to display my map with parameters*/
var Viewmodel = function() {
	var self = this;
	//map boundary is controlled here
	var bounds = new google.maps.LatLngBounds();
	//The viewmodel's object are declared 
	self.userInput = ko.observable('');
	self.isOpen = ko.observable(false);
	self.locations= ko.observableArray(locations);

	//this defines the filtering function in search bar and I got idea from [http://www.knockmeout.net/2011/04/utility-functions-in-knockoutjs.html]
	self.filteredItems = ko.computed(function(location) {
    var filter = self.userInput().toLowerCase();
    //If there is nothing in the filter, return the full list and all markers are visible
    if (!filter) {
      return self.locations();
    //If a search is entered, compare search data to place names and show only list items and markers that match the search value
      } else {
        return ko.utils.arrayFilter(self.locations(), function(location) {
         filteredmall = stringStartsWith(location.title.toLowerCase(), filter);
          //To show markers that match the search value and return list items that match the search value
          if (filteredmall) {
              location.marker.setVisible(true);
              console.log("clicked");
              return filteredmall
            }
            //To Hide markers that do not match the search value
           else {
              location.marker.setVisible(false);
              return filteredmall
            }
            return location.title.toLowerCase().indexOf(filter) > -1;
        });
      }
    }, self);

    self.populateMap = ko.computed(function() {
        var searchQuery = self.userInput().toLowerCase();
        var selectLocations = [];

        if (!searchQuery) {

            return populateFullLocations();
        } else {
            console.log("attempt to repopulate map");
            return populateFilteredMap(searchQuery);

        }
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

	// set the properties of marker here
	self.presentMarker = function() {

		for (var i = 0; i < self.locations().length; i++) {
		 self.locations()[i].marker.clicked = false;
		 google.maps.event.trigger(self.locations()[i].marker, 'mouseout')
		}
		this.marker.setIcon(Shoppinggirl);
		console.log(this.marker.clicked);
		this.marker.clicked = true;
		self.populateInfoWindow(this.marker, infowin);
	}

	self.filtersVisible = ko.observable('');

	// the infoWindow with all information  is defined here
	self.populateInfoWindow = function (marker, infowindow) {

		map.fitBounds(bounds);

		if (infowindow.marker != marker) {
			infowindow.marker = marker;
		var address = getSearchTerms(marker.title);
		//wikipedia url is obtained here
        var wikiUrl = "https://en.wikipedia.org/w/api.php?action=opensearch&search=" + address.wikiSrcTxt + "&limit=1&redirects=resolve&namespace=0&format=json";

		infowindow.open(map, marker);
		// shows error when wikipedia element is not shown.
		self.apiTimeout = setTimeout(function() {
			alert('ERROR: Data Loading failed ');
		}, 10000);

		//AJAX request and wikipedia link code is stored here
		$.ajax({
			url: wikiUrl,
            dataType: 'jsonp',
        }).done(function(data) {
                var wiki;
                if (data[2].length != 0) {
                    var wikilink = {
                        summary: data[2],
                        url: data[3]
                    };
                    var wiki = '<p>' + wikilink.summary + '</p><p><a href="' + wikilink.url + '">' + wikilink.url + '</a></p>';
                } else {
                    wiki = '<p>No Wikipedia Info Available</p>';
                }
	    	InfoContent(marker, wiki);
			clearTimeout(self.apiTimeout); //this lines calls when api timesout to show the information
			});
		}
		// marker infos are defined here
		var InfoContent = function(marker, wiki) { 
			infowindow.setContent('<div class = "info-window"><p class = "infowiki"><h4>' + marker.title + '</h4>' + wiki + '</p></div>');
			//info window is closed once the close button is pressed
			infowindow.addListener('closeclick', function() {
				marker.setIcon(pinmarker);
				marker.clicked = false;
				infowindow.marker = null;
				map.setCenter(map.center);
				map.fitBounds(bounds);
			});
			//info window opens when marker is clicked
			google.maps.event.addListener(map, 'click', function() {
				marker.setIcon(pinmarker);
				marker.clicked = false;
				infowindow.marker = null;
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

	//the user input is consoled in developer window here
	self.writeConsole = ko.computed(function() {
        console.log(self.userInput());
    });

	//the marker is created here
	self.createMarkers = function() {
		 infowindow = new google.maps.InfoWindow(); //info window is specified here
		// this specifies the lady icon when the pin marker is clicked
		 Shoppinggirl = makeMarkerIcon('http://www.clipartkid.com/images/59/shopping-centers-and-shopping-malls-based-in-part-on-criteria-bl6mf2-clipart.jpg'); 
		// The pin marker is defined here
		 pinmarker = makeMarkerIcon('http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|05F941|40|_|%E2%80%A2');
		// Location properties are defined in marker
		self.locations().forEach(function(location)  {
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
				icon: pinmarker,
				id: i,
				clicked: false,
			});
			locations[i].marker = marker;
			//This will  save locations in marker
			markers.push(marker);
			self.locations()[i].marker = marker;
			//when marker is clicked infowindow will appear
			marker.addListener('click', function() {
                for (i = 0; i < self.locations().length; i++){
                  self.locations()[i].marker.clicked = false;
                  google.maps.event.trigger(self.locations()[i].marker, 'mouseout');
                }
                this.setIcon(Shoppinggirl);
                self.populateInfoWindow(this, infowin);
                this.clicked = true;
            });
			location.marker = marker;
			//Shoppinggirl  icon function is defined here
			marker.addListener('mouseover', function() {
				this.setIcon(Shoppinggirl);
			});
			//pinmarker icon function is defined here
			marker.addListener('mouseout', function(){
				if (!this.clicked) {
					this.setIcon(pinmarker);
				}
			});
			//extend the marker postion by bounds
			bounds.extend(marker.position);
		}
	});
		//map will fit withinthe boundary of map
		map.fitBounds(bounds);
	}
	self.createMarkers();



	self.ladyIcon = function() {
		this.marker.setIcon(Shoppinggirl); //when mouse is over marker it changes to lady icon
	}

	self.resetIcon = function() {
		if (!this.marker.click){
			this.marker.setIcon(pinmarker); // when mouse is out .. the pin marker will retained
		}
	}

	function populateFullLocations(){
		self.locations().forEach(function(location)  {
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
				icon: pinmarker,
				id: i,
				clicked: false,
			});
			locations[i].marker = marker;
			//This will  save locations in marker
			markers.push(marker);
			self.locations()[i].marker = marker;
			//when marker is clicked infowindow will appear
			marker.addListener('click', function() {
                for (i = 0; i < self.locations().length; i++){
                  self.locations()[i].marker.clicked = false;
                  google.maps.event.trigger(self.locations()[i].marker, 'mouseout');
                }
                this.setIcon(Shoppinggirl);
                self.populateInfoWindow(this, infowin);
                this.clicked = true;
            });
			location.marker = marker;
			//Shoppinggirl  icon function is defined here
			marker.addListener('mouseover', function() {
				this.setIcon(Shoppinggirl);
			});
			//pinmarker icon function is defined here
			marker.addListener('mouseout', function(){
				if (!this.clicked) {
					this.setIcon(pinmarker);
				}
			});
			//extend the marker postion by bounds
			bounds.extend(marker.position);
		};
	});
	}
	function populateFilteredMap(searchQuery) {
		self.locations().forEach(function(location)  {
		for (var i = 0; i < self.locations().length; i++) {
			var position  = self.locations()[i].coordinates;
			var titleToSearch = location.title.toLowerCase();
			var title = self.locations()[i].title;
			var info = self.infowindow;
		  if (titleToSearch.indexOf(searchQuery) !== -1) {
			//create the marker location property here
			marker = new google.maps.Marker({
				map: map,
				position: position,
				title: title,
				animation: google.maps.Animation.DROP,
				icon: pinmarker,
				id: i,
				clicked: false,
			});
			locations[i].marker = marker;
			//This will  save locations in marker
			markers.push(marker);
			//when marker is clicked infowindow will appear
			marker.addListener('click', function() {
                for (i = 0; i < self.locations().length; i++){
                  self.locations()[i].marker.clicked = false;
                  google.maps.event.trigger(self.locations()[i].marker, 'mouseout');
                }
                this.setIcon(Shoppinggirl);
                self.populateInfoWindow(this, infowin);
                this.clicked = true;
            });
			location.marker = marker;
			}
			//Shoppinggirl  icon function is defined here
			marker.addListener('mouseover', function() {
				this.setIcon(Shoppinggirl);
			});
			//pinmarker icon function is defined here
			marker.addListener('mouseout', function(){
				if (!this.clicked) {
					this.setIcon(pinmarker);
				}
			});
			//extend the marker postion by bounds
			bounds.extend(marker.position);
		};
	});
	}
};

//search input is defined here
function getSearchTerms(loc) {
	console.log(loc)
	var userInput; //userInput is defined here

	var searchplace = loc.split(",");
	for (var i = 0; i < searchplace.length; i++) {
		searchplace[i] = searchplace[i].replace(/ /g, "+");
		searchplace[i] = searchplace[i].toLowerCase();
	}
	var address = {
        wikiSrcTxt: searchplace[0]
	}
	return address;
}

function makeMarkerIcon(image) {
    var markerImage = new google.maps.MarkerImage(
        image,
        new google.maps.Size(40, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21, 34));
    return markerImage;
}

function googleMapsError() {

    alert("Google Maps Not Loading, Please check internet connection");
}
