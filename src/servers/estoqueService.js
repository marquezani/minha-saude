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
 * Isso é feito chamando uma função (RPC) no banco de dados.
 * @param {string} medicamentoId - O ID do medicamento que foi usado.
 * @param {number} quantidadeParaBaixa - A quantidade a ser subtraída do estoque.
 * @returns {Promise<void>}
 */
export async function darBaixaEstoque(medicamentoId, quantidadeParaBaixa = 1) {
    const { error } = await supabase.rpc('dar_baixa_estoque', {
        p_medicamento_id: medicamentoId,
        p_quantidade_usada: quantidadeParaBaixa
    });

    if (error) {
        console.error('Erro ao chamar RPC para dar baixa no estoque:', error);
        // Se o erro for a função não existir, dá uma dica mais clara.
        if (error.code === '42883') { // "42883" is "undefined_function" in PostgreSQL
            throw new Error('Função "dar_baixa_estoque" não encontrada no banco de dados. Por favor, crie a função no editor SQL do Supabase.');
        }
        throw new Error('Não foi possível atualizar o estoque do medicamento.');
    }
}