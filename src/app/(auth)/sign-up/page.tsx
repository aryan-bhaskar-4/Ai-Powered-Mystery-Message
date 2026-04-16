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
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import Link from "next/link";
import { Loader2 } from "lucide-react";

type FormData = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const [username, setUsername] = useState("");
  const [debouncedUsername] = useDebounceValue(username, 500);
  const [usernameMessage, setUsernameMessage] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  useEffect(() => {
  const checkUsernameUnique = async () => {
    // 1. If the input is empty, clear the message and stop
    if (!debouncedUsername) {
      setUsernameMessage(""); 
      return;
    }

    setIsCheckingUsername(true);
    setUsernameMessage(""); 

    try {
      const response = await axios.get(
        `/api/check-username-unique?username=${debouncedUsername}`
      );
      setUsernameMessage(response.data.message);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      setUsernameMessage(
        axiosError.response?.data.message ?? "Error checking username"
      );
    } finally {
      setIsCheckingUsername(false);
    }
  };

  checkUsernameUnique();
}, [debouncedUsername]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post("/api/sign-up", data);
      const code = response.data.verifyCode;
      console.log(code);
      toast.success(response.data.message);
      router.replace(`/verify/${username}?code=${code}`);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data.message ?? "Signup failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Join Mystery Message
          </h1>
          <p className="mb-4">Sign up to start your anonymous adventure</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Field>
            <FieldLabel>Username</FieldLabel>
            <FieldContent>
              <Input
                placeholder="Username"
                {...form.register("username")}
                onChange={(e) => {
                  form.register("username").onChange(e);
                  setUsername(e.target.value);
                }}
              />
            </FieldContent>
            
            {isCheckingUsername && <Loader2 className="animate-spin h-4 w-4 mt-2" />}
            
            {!isCheckingUsername && usernameMessage && (
              <p className={`text-sm mt-2 ${
                usernameMessage === "Username is unique" 
                ? "text-green-500" 
                : "text-red-500"
              }`}>
                {usernameMessage}
              </p>
            )}
            <FieldError>{form.formState.errors.username?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel>Email</FieldLabel>
            <FieldContent>
              <Input type="email" placeholder="Email" {...form.register("email")} />
            </FieldContent>
            <FieldError>{form.formState.errors.email?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel>Password</FieldLabel>
            <FieldContent>
              <Input type="password" placeholder="Password" {...form.register("password")} />
            </FieldContent>
            <FieldError>{form.formState.errors.password?.message}</FieldError>
          </Field>

          <Button type="submit" className="w-full bg-black text-white" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : (
              "Sign Up"
            )}
          </Button>
        </form>

        <div className="text-center mt-4">
          <p>
            Already a member?{" "}
            <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}


