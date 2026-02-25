import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { resolveClientCommand } from "./commands";
import terminalApi from "../../services/terminalApi";

export default function useTerminal() {
  const { t } = useTranslation();
  const [history, setHistory] = useState([
    { type: "output", content: `${t("terminal.messages.welcome")}\n${t("terminal.messages.welcomeHelp")}\n`, outputType: "info" },
  ]);
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentInput, setCurrentInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const terminalRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history, isProcessing]);

  const focusInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      if (e) e.preventDefault();
      const input = currentInput.trim();
      if (!input) return;

      setHistory((prev) => [...prev, { type: "input", content: input }]);

      setCommandHistory((prev) => [...prev, input]);
      setHistoryIndex(-1);
      setCurrentInput("");

      const result = resolveClientCommand(input, commandHistory, t);

      if (result) {
        if (result.type === "clear") {
          setHistory([]);
          return;
        }

        if (result.type === "exit") {
          setHistory((prev) => [
            ...prev,
            { type: "output", content: result.output, outputType: "info" },
          ]);
          setTimeout(() => {
            window.location.href = "/";
          }, 1500);
          return;
        }

        setHistory((prev) => [
          ...prev,
          {
            type: "output",
            content: result.output,
            outputType: result.type,
          },
        ]);
        return;
      }

      setIsProcessing(true);
      try {
        const response = await terminalApi.execute(input);
        setHistory((prev) => [
          ...prev,
          {
            type: "output",
            content: response.output,
            outputType: response.type,
          },
        ]);
      } catch {
        setHistory((prev) => [
          ...prev,
          {
            type: "output",
            content: t("terminal.messages.connectionError"),
            outputType: "error",
          },
        ]);
      } finally {
        setIsProcessing(false);
      }
    },
    [currentInput, commandHistory, t]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (commandHistory.length === 0) return;
        const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (historyIndex <= 0) {
          setHistoryIndex(-1);
          setCurrentInput("");
          return;
        }
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (e.key === "Tab") {
        e.preventDefault();
        const partial = currentInput.toLowerCase().trim();
        const completions = [
          "help", "whoami", "neofetch", "hostname", "pwd", "date",
          "uname -a", "ls", "ls -la", "cat resume.txt", "sudo hire-me",
          "clear", "exit", "history", "echo", "top", "uptime", "id",
          "kubectl get pods", "kubectl get deployments", "kubectl get services",
          "kubectl get nodes", "kubectl get namespaces", "kubectl get pods -n ",
          "kubectl get deploy -n ", "kubectl get svc -n ",
        ];
        const match = completions.find((c) => c.startsWith(partial) && c !== partial);
        if (match) setCurrentInput(match);
      } else if (e.key === "l" && e.ctrlKey) {
        e.preventDefault();
        setHistory([]);
      }
    },
    [commandHistory, historyIndex, currentInput]
  );

  return {
    history,
    currentInput,
    setCurrentInput,
    isProcessing,
    handleSubmit,
    handleKeyDown,
    terminalRef,
    inputRef,
    focusInput,
  };
}
