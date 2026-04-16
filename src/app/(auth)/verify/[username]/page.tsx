"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { verifySchema } from "@/schemas/verifySchema";
import * as z from "zod";
import React, { useEffect, useRef, useCallback } from "react";

import {
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import axios from "axios";
import { toast } from "sonner";

type FormData = z.infer<typeof verifySchema>;

export default function VerifyAccount() {
  const router = useRouter();
  const params = useParams<{ username: string }>();
  const searchParams = useSearchParams();
  const tempCode = searchParams.get("code");
  
  const hasShownToast = useRef(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied!");
  };

  // Wrapped in useCallback to prevent unnecessary re-renders
  const getCode = useCallback(() => {
    if (tempCode) {
      toast("Verification Code", {
        description: (
          <span className="text-black font-semibold">
            Your code is {tempCode}. (Email service is currently offline).
          </span>
        ),
        duration: 5000,
        action: {
          label: "Copy",
          onClick: () => copyToClipboard(tempCode),
        },
      });
    }
  }, [tempCode]);

  useEffect(() => {
    // If we have a code and haven't shown the toast yet
    if (tempCode && !hasShownToast.current) {
      const timer = setTimeout(() => {
        getCode();
        hasShownToast.current = true;
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [tempCode, getCode]);

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(verifySchema),
    defaultValues: { code: "" },
  });

  const code = watch("code");

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await axios.post("/api/verify-code", {
        username: params.username,
        code: data.code,
      });

      toast.success("Verified successfully");
      router.push("/sign-in");
    } catch {
      toast.error("Verification failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-6">Verify Your Account</h1>
          <p className="text-gray-600">
            Enter the verification code sent to your email
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field>
            <FieldLabel className="text-center block">
              Verification Code
            </FieldLabel>

            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={code}
                onChange={(value) => setValue("code", value)}
              >
                <InputOTPGroup>
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <InputOTPSlot key={i} index={i} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            <FieldError className="text-center">{errors.code?.message}</FieldError>
          </Field>

          <div className="flex flex-col gap-3 pt-2">
            <Button 
              type="submit"
              className="w-full bg-black text-white hover:bg-gray-900" 
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : "Verify Account"}
            </Button>

            <Button
              type="button"
              onClick={getCode} // Instant trigger
              className="w-full bg-black text-white hover:bg-gray-900"
            >
              Get Code
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}