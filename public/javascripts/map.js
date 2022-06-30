var geocoder;
var map;

function initialize(location) {
	geocoder = new google.maps.Geocoder();

	if (location) {
		geocoder.geocode({ address: location }, function (results, status) {
			if (status == 'OK') {
				lat = results[0].geometry.location.lat();
				long = results[0].geometry.location.lng();

				var latlng = new google.maps.LatLng(lat, long);

				var mapOptions = {
					zoom: 8,
					center: latlng,
				};
				map = new google.maps.Map(document.getElementById('map'), mapOptions);

				var marker = new google.maps.Marker({
					map: map,
					position: latlng,
				});
			} else {
				alert(
					`Geocode was not successful for the following reason:  ${status}`
				);
			}
		});
	}
}

function codeAddress() {
	var address = document.getElementById('address').value;
	geocoder.geocode({ address: address }, function (results, status) {
		if (status === 'OK') {
			map.setCenter(results[0].geometry.location);
			var marker = new google.maps.Marker({
				map: map,
				position: results[0].geometry.location,
			});
		} else {
			alert(`Geocode was not successful for the following reason:  ${status}`);
		}
	});
}
initialize(window.mapLocation);
