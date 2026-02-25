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

/**
 * Registra o uso de um medicamento, diminuindo a quantidade em estoque.
 * @param {string} medicamentoId - O ID do medicamento que foi usado.
 * @param {number} quantidadeParaBaixa - A quantidade a ser subtraída do estoque.
 * @returns {Promise<void>}
 */
export async function darBaixaEstoque(medicamentoId, quantidadeParaBaixa = 1) {
    // 1. Obter o item de estoque atual para pegar a quantidade
    const { data: estoque, error: estoqueError } = await supabase
        .from('estoque_medicamentos')
        .select('id, quantidade_estoque')
        .eq('medicamento_id', medicamentoId)
        .single();

    // Se não houver registro de estoque, não é possível dar baixa.
    if (estoqueError || !estoque) {
        throw new Error('Não há registro de estoque para este medicamento. Adicione-o na tela de Estoque.');
    }

    // 2. Calcular novo estoque e atualizar
    const novoEstoque = estoque.quantidade_estoque - quantidadeParaBaixa;

    const { error: updateError } = await supabase
        .from('estoque_medicamentos')
        .update({
            quantidade_estoque: novoEstoque < 0 ? 0 : novoEstoque, // Previne estoque negativo
            ultima_atualizacao: new Date().toISOString()
        })
        .eq('id', estoque.id);

    if (updateError) {
        console.error('Erro ao atualizar estoque:', updateError);
        throw new Error('Não foi possível atualizar o estoque do medicamento.');
    }
}