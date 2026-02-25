import { supabase } from '../https/url'; // Ajustado o caminho de importação

/**
 * Salva (insere ou atualiza) um item de estoque de medicamento.
 * Se já existir um estoque para o medicamento_id, ele será atualizado.
 * Caso contrário, um novo registro será inserido.
 * @param {object} estoqueData - Os dados do estoque a serem salvos.
 * @returns {Promise<object>} O item de estoque salvo.
 */
export async function salvarEstoque(estoqueData) {
    // Tenta encontrar um registro de estoque existente para o medicamento_id
    const { data: existingEstoque, error: fetchError } = await supabase
        .from("estoque_medicamentos")
        .select("id")
        .eq("medicamento_id", estoqueData.medicamento_id)
        .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 significa "no rows found"
        throw fetchError;
    }

    if (existingEstoque) {
        // Se encontrou, atualiza o registro existente
        const { data, error } = await supabase
            .from("estoque_medicamentos")
            .update(estoqueData)
            .eq("id", existingEstoque.id)
            .select();
        if (error) throw error;
        return data;
    } else {
        // Se não encontrou, insere um novo registro
        const { data, error } = await supabase
            .from("estoque_medicamentos")
            .insert(estoqueData)
            .select();
        if (error) throw error;
        return data;
    }
}

export async function obterEstoque() {
    const { data, error } = await supabase.from("estoque_medicamentos").select(`*, medicamentos (nome, dosagem)`).order("ultima_atualizacao", { ascending: false });
    if (error) throw error;
    return data;
}

export async function deletarEstoque(id) {
    const { error } = await supabase.from("estoque_medicamentos").delete().eq("id", id);
    if (error) throw error;
    return true;
}