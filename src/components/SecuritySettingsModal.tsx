import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Trash2,
  EyeOff,
  History,
  X,
  Check,
  AlertTriangle,
} from 'lucide-react';

interface SecuritySettingsModalProps {
  onClose: () => void;
}

export const SecuritySettingsModal: React.FC<SecuritySettingsModalProps> = ({
  onClose,
}) => {
  const [zeroAudioRetention, setZeroAudioRetention] = useState(true);
  const [piiMasking, setPiiMasking] = useState(true);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/v1/security/audit-logs');
        if (res.ok) {
          const data = await res.json();
          setAuditLogs(data);
        }
      } catch (e) {
        console.warn('Failed to fetch audit logs', e);
      }
    }
    fetchLogs();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/25 backdrop-blur-2xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-borderMuted p-6 max-w-xl w-full animate-in zoom-in-95 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-borderMuted mb-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck size={18} className="text-emerald-600" />
            <h3 className="text-sm font-semibold text-textPrimary">
              Безопасность, NDA и Политики Данных (Enterprise RBAC)
            </h3>
          </div>
          <button onClick={onClose} className="text-textSecondary hover:text-textPrimary p-1">
            <X size={15} />
          </button>
        </div>

        <div className="overflow-y-auto space-y-5 flex-1 pr-1 text-xs">
          {/* Zero Audio Storage Policy */}
          <div className="p-4 rounded-xl border border-borderMuted bg-neutral-50/50 flex items-start justify-between">
            <div className="mr-4">
              <div className="flex items-center space-x-2 font-semibold text-textPrimary mb-1">
                <Trash2 size={14} className="text-rose-600" />
                <span>Zero Audio Storage (Мгновенное удаление аудио)</span>
              </div>
              <p className="text-textSecondary leading-relaxed">
                Автоматически стирает сырой двухканальный аудиопоток сразу после завершения генерации транскрипта и заметок. Никакой звук не сохраняется на постоянных дисках.
              </p>
            </div>
            <button
              onClick={() => setZeroAudioRetention(!zeroAudioRetention)}
              className={`w-10 h-5 rounded-full transition p-0.5 flex items-center shrink-0 ${
                zeroAudioRetention ? 'bg-emerald-600 justify-end' : 'bg-neutral-300 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-2xs" />
            </button>
          </div>

          {/* PII Masking */}
          <div className="p-4 rounded-xl border border-borderMuted bg-neutral-50/50 flex items-start justify-between">
            <div className="mr-4">
              <div className="flex items-center space-x-2 font-semibold text-textPrimary mb-1">
                <EyeOff size={14} className="text-blue-600" />
                <span>PII Masking (Анонимизация персональных данных)</span>
              </div>
              <p className="text-textSecondary leading-relaxed">
                Автоматически маскирует пароли, API-ключи, номера кредитных карт и телефоны до отправки в языковые модели.
              </p>
            </div>
            <button
              onClick={() => setPiiMasking(!piiMasking)}
              className={`w-10 h-5 rounded-full transition p-0.5 flex items-center shrink-0 ${
                piiMasking ? 'bg-emerald-600 justify-end' : 'bg-neutral-300 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-2xs" />
            </button>
          </div>

          {/* Audit Logs */}
          <div>
            <div className="flex items-center space-x-1.5 font-semibold text-textPrimary mb-2">
              <History size={14} className="text-textSecondary" />
              <span>Журнал аудита безопасности (Audit Logs):</span>
            </div>

            <div className="space-y-1.5">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-lg border border-borderMuted bg-white text-[11px] flex items-start justify-between"
                >
                  <div>
                    <span className="font-mono font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded mr-1.5">
                      {log.action}
                    </span>
                    <span className="text-textSecondary">{log.details}</span>
                  </div>
                  <span className="font-mono text-textSecondary shrink-0 ml-2">
                    {log.timestamp.split(' ')[1] || log.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-borderMuted flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-900 hover:bg-black text-white rounded-lg text-xs font-medium transition"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
