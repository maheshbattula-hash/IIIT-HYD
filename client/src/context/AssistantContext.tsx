import React, { createContext, useContext, useState } from 'react';

interface AssistantContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggleOpen: () => void;
  activeCustomerId: string | null;
  setActiveCustomerId: (id: string | null) => void;
  pendingQuestion: string | null;
  setPendingQuestion: (q: string | null) => void;
  askAssistant: (question: string, customerId?: string) => void;
}

const AssistantContext = createContext<AssistantContextType | undefined>(undefined);

export const AssistantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCustomerId, setActiveCustomerId] = useState<string | null>(null);
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);

  const toggleOpen = () => setIsOpen((prev) => !prev);

  const askAssistant = (question: string, customerId?: string) => {
    if (customerId) setActiveCustomerId(customerId);
    setPendingQuestion(question);
    setIsOpen(true);
  };

  return (
    <AssistantContext.Provider
      value={{
        isOpen,
        setIsOpen,
        toggleOpen,
        activeCustomerId,
        setActiveCustomerId,
        pendingQuestion,
        setPendingQuestion,
        askAssistant,
      }}
    >
      {children}
    </AssistantContext.Provider>
  );
};

export const useAssistant = () => {
  const context = useContext(AssistantContext);
  if (!context) {
    throw new Error('useAssistant must be used within an AssistantProvider');
  }
  return context;
};
