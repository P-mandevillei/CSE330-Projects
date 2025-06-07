export default function getCookie(name) {
    // https://flask-jwt-extended.readthedocs.io/en/stable/token_locations.html
    const cookies = `; ${document.cookie}`;
    const target = cookies.split(`; ${name}=`);
    if (target.length === 2) {
        return target[1].split(";")[0]
    }
    return null;
}