import { supabase } from '../https/url'; // Ajustado o caminho de importação

/**
 * Salva (insere ou atualiza) um item de estoque de medicamento.
 * Se já existir um estoque para o medicamento_id, ele será atualizado.
 * Caso contrário, um novo registro será inserido.
 * @param {object} estoqueData - Os dados do estoque a serem salvos.
 * @returns {Promise<object>} O item de estoque salvo.
 */
export async function salvarEstoque(estoqueData) {
    // Utiliza o método 'upsert' do Supabase para inserir ou atualizar o registro.
    // A coluna 'medicamento_id' tem uma restrição UNIQUE, então a usamos como
    // referência para o conflito (onConflict).
    const { data, error } = await supabase
        .from("estoque_medicamentos")
        .upsert(estoqueData, { onConflict: "medicamento_id" })
        .select();

    if (error) {
        console.error("Erro no upsert do estoque:", error);
        throw error;
    }
    return data;
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