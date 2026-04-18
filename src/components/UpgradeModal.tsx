"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UPI_ID = "9916467570@ybl";
const UPI_NAME = "Jyotish Guru";
const PRICE_INR = 99;

const upiLink = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${PRICE_INR}&cu=INR&tn=${encodeURIComponent("Jyotish Guru Monthly")}`;

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const [step, setStep] = useState<"upgrade" | "verify" | "done">("upgrade");
  const [txnId, setTxnId] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const copyUpi = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const submitTxn = async () => {
    setError("");
    if (txnId.trim().length < 6) {
      setError("Please enter the UPI reference number from your payment app.");
      return;
    }
    setVerifying(true);
    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionId: txnId.trim(),
          amount: PRICE_INR,
          currency: "INR",
          plan: "personal",
          interval: "monthly",
        }),
      });
      if (!res.ok) {
        setError("Couldn't activate. Email us at vinaysolapurkar@gmail.com with this reference.");
        return;
      }
      setStep("done");
      setTimeout(() => window.location.reload(), 2500);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(26, 22, 19, 0.55)", backdropFilter: "blur(8px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 16 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-sm bg-[#F8F3E8] border border-[#E4D7BC] max-h-[92vh] overflow-y-auto"
          >
            <div className="p-8 md:p-10">
              <button
                onClick={onClose}
                className="absolute top-5 right-5 text-[#A59E91] hover:text-[#1A1613] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {step === "done" && (
                <div className="text-center py-10">
                  <div className="w-14 h-14 mx-auto mb-5 rounded-full border border-[#1A1613] flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#8B2E1F]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-[32px] leading-tight text-[#1A1613] mb-3" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                    Welcome.
                  </h3>
                  <p className="text-[#524C44] text-[14px]">
                    Your account is now unlimited. Refreshing...
                  </p>
                </div>
              )}

              {step === "upgrade" && (
                <>
                  <div className="text-[11px] tracking-[0.22em] uppercase text-[#524C44] mb-4">
                    <span className="text-[#8B2E1F]">§</span> Upgrade
                  </div>
                  <h3 className="text-[28px] md:text-[32px] leading-[1.1] tracking-[-0.01em] text-[#1A1613] mb-3" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                    Keep going, unlimited.
                  </h3>
                  <p className="text-[#524C44] text-[14px] leading-[1.55] mb-6">
                    Unlimited questions. Add family and friends. Deeper readings. For ₹99 a month.
                  </p>

                  <div className="space-y-2.5 mb-6 py-5 border-y border-[#E4D7BC]">
                    {[
                      "Unlimited questions, every day",
                      "Add unlimited people (partner, family, friends)",
                      "Every chart detail revealed",
                      "Daily personalized guidance",
                    ].map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="w-1 h-1 rounded-full bg-[#8B2E1F] mt-[9px] shrink-0" />
                        <span className="text-[#1A1613] text-[13px]">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-[44px] leading-none text-[#1A1613]" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                      ₹99
                    </span>
                    <span className="text-[#524C44] text-[14px]">/ month</span>
                  </div>

                  <button
                    onClick={() => setStep("verify")}
                    className="w-full py-3.5 rounded-full bg-[#1A1613] text-[#F8F3E8] text-[13px] font-medium tracking-wide hover:bg-[#2D2520] transition-colors cursor-pointer"
                  >
                    Pay with UPI
                  </button>
                  <p className="text-center text-[#A59E91] text-[11px] mt-3 tracking-wide">
                    PhonePe, GPay, Paytm, BHIM — any UPI app works.
                  </p>
                </>
              )}

              {step === "verify" && (
                <>
                  <div className="text-[11px] tracking-[0.22em] uppercase text-[#524C44] mb-4">
                    <span className="text-[#8B2E1F]">§</span> Pay ₹99
                  </div>
                  <h3 className="text-[24px] leading-tight tracking-[-0.01em] text-[#1A1613] mb-4" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                    Scan, pay, paste reference.
                  </h3>

                  {/* QR code */}
                  <div className="border border-[#E4D7BC] rounded-sm p-4 mb-4 flex flex-col items-center bg-white">
                    <img
                      src="/upi-qr.jpg"
                      alt="UPI QR code"
                      className="w-48 h-48 object-contain rounded-sm"
                    />
                  </div>

                  {/* UPI ID copy */}
                  <div className="mb-4">
                    <div className="text-[10px] tracking-[0.22em] uppercase text-[#524C44] mb-2">UPI ID</div>
                    <div className="flex items-center justify-between gap-3 border border-[#E4D7BC] rounded-sm px-3 py-2.5 bg-[#F5EFDF]">
                      <code className="text-[13px] text-[#1A1613] tabular-nums">{UPI_ID}</code>
                      <button
                        onClick={copyUpi}
                        className="text-[11px] text-[#8B2E1F] font-medium tracking-wide hover:text-[#1A1613]"
                      >
                        {copied ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </div>

                  {/* Direct UPI app launch (mobile) */}
                  <a
                    href={upiLink}
                    className="block w-full text-center py-3 rounded-full bg-[#1A1613] text-[#F8F3E8] text-[13px] font-medium tracking-wide hover:bg-[#2D2520] transition-colors mb-4"
                  >
                    Open UPI app to pay ₹{PRICE_INR}
                  </a>

                  <div className="border-t border-[#E4D7BC] pt-5">
                    <p className="text-[12px] text-[#524C44] mb-3 leading-[1.55]">
                      After paying, enter the 12-digit UPI reference from your payment confirmation:
                    </p>
                    <input
                      type="text"
                      value={txnId}
                      onChange={(e) => setTxnId(e.target.value)}
                      placeholder="e.g. 412345678901"
                      className="w-full px-3 py-2.5 rounded-sm border border-[#E4D7BC] bg-transparent text-[#1A1613] text-[14px] focus:outline-none focus:border-[#1A1613] placeholder-[#A59E91] tabular-nums"
                    />
                    {error && (
                      <p className="text-[12px] text-[#8B2E1F] mt-2">{error}</p>
                    )}
                    <button
                      onClick={submitTxn}
                      disabled={verifying}
                      className="w-full mt-3 py-3 rounded-full border border-[#1A1613] text-[#1A1613] text-[13px] font-medium tracking-wide hover:bg-[#1A1613] hover:text-[#F8F3E8] transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {verifying ? "Activating..." : "Activate my account"}
                    </button>
                  </div>

                  <button
                    onClick={() => setStep("upgrade")}
                    className="w-full mt-3 text-[11px] text-[#A59E91] hover:text-[#1A1613] tracking-wide"
                  >
                    ← Back
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
