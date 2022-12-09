let map, infoWindow, result;
result = false;

function isResult() {
  if (result == true) {
    alert("새로 하기를 누르세요..");
    return;
  }
}

/* init 지도 모양 */
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    // 창 open시 초기 좌표 : 숭실대학교로 설정해둠.
    center: { lat: 37.49591873, lng: 126.9576021821907 },
    zoom: 17,
    streetViewControl: false, // 로드뷰 기능 제거
    fullscreenControl: false, // 전체화면 기능 제거
    mapTypeControl: false, // 지도 위성 전환 기능 제거
  });
  infoWindow = new google.maps.InfoWindow();

  /* 마커 이름 id ==> name */
  const name = document.getElementById("box-name");

  /* 장소 검색 id ==> input*/
  const input = document.getElementById("box-input");
  const searchBox = new google.maps.places.SearchBox(input);

  /* 만나기 button */
  const meetButton = document.createElement("button");
  meetButton.id = "meet";
  meetButton.className = "button";
  meetButton.textContent = "만나요!";
  map.controls[google.maps.ControlPosition.RIGHT_TOP].push(meetButton);

  /* 새로 하기 button */
  const newButton = document.createElement("button");
  newButton.id = "new";
  newButton.className = "button";
  newButton.textContent = "새로 하기";
  map.controls[google.maps.ControlPosition.RIGHT_TOP].push(newButton);

  /* 현재 위치 button */
  const locationButton = document.createElement("button");
  locationButton.id = "locnow";
  locationButton.textContent = "현재 위치";
  locationButton.className = "button";
  locationButton.classList.add("custom-map-control-button");
  map.controls[google.maps.ControlPosition.RIGHT_TOP].push(locationButton);

  // pac 검색창 기능
  // Bias the SearchBox results towards current map's viewport.
  map.addListener("bounds_changed", () => {
    searchBox.setBounds(map.getBounds());
  });
  let markers = [];
  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener("places_changed", () => {
    if (result == true) {
      alert("이미 출력됨, 새로하기 click");
      return;
    }
    const places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }
    // For each place, get the icon, name and location.
    const bounds = new google.maps.LatLngBounds();
    places.forEach((place) => {
      if (!place.geometry) {
        console.log("Returned place contains no geometry");
        return;
      }
      // Create a marker for each place.
      let labelname;
      if (document.getElementById("box-name").value == "") {
        labelname = document.getElementById("box-input").value;
        document.getElementById("box-input").value = "";
      } else {
        labelname = document.getElementById("box-name").value;
        document.getElementById("box-name").value = "";
        document.getElementById("box-input").value = "";
      }
      markers.push(
        new google.maps.Marker({
          map,
          title: place.name,
          label: labelname,
          position: place.geometry.location,
        })
      );

      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);
  });

  // 현재 위치 버튼 클릭 이벤트
  locationButton.addEventListener("click", () => {
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          // infoWindow.setPosition(pos);
          // infoWindow.open(map);
          map.setCenter(pos);
          map.setZoom(17);
        },
        () => {
          handleLocationError(true, infoWindow, map.getCenter());
        }
      );
    } else {
      // Browser doesn't support Geolocation
      handleLocationError(false, infoWindow, map.getCenter());
    }
  });

  /* 새로 하기 버튼 클릭 이벤트 */
  newButton.addEventListener("click", () => {
    markers.forEach((marker) => {
      marker.setMap(null);
    });
    markers = [];
    result = false;
    document.getElementById("box-input").value = "";
    document.getElementById("box-name").value = "";
  });

  /* 만나요 버튼 클릭 이벤트 */
  meetButton.addEventListener("click", () => {
    if (markers == null || markers.length < 2) {
      alert("두 곳 이상 click");
      return;
    }
    if (result == true) {
      alert("이미 출력됨, 새로하기 click");
      return;
    }
    let sumLat = 0.0; // x좌표 합
    let sumLng = 0.0; // y좌표 합

    for (var i = 0; i < markers.length; i++) {
      sumLat += markers[i].position.lat();
      sumLng += markers[i].position.lng();
    }
    var image = {
      size: new google.maps.Size(96, 96),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(23, 96),
    };

    /* 마커의 각 좌표값과 개수를 받아 최종 중간거리 계산 및 출력 */
    markers.push(
      new google.maps.Marker({
        map: map,
        position: {
          lat: parseFloat(sumLat) / Number(markers.length), // x좌표 평균
          lng: parseFloat(sumLng) / Number(markers.length), // y좌표 평균
        },
        icon: image,
        animation: google.maps.Animation.DROP,
      })
    );

    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < markers.length; i++) {
      bounds.extend(markers[i].getPosition());
    }
    map.fitBounds(bounds);
    document.getElementById("box-input").value = "";
    document.getElementById("box-name").value = "";
    result = true;
  });

  /* 지도 클릭 이벤트 */
  google.maps.event.addListener(map, "click", function (event) {
    if (result == true) {
      alert("이미 출력됨, 새로하기 click");
      return;
    }
    let labelname;
    if (document.getElementById("box-name").value == "") {
      labelname = String(markers.length + 1);
    } else {
      labelname = document.getElementById("box-name").value;
      document.getElementById("box-name").value = "";
    }
    markers.push(
      new google.maps.Marker({
        position: event.latLng,
        map: map,
        label: labelname,
      })
    );
    document.getElementById("box-input").value = "";
    document.getElementById("box-input").value = "";
  });
}
