class Location {
    static validateLatitude(latitude) {
        return /^-?([0-8]?[0-9]|90)(\.[0-9]{1,10})$/.test(latitude);
    }

    static validateLongitude(longitude) {
        return /^-?([0-9]{1,2}|1[0-7][0-9]|180)(\.[0-9]{1,10})$/.test(longitude);
    }
}

module.exports = Location;