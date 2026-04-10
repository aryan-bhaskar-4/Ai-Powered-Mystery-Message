"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema } from "@/schemas/signInSchema";
import * as z from "zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
      if (result.error === "CredentialsSignin") {
        toast.error("Incorrect username or password");
      } else {
        toast.error(result.error);
      }
      return;
    }

    if (result?.url) {
      router.replace("/dashboard");
    }
  };

 return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            Join Mystery Message
          </h1>
          <p className="mb-4 text-gray-600">
            Sign up to start your anonymous adventure
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Username / Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Email/Username
            </label>
            <Input
              type="text"
              placeholder="Email/Username"
              className="bg-gray-50"
              {...register("identifier")}
            />
            {errors.identifier && (
              <p className="text-sm text-red-500">
                {errors.identifier.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Password
            </label>
            <Input
              type="password"
              placeholder="Password"
              className="bg-gray-50"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-black text-white hover:bg-black/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : (
              "Login"
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="text-center mt-4">
          <p>
            Already a member?{" "}
            <Link href="/sign-up" className="text-blue-600 hover:text-blue-800">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}