"use client";

import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface StatusChangeModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentStatus: string;
    newStatus: string;
    onConfirm: (note: string) => Promise<void>;
}

export function StatusChangeModal({
    isOpen,
    onClose,
    currentStatus,
    newStatus,
    onConfirm
}: StatusChangeModalProps) {
    const [note, setNote] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await onConfirm(note);
            onClose();
            setNote("");
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                            <AlertTriangle className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-serif text-lg font-medium">Update Order Status</h3>
                                            <p className="text-sm text-secondary">
                                                Changing from <span className="font-medium capitalize">{currentStatus}</span> to <span className="font-medium capitalize text-blue-600">{newStatus}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Note (Optional)
                                        </label>
                                        <textarea
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                            placeholder="Add a reason or note for this change..."
                                            className="w-full h-24 rounded-lg border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={onClose}
                                            className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSubmit}
                                            disabled={isSubmitting}
                                            className="flex-1 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex justify-center items-center"
                                        >
                                            {isSubmitting ? "Updating..." : "Confirm Update"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
