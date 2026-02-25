import { supabase } from '../https/url'; // Verifique se o caminho do seu client está correto

// Função auxiliar para obter o ID do usuário logado
function getUserId() {
    const userSession = localStorage.getItem('usuario_sessao');
    if (userSession) {
        const user = JSON.parse(userSession);
        return user.id; // Assumindo que o objeto de sessão do usuário tem uma propriedade 'id'
    }
    return null;
}

export async function salvarMedicamento(medicamentoData) {
    const userId = getUserId();
    if (!userId) {
        throw new Error("Usuário não autenticado. Faça login para salvar medicamentos.");
    }
    const { data, error } = await supabase
        .from('medicamentos')
        .insert({ ...medicamentoData, usuario_id: userId })
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function atualizarMedicamento(id, medicamentoData) {
    const userId = getUserId();
    if (!userId) {
        throw new Error("Usuário não autenticado. Faça login para atualizar medicamentos.");
    }
    // Cria uma cópia dos dados e remove o 'id' para evitar a tentativa de atualizar a chave primária.
    const dataToUpdate = { ...medicamentoData };
    delete dataToUpdate.id;
    const { data, error } = await supabase
        .from('medicamentos')
        .update(dataToUpdate)
        .eq('id', id); // Atualiza o registro com o ID fornecido
    if (error) throw error;
    return data;
}

export async function obterMedicamentos() {
    const userId = getUserId();
    if (!userId) {
        throw new Error("Usuário não autenticado. Faça login para ver seus medicamentos.");
    }
    const { data, error } = await supabase
        .from('medicamentos')
        .select('*')
        .eq('usuario_id', userId) // Filtra apenas os medicamentos do usuário logado
        .order('created_at', { ascending: false }); // Ordena pelos mais recentes
    if (error) throw error;
    return data;
}

export async function deletarMedicamento(id) {
    const { error } = await supabase.from('medicamentos').delete().eq('id', id);
    if (error) throw error;
}