import axios from "axios";
import { URL_API } from "../https/url.js";

export async function obterRegistros() {
    try {
        const response = await axios.get(`${URL_API}glicose`);

        return response;
    } catch (error) {
        console.error("Erro ao obter registros:", error);
    }
}

export async function salvarRegistro(form) {
    const response = await axios.post(`${URL_API}glicose`, form);

    return response;
}

export async function deletarRegistro(id) {
    try {
        const response = await axios.delete(`${URL_API}glicose/${id}`);
        return response;
    } catch (error) {
        console.error("Erro ao deletar registro:", error);
        throw error;
    }
}