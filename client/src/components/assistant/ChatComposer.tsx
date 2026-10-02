import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Mic,
  MicOff,
  Send,
  Paperclip,
  FileText,
  Table,
  User,
  PhoneCall,
  StickyNote,
  X,
  FileSpreadsheet
} from 'lucide-react';

export interface AttachmentChip {
  id: string;
  name: string;
  type: string;
  content: string;
}

interface ChatComposerProps {
  onSendMessage: (message: string, attachments: AttachmentChip[]) => void;
  isLoading?: boolean;
  prefillQuestion?: string | null;
  onClearPrefill?: () => void;
  placeholder?: string;
}

export const ChatComposer: React.FC<ChatComposerProps> = ({
  onSendMessage,
  isLoading = false,
  prefillQuestion,
  onClearPrefill,
  placeholder = 'Ask a collections question or analyze portfolio data...',
}) => {
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<AttachmentChip[]>([]);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (prefillQuestion) {
      setInputText(prefillQuestion);
      if (onClearPrefill) onClearPrefill();
      inputRef.current?.focus();
    }
  }, [prefillQuestion, onClearPrefill]);

  // Click outside to close plus menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowPlusMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSend = () => {
    if ((!inputText.trim() && attachments.length === 0) || isLoading) return;
    onSendMessage(inputText.trim(), attachments);
    setInputText('');
    setAttachments([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const addPresetAttachment = (type: string, name: string, content: string) => {
    const newChip: AttachmentChip = {
      id: `att-${Date.now()}`,
      name,
      type,
      content,
    };
    setAttachments((prev) => [...prev, newChip]);
    setShowPlusMenu(false);
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const toggleSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      // Mock dictation for demo mode
      setIsRecording(true);
      setTimeout(() => {
        setInputText((prev) => (prev ? `${prev} ` : '') + 'Show me customers with overdue loans and recent failed contact attempts.');
        setIsRecording(false);
      }, 1200);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      if (!isRecording) {
        recognition.start();
        setIsRecording(true);

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputText((prev) => (prev ? `${prev} ` : '') + transcript);
          setIsRecording(false);
        };

        recognition.onerror = () => setIsRecording(false);
        recognition.onend = () => setIsRecording(false);
      } else {
        recognition.stop();
        setIsRecording(false);
      }
    } catch {
      setIsRecording(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-3 relative">
      {/* Uploaded Context Attachment Chips */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 pb-2 border-b border-slate-100">
          {attachments.map((chip) => (
            <div
              key={chip.id}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-xs font-medium"
            >
              <FileText className="w-3.5 h-3.5 text-teal-600" />
              <span className="truncate max-w-[200px]">{chip.name}</span>
              <button
                onClick={() => removeAttachment(chip.id)}
                className="hover:text-teal-950 p-0.5 rounded-full"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Composer Controls */}
      <div className="flex items-end gap-2">
        {/* Plus Attachment Button & Dropdown Menu */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setShowPlusMenu(!showPlusMenu)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
            title="Attach Context, Document, or Customer"
          >
            <Plus className="w-5 h-5" />
          </button>

          {/* Plus Menu Popup */}
          {showPlusMenu && (
            <div className="absolute left-0 bottom-12 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Attach Context to Prompt
              </div>

              <button
                type="button"
                onClick={() =>
                  addPresetAttachment(
                    'document',
                    'customer_notes.txt',
                    'Customer Rahul Kumar (CUST-10245) reported corporate payroll date shift from 1st to 7th. Committed to pay INR 22,900 on Oct 9.'
                  )
                }
                className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 text-xs text-slate-700"
              >
                <FileText className="w-4 h-4 text-teal-600" />
                <span>Upload document</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  addPresetAttachment(
                    'csv',
                    'october_delinquency_batch.csv',
                    'customer_id,dpd,outstanding,bucket\nCUST-10245,38,187000,B2\nCUST-10482,72,310000,B3\nCUST-10733,105,520000,B4'
                  )
                }
                className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 text-xs text-slate-700"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Upload CSV</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  addPresetAttachment(
                    'customer',
                    'customer_record_CUST-10245.json',
                    JSON.stringify({ id: 'CUST-10245', name: 'Rahul Kumar', dpd: 38, balance: 187000, bureau: 712 })
                  )
                }
                className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 text-xs text-slate-700"
              >
                <User className="w-4 h-4 text-indigo-600" />
                <span>Customer record</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  addPresetAttachment(
                    'transcript',
                    'call_transcript_TR-901.txt',
                    'Agent Pooja: Discussed loan EMI. Customer committed full settlement on Oct 9th.'
                  )
                }
                className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 text-xs text-slate-700"
              >
                <PhoneCall className="w-4 h-4 text-amber-600" />
                <span>Call transcript</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  addPresetAttachment(
                    'note',
                    'field_agent_note.txt',
                    'Field visit confirmed verified residence. Debtor willing to enroll in restructuring plan.'
                  )
                }
                className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 text-xs text-slate-700"
              >
                <StickyNote className="w-4 h-4 text-rose-600" />
                <span>Agent note</span>
              </button>
            </div>
          )}
        </div>

        {/* Text Area Input */}
        <textarea
          ref={inputRef}
          rows={1}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 max-h-32 min-h-[40px] py-2 px-3 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none transition-all"
        />

        {/* Microphone Button */}
        <button
          type="button"
          onClick={toggleSpeechRecognition}
          className={`p-2 rounded-xl transition-colors border ${
            isRecording
              ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 border-transparent hover:border-slate-200'
          }`}
          title={isRecording ? 'Listening...' : 'Voice Input (Microphone)'}
        >
          {isRecording ? <MicOff className="w-5 h-5 text-rose-600" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={isLoading || (!inputText.trim() && attachments.length === 0)}
          className={`p-2.5 rounded-xl text-white font-medium transition-all shadow-sm ${
            isLoading || (!inputText.trim() && attachments.length === 0)
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-teal-600 hover:bg-teal-700 active:scale-95 shadow-teal-600/20'
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
