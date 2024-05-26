class Location {
    static validateLatitude(lat) {
        return typeof lat === "number" && lat >= -90 && lat <= 90;
    }

    static validateLongitude(lon) {
        return typeof lon === "number" && lon >= -180 && lon <= 180;
    }
}

module.exports = Location;