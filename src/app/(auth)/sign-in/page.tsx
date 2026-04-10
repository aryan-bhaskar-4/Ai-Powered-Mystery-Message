"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema } from "@/schemas/signInSchema";
import * as z from "zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldError,
} from "@/components/ui/field";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import Link from "next/link";
import { Loader2 } from "lucide-react";

type FormData = z.infer<typeof signInSchema>;

export default function Page() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      redirect: false,
      identifier: data.identifier,
      password: data.password,
    });

    setIsSubmitting(false);

    if (result?.error) {
      toast.error("Invalid credentials");
      return;
    }

    router.replace("/dashboard");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-6">Join Mystery Message</h1>
          <p className="text-gray-600">
            Login to start your anonymous adventure
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          <Field>
            <FieldLabel>Email/Username</FieldLabel>
            <FieldContent>
              <Input placeholder="Email/Username" {...register("identifier")} />
            </FieldContent>
            <FieldError>{errors.identifier?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel>Password</FieldLabel>
            <FieldContent>
              <Input type="password" placeholder="Password" {...register("password")} />
            </FieldContent>
            <FieldError>{errors.password?.message}</FieldError>
          </Field>

          <Button className="w-full bg-black text-white" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : "Login"}
          </Button>
        </form>

        <div className="text-center">
          Don’t have an account?{" "}
          <Link href="/sign-up" className="text-blue-600">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}


