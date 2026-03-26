
console.log(navigator)
navigator.geolocation.getCurrentPosition(
    (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        console.log(lat)
        console.log(lng)
    },
    (error) => {
        console.error("Error getting location:", error);
    }
);
