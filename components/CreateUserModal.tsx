import React, { useState } from 'react';
import { UserRole } from '../types';
import { saasService } from '../services/authService';
import { webhookService } from '../services/webhookService';

interface CreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUserAdded: () => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, onUserAdded }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole>('tenant');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            await saasService.createUser(email, password, role);
            
            // --- Webhook Call ---
            // Note: We don't have the user ID yet, it's created on the backend.
            // We send the data we have at the time of creation.
            await webhookService.sendWebhook('user.created', { email, role, status: 'pending' });
            // --- End Webhook Call ---

            onUserAdded();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Falha ao criar usuário.');
        } finally {
            setLoading(false);
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-700">
                    <h3 className="text-xl font-bold text-white">Criar Novo Usuário</h3>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-2 rounded-lg text-sm">{error}</div>}
                    <div>
                        <label htmlFor="new-email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                        <input id="new-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-sm focus:ring-1 focus:ring-indigo-500"/>
                    </div>
                     <div>
                        <label htmlFor="new-password" className="block text-sm font-medium text-gray-300 mb-1">Senha</label>
                        <input id="new-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-sm focus:ring-1 focus:ring-indigo-500"/>
                    </div>
                     <div>
                        <label htmlFor="new-role" className="block text-sm font-medium text-gray-300 mb-1">Tipo (Role)</label>
                        <select id="new-role" value={role} onChange={e => setRole(e.target.value as UserRole)} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-sm focus:ring-1 focus:ring-indigo-500">
                            <option value="tenant">Tenant</option>
                            <option value="superadmin">Super Admin</option>
                        </select>
                    </div>
                    <div className="pt-4 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">Cancelar</button>
                        <button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900/50 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                             {loading ? 'Criando...' : 'Criar Usuário'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateUserModal;
