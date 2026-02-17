import { PASSWORD_KEY, USER_KEY } from "@/https/url";

const MOCK_USER = {
    usuario: USER_KEY,
    encodedPass: PASSWORD_KEY,
};

export function login(usuario, password) {
    if (usuario === MOCK_USER.usuario && btoa(password) === MOCK_USER.encodedPass) {
        sessionStorage.setItem(USER_KEY, JSON.stringify({ usuario: MOCK_USER.usuario, loggedIn: true }));
        return true;
    }
    return false;
}

export function logout() {
    sessionStorage.removeItem(USER_KEY);
}

export function isAuthenticated() {
    return sessionStorage.getItem(USER_KEY) !== null;
}