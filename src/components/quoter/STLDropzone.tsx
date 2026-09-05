"use client";

import { useCallback, useState } from "react";

interface STLDropzoneProps {
  onFileLoad: (file: File) => void;
  isLoading: boolean;
  currentFile: string | null;
  onReset: () => void;
}

export default function STLDropzone({
  onFileLoad,
  isLoading,
  currentFile,
  onReset,
}: STLDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.name.toLowerCase().endsWith(".stl")) {
        alert("Solo se aceptan archivos .STL");
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        alert("El archivo es demasiado grande. Máximo 50MB.");
        return;
      }
      onFileLoad(file);
    },
    [onFileLoad]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      e.target.value = "";
    },
    [handleFile]
  );

  if (currentFile) {
    return (
      <div className="rounded-xl glass p-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-400">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{currentFile}</p>
            <p className="text-xs text-emerald-400">✓ Archivo cargado</p>
          </div>
        </div>
        <button
          onClick={onReset}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground bg-white/5 hover:bg-white/10 transition-colors shrink-0"
        >
          Cambiar archivo
        </button>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`relative rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer ${
        isDragging
          ? "border-cyan-500 bg-cyan-500/5 scale-[1.02]"
          : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
      } ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
    >
      <label className="flex flex-col items-center justify-center py-12 px-6 cursor-pointer">
        <input
          type="file"
          accept=".stl"
          onChange={handleInputChange}
          className="sr-only"
        />

        {isLoading ? (
          <>
            <svg className="animate-spin h-10 w-10 text-cyan-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            <p className="text-sm text-muted-foreground">Procesando modelo 3D...</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-cyan-400">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <p className="text-sm font-medium mb-1">
              Arrastra tu archivo <span className="text-cyan-400">.STL</span> aquí
            </p>
            <p className="text-xs text-muted-foreground">
              o haz clic para seleccionar · Máx. 50MB
            </p>
          </>
        )}
      </label>
    </div>
  );
}
