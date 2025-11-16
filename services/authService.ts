import { supabase, supabaseInitializationError } from './supabase';
import { User, UserStatus, UserRole } from '../types';
import { Session } from '@supabase/supabase-js';
import { webhookService } from './webhookService';

const getSupabaseClient = () => {
    if (supabaseInitializationError) throw new Error(supabaseInitializationError);
    if (!supabase) throw new Error('Cliente Supabase não foi inicializado corretamente.');
    return supabase;
}

// Combina a lógica de autenticação e gerenciamento de perfis (admin)
export const saasService = {
    // --- Session Management ---
    onAuthStateChange: (callback: (event: string, session: Session | null) => void) => {
        const supabaseClient = getSupabaseClient();
        // A linha original estava desestruturando o objeto e retornando apenas a 'subscription',
        // mas o componente App.tsx esperava o objeto completo { data: { subscription } }.
        // Retornar o objeto inteiro do Supabase corrige a inconsistência.
        return supabaseClient.auth.onAuthStateChange(callback);
    },

    // --- Auth Actions ---
    login: async (email: string, password: string) => {
        const supabaseClient = getSupabaseClient();
        const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) throw error;
    },
    signup: async (email: string, password: string, phone: string, ddi: string) => {
        const supabaseClient = getSupabaseClient();
        const { data, error } = await supabaseClient.auth.signUp({ 
            email, 
            password,
            options: {
                data: {
                    phone: phone, // Passa o telefone para ser usado pelo trigger do DB
                    ddi: ddi,     // Passa o DDI para ser usado pelo trigger do DB
                }
            }
        });
        if (error) throw error;
        
        if (data.user) {
            // FIX: Adiciona uma chamada de atualização explícita para garantir que o DDI seja salvo.
            // Isso serve como uma proteção caso o gatilho do banco de dados não esteja configurado
            // para copiar o campo 'ddi' do 'auth.users' para a tabela 'profiles'.
            const { error: updateError } = await supabaseClient
                .from('profiles')
                .update({ ddi: ddi })
                .eq('id', data.user.id);

            if (updateError) {
                // Loga um aviso em vez de lançar um erro, pois o cadastro em si foi bem-sucedido.
                console.warn(`Could not explicitly update DDI for user ${data.user.id}:`, updateError.message);
            }

            // --- Webhook Call ---
            // Dispara o webhook após o cadastro bem-sucedido.
            // O gatilho do banco de dados criará o perfil com a role 'tenant' e status 'pending'.
            // Enviamos esses dados assumidos junto com os dados que já temos.
            await webhookService.sendWebhook('user.created', {
                id: data.user.id,
                email: data.user.email,
                phone: data.user.user_metadata.phone,
                ddi: data.user.user_metadata.ddi,
                role: 'tenant', 
                status: 'pending' 
            });
        }
    },
    loginWithGoogle: () => {
        const supabaseClient = getSupabaseClient();
        supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin,
            }
        });
    },
    logout: async () => {
        const supabaseClient = getSupabaseClient();
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;
    },
    
    // --- Profile/Admin Data Management ---
    getProfileForUser: async (userId: string): Promise<Omit<User, 'email' | 'id'> | null> => {
        const supabaseClient = getSupabaseClient();
        const { data: profile, error } = await supabaseClient
            .from('profiles')
            .select('role, status, phone, ddi')
            .eq('id', userId)
            .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 = "object not found"
            console.error('Error fetching profile:', error.message);
            throw error; // Throw for actual errors
        }
        return profile;
    },
    
    getAllUsers: async (): Promise<User[]> => {
        const supabaseClient = getSupabaseClient();
        const { data: profiles, error } = await supabaseClient
            .from('profiles')
            .select('id, email, role, status, phone, ddi');
            
        if (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
        return (profiles as User[]) || [];
    },
    
    updateUserStatus: async (id: string, status: UserStatus): Promise<User> => {
        const supabaseClient = getSupabaseClient();
        const { data, error } = await supabaseClient
            .from('profiles')
            .update({ status })
            .eq('id', id)
            .select()
            .single();
        
        if (error) {
            console.error('Error updating user status:', error);
            throw error;
        }
        return data as User;
    },

    createUser: async (email: string, password: string, role: UserRole) => {
        const supabaseClient = getSupabaseClient();
        // Esta função requer uma Supabase Edge Function chamada 'create-user' para ser implantada.
        // A Edge Function deve usar a 'service_role key' para criar um usuário e seu perfil.
        const { data, error } = await supabaseClient.functions.invoke('create-user', {
            body: { email, password, role },
        });
        
        if (error) {
            console.error("Error invoking create-user function:", error);
            // Fornece uma mensagem de erro mais útil se a função não for encontrada
            if (error.message.includes('Function not found')) {
                throw new Error("A função de backend 'create-user' não foi encontrada. Certifique-se de que ela foi implantada no Supabase.");
            }
            throw new Error(`Falha na comunicação com o backend: ${error.message}`);
        }
    
        if (data.error) {
            console.error("Backend error from create-user function:", data.error);
            throw new Error(`Erro do servidor ao criar usuário: ${data.error}`);
        }
    
        return data;
    },

    sendInvitation: async (email: string, role: UserRole) => {
        const supabaseClient = getSupabaseClient();
        // Requer uma Supabase Edge Function 'send-invitation' que usa `supabase.auth.admin.inviteUserByEmail()`
        const { data, error } = await supabaseClient.functions.invoke('send-invitation', {
            body: { email, role },
        });
        
        if (error) {
            console.error("Error invoking send-invitation function:", error);
            if (error.message.includes('Function not found')) {
                throw new Error("A função de backend 'send-invitation' não foi encontrada. Certifique-se de que ela foi implantada no Supabase.");
            }
            throw new Error(`Falha na comunicação com o backend: ${error.message}`);
        }
    
        if (data.error) {
            console.error("Backend error from send-invitation function:", data.error);
            throw new Error(`Erro do servidor ao convidar usuário: ${data.error}`);
        }
    
        return data;
    },
};