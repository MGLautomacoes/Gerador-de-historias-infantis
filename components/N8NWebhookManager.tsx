import React, { useState, useEffect } from 'react';
import { webhookService } from '../services/webhookService';
import { LinkIcon } from './icons';

const N8NWebhookManager: React.FC = () => {
    const [webhookUrl, setWebhookUrl] = useState('');
    const [currentUrl, setCurrentUrl] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        const savedUrl = webhookService.getWebhookUrl();
        if (savedUrl) {
            setWebhookUrl(savedUrl);
            setCurrentUrl(savedUrl);
            setIsConnected(true);
        }
    }, []);
    
    const handleSave = () => {
        webhookService.saveWebhookUrl(webhookUrl);
        setIsConnected(!!webhookUrl);
        setCurrentUrl(webhookUrl);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
    };

    const handleDisconnect = () => {
        webhookService.clearWebhookUrl();
        setWebhookUrl('');
        setCurrentUrl('');
        setIsConnected(false);
    };

    return (
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h3 className="text-xl font-semibold flex items-center">
                        <LinkIcon className="h-6 w-6 mr-3 text-indigo-400"/>
                        Integração N8N
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">Conecte um webhook para receber eventos de usuários em tempo real.</p>
                </div>
                {isConnected ? (
                     <span className="flex items-center text-sm text-green-400 bg-green-900/50 px-3 py-1 rounded-full">
                        <span className="relative flex h-2 w-2 mr-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        Conectado
                    </span>
                ) : (
                     <span className="text-sm text-yellow-400 bg-yellow-900/50 px-3 py-1 rounded-full">
                        Não Conectado
                    </span>
                )}
            </div>

            <div className="mt-4">
                <label htmlFor="webhook-url" className="block text-sm font-medium text-gray-300 mb-2">URL do Webhook</label>
                <div className="flex items-center space-x-2">
                    <input
                        id="webhook-url"
                        type="url"
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                        placeholder="Insira a URL do seu webhook N8N aqui..."
                        className="flex-grow w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-sm focus:ring-1 focus:ring-indigo-500 transition"
                    />
                    {currentUrl && (
                         <button onClick={handleDisconnect} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded-lg transition-colors" aria-label="Desconectar">
                             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path><line x1="2" y1="2" x2="22" y2="22"></line></svg>
                        </button>
                    )}
                     <button onClick={handleSave} disabled={webhookUrl === currentUrl} className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900/50 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                        {showSuccess ? 'Salvo!' : 'Salvar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default N8NWebhookManager;
