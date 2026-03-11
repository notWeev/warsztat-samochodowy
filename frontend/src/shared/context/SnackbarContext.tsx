import React, { createContext, useState, useCallback } from "react";

export interface SnackbarMessage {
  id: string;
  message: string;
  severity: "success" | "error" | "info" | "warning";
  duration?: number;
}

export interface SnackbarContextType {
  messages: SnackbarMessage[];
  showSnackbar: (
    message: string,
    severity?: "success" | "error" | "info" | "warning",
    duration?: number,
  ) => void;
  removeSnackbar: (id: string) => void;
}

export const SnackbarContext = createContext<SnackbarContextType | undefined>(
  undefined,
);

interface SnackbarProviderProps {
  children: React.ReactNode;
}

export const SnackbarProvider = ({ children }: SnackbarProviderProps) => {
  const [messages, setMessages] = useState<SnackbarMessage[]>([]);

  const removeSnackbar = useCallback((id: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  }, []);

  const showSnackbar = useCallback(
    (
      message: string,
      severity: "success" | "error" | "info" | "warning" = "info",
      duration = 5000,
    ) => {
      const id = Date.now().toString();
      setMessages((prev) => [...prev, { id, message, severity, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          setMessages((prev) => prev.filter((msg) => msg.id !== id));
        }, duration);
      }
    },
    [],
  );

  const value: SnackbarContextType = {
    messages,
    showSnackbar,
    removeSnackbar,
  };

  return (
    <SnackbarContext.Provider value={value}>
      {children}
    </SnackbarContext.Provider>
  );
};
