"use client";

import { useState } from "react";
import axios, { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CardHeader, CardContent, Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import * as z from "zod";
import { ApiResponse } from "@/types/ApiResponse";
import Link from "next/link";
import { useParams } from "next/navigation";
import { messageSchema } from "@/schemas/messageSchema";

const specialChar = "||";

export default function SendMessage() {
  const { username } = useParams<{ username: string }>();

  const [completion, setCompletion] = useState(
    "What's your favorite movie?||Do you have any pets?||What's your dream job?"
  );
  const [isSuggestLoading, setIsSuggestLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: { content: "" },
  });

  const messageContent = form.watch("content");

  const handleMessageClick = (message: string) => {
    form.setValue("content", message);
  };

  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    setIsLoading(true);
    try {
      const { data: res } = await axios.post<ApiResponse>(
        "/api/send-message",
        { ...data, username }
      );

      toast.success(res.message);
      form.reset();
    } catch (err) {
      const error = err as AxiosError<ApiResponse>;
      toast.error(error.response?.data.message ?? "Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 Streaming Suggestions
  const fetchSuggestedMessages = async () => {
    setIsSuggestLoading(true);
    setError(null);
    setCompletion("");

    try {
      const response = await fetch("/api/suggest-messages", {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to fetch suggestions");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("Stream not supported");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        setCompletion((prev) => prev + chunk);

        await new Promise((r) => setTimeout(r, 15));
      }
    } catch (err: any) {
      setError(err.message);
      toast.error("Could not get suggestions");
    } finally {
      setIsSuggestLoading(false);
    }
  };

  const messages = completion
    .split(specialChar)
    .filter((m) => m.trim() !== "");

  return (
    <div className="container mx-auto my-8 p-6 bg-white rounded max-w-4xl border shadow-sm">
      <h1 className="text-4xl font-bold mb-6 text-center">
        Public Profile Link
      </h1>

      {/* ✅ SIMPLE FORM (no FormField complexity) */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="font-medium">
            Send Anonymous Message to @{username}
          </label>

          <Textarea
            placeholder="Write your anonymous message here"
            className="resize-none mt-2"
            {...form.register("content")}
          />

          {form.formState.errors.content && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.content.message}
            </p>
          )}
        </div>

        <div className="flex justify-center">
          <Button type="submit" disabled={isLoading || !messageContent}>
            {isLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Send It
          </Button>
        </div>
      </form>

      {/* Suggestions */}
      <div className="space-y-4 my-8">
        <Button
          onClick={fetchSuggestedMessages}
          variant="outline"
          disabled={isSuggestLoading}
        >
          {isSuggestLoading && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Suggest Messages
        </Button>

        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold">Messages</h3>
          </CardHeader>

          <CardContent className="flex flex-col gap-3">
            {error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              messages.map((msg, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="text-left justify-start h-auto py-3"
                  onClick={() => handleMessageClick(msg)}
                >
                  {msg}
                </Button>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Separator className="my-6" />

      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-3">
          Get Your Message Board
        </p>
        <Link href="/sign-up">
          <Button variant="secondary">Create Your Account</Button>
        </Link>
      </div>
    </div>
  );
}