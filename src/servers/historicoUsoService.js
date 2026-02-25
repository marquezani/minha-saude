import { supabase } from '../https/url';

// Função auxiliar para obter o ID do usuário logado
function getUserId() {
    const userSession = localStorage.getItem('usuario_sessao');
    if (userSession) {
        const user = JSON.parse(userSession);
        return user.id;
    }
    return null;
}

/**
 * Salva um novo registro de uso de medicamento no histórico.
 * @param {object} usoData - Dados do uso (medicamento_id, quantidade_usada, etc.).
 * @returns {Promise<object>}
 */
export async function salvarUsoMedicamento(usoData) {
    const userId = getUserId();
    if (!userId) {
        throw new Error("Usuário não autenticado.");
    }

    const { data, error } = await supabase
        .from('historico_uso_medicamentos')
        .insert({ ...usoData, usuario_id: userId })
        .select();

    if (error) {
        console.error("Erro ao salvar histórico de uso:", error);
        throw error;
    }
    return data;
}

/**
 * Obtém o histórico de uso de medicamentos do usuário.
 * @returns {Promise<Array>}
 */
export async function obterHistoricoUso() {
    const userId = getUserId();
    if (!userId) {
        throw new Error("Usuário não autenticado.");
    }

    const { data, error } = await supabase
        .from('historico_uso_medicamentos')
        .select('*, medicamentos (nome, dosagem)')
        .eq('usuario_id', userId)
        .order('data_hora_uso', { ascending: false });

    if (error) throw error;
    return data;
}

export async function deletarHistoricoUso(id) {
    const { error } = await supabase.from('historico_uso_medicamentos').delete().eq('id', id);
    if (error) throw error;
    return true;
}