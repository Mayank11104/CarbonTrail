import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Train, Utensils, Zap, ShoppingBag, Upload, AlertCircle, RefreshCw } from 'lucide-react';
import { saveScannedLog } from '../api/logs';
import { uploadAndScanBill } from '../../ai/api/coach';
import type { AIScanResponse } from '../../ai/api/coach';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../../config/firebase';

interface ScanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_CONFIG = {
  transport: {
    title: 'Transport',
    Icon: Train,
    color: '#40916C',
    blobColor: 'bg-[#94D4B1]/20',
    textColor: 'text-[#40916C]',
  },
  food: {
    title: 'Food',
    Icon: Utensils,
    color: '#C07B52',
    blobColor: 'bg-[#E8D5B0]/30',
    textColor: 'text-[#C07B52]',
  },
  energy: {
    title: 'Energy',
    Icon: Zap,
    color: '#D97706',
    blobColor: 'bg-[#FFD180]/20',
    textColor: 'text-[#D97706]',
  },
  shopping: {
    title: 'Shopping',
    Icon: ShoppingBag,
    color: '#1B4332',
    blobColor: 'bg-[#95D5B2]/15',
    textColor: 'text-[#1B4332]',
  },
};

export const ScanModal = ({ isOpen, onClose }: ScanModalProps) => {
  const [user] = useAuthState(auth);
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<AIScanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    if (isOpen) {
      resetScanState();
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const resetScanState = () => {
    setFile(null);
    setPreviewUrl(null);
    setIsScanning(false);
    setScanResult(null);
    setError(null);
    setIsSaving(false);
    setSaveSuccess(false);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPEG, or WebP).');
      return;
    }
    setFile(selectedFile);
    setError(null);
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    triggerScan(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerScan = async (selectedFile: File) => {
    if (!user) return;
    setIsScanning(true);
    setError(null);

    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onloadend = async () => {
      try {
        const idToken = await user.getIdToken();
        const base64String = reader.result as string;
        const commaIdx = base64String.indexOf(',');
        const rawBase64 = base64String.substring(commaIdx + 1);
        const mimeType = selectedFile.type;

        const result = await uploadAndScanBill(idToken, rawBase64, mimeType);
        setScanResult(result);
      } catch (err: any) {
        console.error('Scan failed:', err);
        setError(err.message || 'Failed to scan the bill. Please try again.');
      } finally {
        setIsScanning(false);
      }
    };
  };

  const handleSaveLog = async () => {
    if (!user || !scanResult) return;
    setIsSaving(true);
    try {
      const displayOption = scanResult.details || `${scanResult.value} ${scanResult.unit}`;
      await saveScannedLog(
        user.uid,
        scanResult.category,
        displayOption,
        scanResult.value,
        scanResult.carbonImpact
      );
      setSaveSuccess(true);
      setTimeout(() => {
        onClose();
        resetScanState();
      }, 1500);
    } catch (err: any) {
      console.error('Failed to save log:', err);
      setError('Failed to save log to database.');
    } finally {
      setIsSaving(false);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isScanning && !isSaving) onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleBackdropClick}
        >
          {/* Internal CSS */}
          <style>{`
            .scan-modal-container {
              max-width: 500px;
              height: 500px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            }
            .scan-dropzone {
              flex: 1;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 1.5rem;
              text-align: center;
              cursor: pointer;
              transition: all 0.3s ease;
              border-radius: 1rem;
              border: 2px dashed #E8D5B0;
              height: 240px;
            }
            .scan-dropzone:hover {
              border-color: rgba(64, 145, 108, 0.6);
              background-color: rgba(253, 253, 253, 0.5);
            }
            .scan-dropzone.drag-active {
              border-color: #40916C;
              background-color: rgba(64, 145, 108, 0.05);
              transform: scale(0.99);
            }
            .scan-content-area {
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              padding-left: 2rem;
              padding-right: 2rem;
              padding-top: 1rem;
              padding-bottom: 1.5rem;
              flex: 1;
              overflow: hidden;
            }
            .scan-result-wrapper {
              display: flex;
              flex-direction: column;
              width: 100%;
              height: 100%;
              justify-content: space-between;
            }
            .scan-footer-row {
              margin-top: auto;
              padding-top: 0.75rem;
              display: flex;
              gap: 0.75rem;
              width: 100%;
            }
          `}</style>

          {/* Backdrop */}
          <div className="absolute inset-0 bg-[#1C1C1E]/40 backdrop-blur-sm" />

          {/* Modal container */}
          <motion.div
            className="relative bg-[#F5F3EF] rounded-3xl shadow-2xl w-full overflow-hidden border border-[#E8D5B0]/40 z-10 scan-modal-container"
            initial={{ opacity: 0, y: 32, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            {!isScanning && !isSaving && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white border border-[#E8D5B0]/40 flex items-center justify-center text-[#1C1C1E]/30 hover:text-[#1C1C1E]/70 hover:border-[#E8D5B0] transition-all z-20"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Header */}
            <div className="pt-8 pb-4 px-8 border-b border-[#E8D5B0]/20">
              <div className="flex items-center gap-2.5 mb-1">
                <span className="text-xl">📷</span>
                <h2 className="text-[20px] font-bold text-[#1C1C1E] tracking-tight font-display">
                  Scan Bill or Receipt
                </h2>
              </div>
              <p className="text-[13px] text-[#1C1C1E]/45 font-medium ml-9">
                Upload a utility bill or ticket to parse its carbon impact instantly.
              </p>
            </div>

            {/* Content Area */}
            <div className="scan-content-area">
              <AnimatePresence mode="wait">
                {/* 1. Drag & Drop File Upload Screen */}
                {!file && !error && (
                  <motion.div
                    key="dropzone"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="w-full flex-1 flex flex-col"
                  >
                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={onButtonClick}
                      className={`scan-dropzone ${dragActive ? 'drag-active' : ''}`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleChange}
                      />
                      <div className="w-12 h-12 rounded-full bg-[#E8D5B0]/30 flex items-center justify-center mb-4 text-primary">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="font-semibold text-sm text-[#1C1C1E] mb-1">
                        Drag and drop your image here
                      </p>
                      <p className="text-[12px] text-[#1C1C1E]/50">
                        Supports PNG, JPEG, or WebP
                      </p>
                      <button
                        type="button"
                        className="mt-4 px-4 py-2 bg-white hover:bg-neutral-50 text-[#1C1C1E] border border-[#E8D5B0] rounded-xl text-[12px] font-medium shadow-sm transition-all active:scale-[0.97]"
                      >
                        Browse files
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* 2. Scanning / Processing Screen */}
                {file && isScanning && (
                  <motion.div
                    key="scanning"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full flex-1 flex flex-col items-center justify-center py-2"
                  >
                    {/* Simulated Scanner UI */}
                    <div className="relative w-40 h-40 rounded-xl overflow-hidden shadow-md border border-[#E8D5B0]/40 bg-black/5 flex items-center justify-center">
                      {previewUrl && (
                        <img
                          src={previewUrl}
                          alt="Receipt Preview"
                          className="absolute inset-0 w-full h-full object-cover opacity-60 filter blur-[0.5px]"
                        />
                      )}
                      {/* Scanning Line overlay */}
                      <motion.div
                        className="absolute left-0 right-0 h-1 bg-[#40916C] shadow-[0_0_12px_#40916C] z-10"
                        initial={{ top: '0%' }}
                        animate={{ top: '100%' }}
                        transition={{
                          duration: 1.8,
                          ease: 'easeInOut',
                          repeat: Infinity,
                          repeatType: 'reverse',
                        }}
                      />
                      {/* Scanner light effect */}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#40916C]/10 to-transparent pointer-events-none" />
                    </div>

                    <div className="mt-4 flex flex-col items-center gap-1">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#40916C] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#40916C]"></span>
                        </span>
                        <p className="text-[13px] font-semibold text-[#1C1C1E]">
                          Gemini Vision is analyzing...
                        </p>
                      </div>
                      <p className="text-[11px] text-[#1C1C1E]/55 text-center px-4">
                        Extracting categories, amounts, and estimated CO2 footprint
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* 3. Error Screen */}
                {error && !isScanning && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="w-full flex-1 flex flex-col items-center justify-center text-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-3 text-red-500">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-sm text-[#1C1C1E] mb-1">Scan Unsuccessful</h3>
                    <p className="text-[12px] text-red-600/80 mb-4 max-w-xs">{error}</p>
                    <button
                      onClick={resetScanState}
                      className="px-5 py-2 bg-primary text-white rounded-xl text-[12px] font-medium shadow-sm hover:shadow hover:bg-primary/95 transition-all duration-300 flex items-center gap-2 active:scale-[0.97]"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Try Again
                    </button>
                  </motion.div>
                )}

                {/* 4. Results Screen */}
                {scanResult && !isScanning && !error && (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="scan-result-wrapper"
                  >
                    {/* Success / Save success screen */}
                    {saveSuccess ? (
                      <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
                        <motion.div
                          className="w-14 h-14 rounded-full bg-[#40916C]/10 border border-[#40916C]/30 flex items-center justify-center text-[#40916C] mb-4"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                          <Check className="w-7 h-7 stroke-[2.5]" />
                        </motion.div>
                        <h3 className="font-bold text-[18px] text-[#1C1C1E] mb-1">Log Recorded!</h3>
                        <p className="text-[13px] text-[#1C1C1E]/50">
                          Your trail has been successfully updated.
                        </p>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col justify-between h-full">
                        <div>
                          {/* Summary Box */}
                          <div className="p-4 rounded-2xl bg-white border border-[#E8D5B0]/30 shadow-sm flex items-start gap-4 mb-3">
                            {(() => {
                              const config = CATEGORY_CONFIG[scanResult.category] || CATEGORY_CONFIG.shopping;
                              const Icon = config.Icon;
                              return (
                                <>
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0`} style={{ backgroundColor: config.color }}>
                                    <Icon className="w-5 h-5" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                                        {config.title}
                                      </span>
                                      <span className="text-xs font-bold text-[#1C1C1E]" style={{ color: config.color }}>
                                        {scanResult.value} {scanResult.unit}
                                      </span>
                                    </div>
                                    <p className="font-semibold text-[13px] text-[#1C1C1E] leading-snug line-clamp-2">
                                      {scanResult.details || 'Parsed receipt entry.'}
                                    </p>
                                  </div>
                                </>
                              );
                            })()}
                          </div>

                          {/* CO2 impact details */}
                          <div className="rounded-2xl bg-[#E8D5B0]/20 p-4 border border-[#E8D5B0]/30 flex items-center justify-between">
                            <div>
                              <p className="text-[10px] font-bold text-[#1C1C1E]/40 uppercase tracking-wider mb-0.5">
                                Estimated Carbon Footprint
                              </p>
                              <p className="text-[12px] font-medium text-[#1C1C1E]/75">
                                Based on standard emissions factors
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-[20px] font-extrabold text-[#1C1C1E] tracking-tight">
                                {scanResult.carbonImpact.toFixed(1)}
                              </span>
                              <span className="text-[11px] font-bold text-[#1C1C1E]/60 ml-1">
                                kg CO2
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Footer Buttons inside Results Screen */}
                        <div className="scan-footer-row">
                          <button
                            onClick={resetScanState}
                            disabled={isSaving}
                            className="flex-1 py-2.5 bg-white hover:bg-neutral-50 text-[#1C1C1E] border border-[#E8D5B0] rounded-xl text-xs font-medium transition-all active:scale-[0.97] disabled:opacity-50"
                          >
                            Rescan
                          </button>
                          <button
                            onClick={handleSaveLog}
                            disabled={isSaving}
                            className="flex-[2] py-2.5 bg-primary text-white hover:bg-primary/95 rounded-xl text-xs font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.97] disabled:opacity-50"
                          >
                            {isSaving ? (
                              <>
                                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Saving...
                              </>
                            ) : (
                              'Log to My Trail'
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
