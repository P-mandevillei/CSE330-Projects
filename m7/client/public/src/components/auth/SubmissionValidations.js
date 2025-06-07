
export function isValidEmail(email) {
    return /^[\w!#$%&'*+/=?^_`{}~\.-]+@[\w\-]+(\.[\w\-]+)+$/.test(email);
}

export function isValidZipCode(zipCode) {
    return /^\w{5}$/.test(zipCode);
}

export function isValidUSPhone(phone) {
    return /^\w{10}$/.test(phone);
}

export function isValidGeolocation(latitude, longitude) {
    return latitude && longitude && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
}