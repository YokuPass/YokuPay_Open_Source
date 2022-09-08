import Cookie from "js-cookie"

export default function removeCookie(cookieName) {
    Cookie.remove(cookieName)
}