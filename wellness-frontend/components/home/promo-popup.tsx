"use client";

import React, { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  fetchActivePopups,
  selectPopupsData,
  selectPopupsError,
  selectPopupsLoading,
} from "@/lib/redux/features/popupSlice";

const fieldTypeMap: Record<string, "text" | "email" | "number" | "textarea"> = {
  text: "text",
  email: "email",
  number: "number",
  textarea: "textarea",
  message: "textarea",
  phone: "text",
};

const PromoPopup = () => {
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  const popups = useAppSelector(selectPopupsData);
  const isLoading = useAppSelector(selectPopupsLoading);
  const error = useAppSelector(selectPopupsError);

  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const shouldRenderPopup = pathname === "/";

  useEffect(() => {
    setIsMounted(true);
    if (shouldRenderPopup) {
      dispatch(fetchActivePopups());
    }
  }, [dispatch, shouldRenderPopup]);

  const popup = useMemo(
    () => popups?.find((item) => item.status === "active"),
    [popups]
  );

  useEffect(() => {
    if (!isMounted || !shouldRenderPopup || !popup) return;

    const dismissalKey = `wf-popup-dismissed-${popup._id}`;
    const alreadyDismissed = localStorage.getItem(dismissalKey);

    if (alreadyDismissed) {
      setIsOpen(false);
      return;
    }

    const delayMs = Math.max(popup.delay ?? 0, 0) * 1000;

    const timer = setTimeout(() => {
      setIsOpen(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [popup, isMounted, shouldRenderPopup]);

  const handleClose = () => {
    if (popup) {
      localStorage.setItem(`wf-popup-dismissed-${popup._id}`, "true");
    }
    setIsOpen(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleClose();
  };

  if (!shouldRenderPopup) return null;
  if (error) return null;
  if (!isLoading && !popup) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && popup && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-100 md:grid-cols-[1.2fr_1fr]"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 180, damping: 18 }}
              style={{
                backgroundColor: popup.backgroundColor || "#ffffff",
                color: popup.textColor || "#000000",
                borderColor: popup.borderColor || "transparent",
              }}
            >
              <button
                className="absolute right-4 top-4 z-20 rounded-full bg-white/80 p-1.5 text-slate-600 transition-colors hover:bg-red-100 hover:text-red-600"
                onClick={handleClose}
                aria-label="Close popup"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="relative hidden h-full w-full md:block bg-slate-100">
                {popup.image ? (
                  <Image
                    src={popup.image}
                    alt={popup.heading || "Offer"}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 text-white">
                    <span className="text-4xl font-bold tracking-tight">
                      Wellness<span className="text-primary">Fuel</span>
                    </span>
                  </div>
                )}

                {popup.badgeVisible && popup.badgeText && (
                  <span className="absolute left-6 top-6 z-10 rounded-full bg-white/95 px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-900 shadow-md">
                    {popup.badgeText}
                  </span>
                )}
              </div>

              <div className="flex max-h-[90vh] flex-col overflow-y-auto p-6 sm:p-8 custom-scrollbar">
                <div className="mb-6 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary/80">
                    Exclusive Offer
                  </p>
                  <h3 className="text-2xl font-bold leading-tight tracking-tight md:text-3xl">
                    {popup.heading}
                  </h3>
                  <p className="text-sm text-slate-600/90 md:text-base">
                    {popup.subheading}
                  </p>
                </div>

                {popup.fields?.length > 0 ? (
                  <form className="space-y-4" onSubmit={handleSubmit}>
                    {popup.fields.map((field: any, index: number) => {
                      const rawType = field.fieldType?.toLowerCase() || "text";
                      const type = fieldTypeMap[rawType] ?? "text";
                      const fieldId = field._id || `field-${index}`;

                      return (
                        <div key={fieldId}>
                          <label
                            htmlFor={fieldId}
                            className="mb-1.5 block text-xs font-semibold uppercase text-slate-500"
                          >
                            {field.fieldName}{" "}
                            {field.isRequired && (
                              <span className="text-red-500">*</span>
                            )}
                          </label>
                          {type === "textarea" ? (
                            <Textarea
                              id={fieldId}
                              required={field.isRequired}
                              className="bg-slate-50 resize-none focus:bg-white"
                              placeholder={`Enter ${field.fieldName}`}
                              rows={3}
                            />
                          ) : (
                            <Input
                              id={fieldId}
                              type={type}
                              required={field.isRequired}
                              className="bg-slate-50 focus:bg-white h-10"
                              placeholder={`Enter ${field.fieldName}`}
                            />
                          )}
                        </div>
                      );
                    })}

                    <div className="pt-2 space-y-3">
                      <Button
                        type="submit"
                        className="w-full h-11 text-base font-medium shadow-lg shadow-primary/20"
                        style={{
                          backgroundColor: popup.buttonColor,
                          color: popup.buttonTextColor,
                        }}
                      >
                        {popup.ctaButtonText || "Submit"}
                      </Button>

                      {popup.secondaryButtonText && (
                        <Button
                          type="button"
                          variant="ghost"
                          className="w-full h-10 text-sm text-slate-500 hover:text-slate-900"
                          onClick={handleClose}
                        >
                          {popup.secondaryButtonText}
                        </Button>
                      )}
                    </div>
                  </form>
                ) : (
                  <div className="mt-auto flex flex-col gap-3 pt-4">
                    <Button
                      className="w-full h-11 text-base"
                      style={{
                        backgroundColor: popup.buttonColor,
                        color: popup.buttonTextColor,
                      }}
                      onClick={handleClose}
                    >
                      {popup.ctaButtonText || "Get Started"}
                    </Button>
                    {popup.secondaryButtonText && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleClose}
                      >
                        {popup.secondaryButtonText}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PromoPopup;
