import axios from "axios";
import { URL_API } from "../https/url.js";

export async function obterRegistros() {
    try {
        const response = await axios.get(`${URL_API}glicose`);
        console.log('response: ', response);
        return response;
    } catch (error) {
        console.error("Erro ao obter registros:", error);
    }
}

export async function salvarRegistro(form) {
    const response = await axios.post(`${URL_API}glicose`, form);

    return response;
}