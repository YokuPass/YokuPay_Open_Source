import Cookie from "js-cookie"

export default function getCookie(cookieName) {
    return Cookie.get(cookieName)
}