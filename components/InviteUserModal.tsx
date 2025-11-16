import React, { useState } from 'react';
import { UserRole } from '../types';
import { saasService } from '../services/authService';
import { webhookService } from '../services/webhookService';

interface InviteUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUserInvited: () => void;
}

const InviteUserModal: React.FC<InviteUserModalProps> = ({ isOpen, onClose, onUserInvited }) => {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<UserRole>('tenant');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);
        try {
            await saasService.sendInvitation(email, role);

            // --- Webhook Call ---
            await webhookService.sendWebhook('user.invited', { email, role });
            // --- End Webhook Call ---

            setMessage(`Convite enviado com sucesso para ${email}!`);
            setEmail('');
            onUserInvited();
            setTimeout(() => {
                onClose();
                setMessage('');
            }, 2500);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Falha ao enviar convite.');
        } finally {
            setLoading(false);
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-700">
                    <h3 className="text-xl font-bold text-white">Convidar Novo Usuário</h3>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-2 rounded-lg text-sm">{error}</div>}
                    {message && <div className="bg-green-900/50 border border-green-700 text-green-300 px-4 py-2 rounded-lg text-sm">{message}</div>}
                    <div>
                        <label htmlFor="invite-email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                        <input id="invite-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-sm focus:ring-1 focus:ring-indigo-500"/>
                    </div>
                     <div>
                        <label htmlFor="invite-role" className="block text-sm font-medium text-gray-300 mb-1">Tipo (Role)</label>
                        <select id="invite-role" value={role} onChange={e => setRole(e.target.value as UserRole)} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-sm focus:ring-1 focus:ring-indigo-500">
                            <option value="tenant">Tenant</option>
                            <option value="superadmin">Super Admin</option>
                        </select>
                    </div>
                    <div className="pt-4 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">Cancelar</button>
                        <button type="submit" disabled={loading || !!message} className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900/50 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                             {loading ? 'Enviando...' : 'Enviar Convite'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InviteUserModal;
