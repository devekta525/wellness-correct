import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
    id: number;
    name: string;
}

interface FormStepsProps {
    steps: Step[];
    currentStep: number;
}

export function FormSteps({ steps, currentStep }: FormStepsProps) {
    return (
        <div className="flex items-center justify-between w-full mb-8 px-2">
            {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                    {/* Step Circle & Label */}
                    <div className="flex flex-col items-center relative z-10">
                        <div
                            className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-sm",
                                currentStep === step.id
                                    ? "bg-blue-600 border-blue-600 text-white ring-4 ring-blue-50"
                                    : currentStep > step.id
                                        ? "bg-emerald-500 border-emerald-500 text-white"
                                        : "bg-white border-slate-200 text-slate-400"
                            )}
                        >
                            {currentStep > step.id ? (
                                <Check className="w-5 h-5" strokeWidth={3} />
                            ) : (
                                <span className="text-sm font-bold">{step.id}</span>
                            )}
                        </div>
                        <span
                            className={cn(
                                "absolute -bottom-7 text-[12px] font-semibold whitespace-nowrap transition-colors duration-300",
                                currentStep === step.id ? "text-blue-600" : currentStep > step.id ? "text-emerald-600" : "text-slate-400"
                            )}
                        >
                            {step.name}
                        </span>
                    </div>

                    {/* Connector Line */}
                    {index < steps.length - 1 && (
                        <div className="flex-1 mx-4 h-[2px] bg-slate-100 relative -mt-5">
                            <div
                                className={cn(
                                    "absolute inset-0 bg-blue-600 transition-all duration-500 ease-in-out",
                                    currentStep > step.id ? "w-full" : "w-0"
                                )}
                            />
                        </div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}
