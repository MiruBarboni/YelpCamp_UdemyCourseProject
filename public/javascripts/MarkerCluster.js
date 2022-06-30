geocoder = new google.maps.Geocoder();

async function initMap(locations, titles) {
	const map = new google.maps.Map(document.getElementById('clusterMap'), {
		zoom: 3,
		center: { lat: 39.099724, lng: -94.578331 }, //center location in USA
	});

	const infoWindow = new google.maps.InfoWindow({
		content: '',
		disableAutoPan: true,
	});

	// Add some markers to the map.
	const markersPromises = locations.map(async (location, i) => {
		const response = await geocoder.geocode({ address: location });

		if (response.results[0]) {
			lat = response.results[0].geometry.location.lat();
			long = response.results[0].geometry.location.lng();

			const latlng = new google.maps.LatLng(lat, long);

			const label = titles[i % titles.length];

			const marker = new google.maps.Marker({
				position: latlng,
			});

			// markers can only be keyboard focusable when they have click listeners
			// open info window when marker is clicked
			marker.addListener('click', () => {
				infoWindow.setContent(label);
				infoWindow.open(map, marker);
			});
			return marker;
		}
	});
	try {
		const markers = await Promise.all(markersPromises);
		// Add a marker clusterer to manage the markers. - limited markers for free
		new markerClusterer.MarkerClusterer({ markers, map });
	} catch (err) {
		alert('Error on marker cluster!');
	}
}

initMap(window.mapLocations, window.campTitles);
