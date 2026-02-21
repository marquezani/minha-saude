import { supabase } from '../https/url';



export async function obterRegistros() {
    try {
        const { data, error } = await supabase
            .from('glicose')
            .select('*')
            .order('data_horario', { ascending: false });

        if (error) {
            console.error("Erro Supabase:", error.message);
            return []; // Retorna array vazio em caso de erro
        }

        return data; // IMPORTANTE: Agora ele retorna a lista de registros
    } catch (error) {
        console.error("Erro ao obter registros:", error);
        return [];
    }
}

export async function salvarRegistro() {
    // const response = await axios.post(`${URL_API}glicose`, form);

    //return response;
}

export async function deletarRegistro() {
    // try {
    //     const response = await axios.delete(`${URL_API}glicose/${id}`);
    //     return response;
    // } catch (error) {
    //     console.error("Erro ao deletar registro:", error);
    //     throw error;
    // }
}