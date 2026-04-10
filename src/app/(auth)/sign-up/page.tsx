"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema } from "@/schemas/signUpSchema";
import * as z from "zod";

import {
  Field,
  FieldLabel,
  FieldContent,
  FieldError,
} from "@/components/ui/field";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDebounceValue } from "usehooks-ts";
import axios from "axios";
import { toast } from "sonner";
import Link from "next/link";
import { Loader2 } from "lucide-react";

type FormData = z.infer<typeof signUpSchema>;

export default function Page() {
  const [username, setUsername] = useState("");
  const [debouncedUsername] = useDebounceValue(username, 300);
  const [message, setMessage] = useState("");
  const [checking, setChecking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(signUpSchema),
  });

  useEffect(() => {
    if (!debouncedUsername) return;

    const check = async () => {
      setChecking(true);
      try {
        const res = await axios.get(
          `/api/check-username-unique?username=${debouncedUsername}`
        );
        setMessage(res.data.message);
      } catch {
        setMessage("Error checking username");
      } finally {
        setChecking(false);
      }
    };

    check();
  }, [debouncedUsername]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      await axios.post("/api/sign-up", data);
      toast.success("User registered");
      router.push(`/verify/${data.username}`);
    } catch {
      toast.error("Signup failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">

        <div className="text-center">
          <h1 className="text-5xl font-bold mb-6">Join Mystery Message</h1>
          <p className="text-gray-600">
            Sign up to start your anonymous adventure
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          <Field>
            <FieldLabel>Username</FieldLabel>
            <FieldContent>
              <Input
                placeholder="Username"
                {...register("username")}
                onChange={(e) => {
                  register("username").onChange(e);
                  setUsername(e.target.value);
                }}
              />
            </FieldContent>

            {checking && <Loader2 className="animate-spin h-4 w-4" />}

            {message && (
              <p className={`text-sm ${
                message === "Username is unique"
                  ? "text-green-500"
                  : "text-red-500"
              }`}>
                {message}
              </p>
            )}

            <FieldError>{errors.username?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel>Email</FieldLabel>
            <FieldContent>
              <Input type="email" placeholder="Email" {...register("email")} />
            </FieldContent>
            <FieldError>{errors.email?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel>Password</FieldLabel>
            <FieldContent>
              <Input type="password" placeholder="Password" {...register("password")} />
            </FieldContent>
            <FieldError>{errors.password?.message}</FieldError>
          </Field>

          <Button className="w-full bg-black text-white" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : "Sign Up"}
          </Button>
        </form>

        <div className="text-center">
          Already a member?{" "}
          <Link href="/sign-in" className="text-blue-600">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

