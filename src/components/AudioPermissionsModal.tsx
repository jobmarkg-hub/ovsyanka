import React, { useState, useEffect } from 'react';
import { Mic, Volume2, Eye, Check, ShieldAlert, ArrowRight, X } from 'lucide-react';

interface AudioPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGrantedAll?: () => void;
}

export const AudioPermissionsModal: React.FC<AudioPermissionsModalProps> = ({
  isOpen,
  onClose,
  onGrantedAll,
}) => {
  const [micGranted, setMicGranted] = useState(false);
  const [sysAudioGranted, setSysAudioGranted] = useState(false);
  const [accessibilityGranted, setAccessibilityGranted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (localStorage.getItem('ovsyanka_mic_granted') === 'true') {
      setMicGranted(true);
    }
    if (localStorage.getItem('ovsyanka_sys_granted') === 'true') {
      setSysAudioGranted(true);
    }
    if (localStorage.getItem('ovsyanka_acc_granted') === 'true') {
      setAccessibilityGranted(true);
    }

    // Check existing permissions if already granted in browser
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'microphone' as PermissionName })
        .then((status) => {
          if (status.state === 'granted') {
            setMicGranted(true);
            localStorage.setItem('ovsyanka_mic_granted', 'true');
          }
        })
        .catch(() => {});
    }
  }, []);

  if (!isOpen) return null;

  const handleRequestMic = async () => {
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicGranted(true);
      localStorage.setItem('ovsyanka_mic_granted', 'true');
      stream.getTracks().forEach((t) => t.stop());
    } catch (err: any) {
      console.warn('Mic permission error:', err);
      setErrorMsg('Пожалуйста, разрешите доступ к микрофону в диалоговом окне браузера/системы.');
    }
  };

  const handleRequestSystemAudio = async () => {
    setErrorMsg(null);
    try {
      if ((window as any).electronAPI) {
        setSysAudioGranted(true);
        localStorage.setItem('ovsyanka_sys_granted', 'true');
      } else if (navigator.mediaDevices.getDisplayMedia) {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        setSysAudioGranted(true);
        localStorage.setItem('ovsyanka_sys_granted', 'true');
        stream.getTracks().forEach((t) => t.stop());
      } else {
        setSysAudioGranted(true);
        localStorage.setItem('ovsyanka_sys_granted', 'true');
      }
    } catch (err: any) {
      console.warn('System audio error:', err);
      setSysAudioGranted(true);
      localStorage.setItem('ovsyanka_sys_granted', 'true');
    }
  };

  const handleRequestAccessibility = () => {
    setAccessibilityGranted(true);
    localStorage.setItem('ovsyanka_acc_granted', 'true');
  };

  const handleContinue = () => {
    localStorage.setItem('ovsyanka_permissions_onboarded', 'true');
    onClose();
    if (onGrantedAll) onGrantedAll();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-borderMuted p-8 max-w-lg w-full animate-in zoom-in-95 relative overflow-hidden">
        {/* Colorful top border pattern matching screenshot */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-lime-500 via-amber-400 to-pink-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-textSecondary hover:text-textPrimary p-1.5 rounded-full hover:bg-neutral-100 transition"
        >
          <X size={16} />
        </button>

        {/* Title & Description */}
        <h2 className="text-3xl font-serif font-normal text-textPrimary tracking-tight mb-2 pr-6">
          Allow Ovsyanka to transcribe your meetings
        </h2>
        <p className="text-xs text-textSecondary leading-relaxed mb-6">
          When you turn it on, Ovsyanka transcribes meetings using your computer's audio. No creepy bots join your meeting.
        </p>

        {/* Permission Rows */}
        <div className="border border-borderMuted rounded-2xl divide-y divide-borderMuted overflow-hidden mb-6">
          {/* Row 1: Microphone */}
          <div className="p-4 flex items-center justify-between bg-white hover:bg-neutral-50/50 transition">
            <div>
              <div className="text-xs font-semibold text-textPrimary">Transcribe my voice</div>
              <div className="text-[11px] text-textSecondary">Your microphone input</div>
            </div>

            {micGranted ? (
              <span className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-medium">
                <Check size={13} />
                <span>Enabled</span>
              </span>
            ) : (
              <button
                onClick={handleRequestMic}
                className="flex items-center space-x-2 px-3.5 py-1.5 bg-neutral-900 hover:bg-black text-white rounded-full text-xs font-medium transition shadow-sm"
              >
                <Mic size={13} />
                <span>Enable Microphone</span>
              </button>
            )}
          </div>

          {/* Row 2: System Audio */}
          <div className="p-4 flex items-center justify-between bg-white hover:bg-neutral-50/50 transition">
            <div>
              <div className="text-xs font-semibold text-textPrimary">Transcribe other people's voices</div>
              <div className="text-[11px] text-textSecondary">Remote participants via ScreenCaptureKit</div>
            </div>

            {sysAudioGranted ? (
              <span className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-medium">
                <Check size={13} />
                <span>Enabled</span>
              </span>
            ) : (
              <button
                onClick={handleRequestSystemAudio}
                className="flex items-center space-x-2 px-3.5 py-1.5 bg-neutral-900 hover:bg-black text-white rounded-full text-xs font-medium transition shadow-sm"
              >
                <Volume2 size={13} />
                <span>Enable System Audio</span>
              </button>
            )}
          </div>

          {/* Row 3: Accessibility / Active window */}
          <div className="p-4 flex items-center justify-between bg-white hover:bg-neutral-50/50 transition">
            <div>
              <div className="text-xs font-semibold text-textPrimary flex items-center space-x-1">
                <span>See who's speaking</span>
                <span className="text-[10px] text-textSecondary opacity-70">ⓘ</span>
              </div>
              <div className="text-[11px] text-textSecondary">Detect meeting windows & active speakers</div>
            </div>

            {accessibilityGranted ? (
              <span className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-medium">
                <Check size={13} />
                <span>Enabled</span>
              </span>
            ) : (
              <button
                onClick={handleRequestAccessibility}
                className="flex items-center space-x-2 px-3.5 py-1.5 bg-neutral-900 hover:bg-black text-white rounded-full text-xs font-medium transition shadow-sm"
              >
                <Eye size={13} />
                <span>Enable accessibility</span>
              </button>
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center space-x-2">
            <ShieldAlert size={14} className="shrink-0 text-amber-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Footer Continue Button */}
        <div className="flex justify-end">
          <button
            onClick={handleContinue}
            className={`px-6 py-2 rounded-xl text-xs font-medium transition shadow-sm flex items-center space-x-1.5 ${
              micGranted || sysAudioGranted
                ? 'bg-neutral-900 text-white hover:bg-black cursor-pointer'
                : 'bg-neutral-200 text-neutral-500 cursor-pointer hover:bg-neutral-300'
            }`}
          >
            <span>Continue</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
