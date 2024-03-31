"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { School } from "@prisma/client";
import { Landmark, Lock, Mail } from "lucide-react";
import { signIn } from "next-auth/react";
import React, { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { TypeOf, z } from "zod";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  institution: z.string().min(1, { message: "Select a valid institution " }),
});

type CreateUserInput = TypeOf<typeof formSchema>;

export function RegisterForm({ schools }: { schools: School[] }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      institution: "",
    },
  });

  const {
    reset,
    handleSubmit,
    register,
    formState: { errors },
  } = form;

  const onSubmitHandler: SubmitHandler<CreateUserInput> = async (values) => {
    try {
      setSubmitting(true);
      setError(null);

      const res = await fetch("/api/register", {
        method: "POST",
        body: JSON.stringify(values),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const message = (await res.json()).message;
        if (message.includes("Invalid `prisma.user.create()` invocation")) {
          setError("This email address is already registered.");
        } else {
          setError("An error occurred during registration.");
        }
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        signIn(undefined, { callbackUrl: "/" });
      }, 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      {error && (
        <p
          style={{
            backgroundColor: "#ffcccc",
            fontWeight: "500",
            color: "red",
            padding: "10px",
            borderRadius: "5px",
            marginBottom: "10px",
          }}
        >
          {error}
        </p>
      )}
      {success && (
        <p
          style={{
            backgroundColor: "#ccffcc",
            fontWeight: "500",
            color: "green",
            padding: "10px",
            borderRadius: "5px",
            marginBottom: "10px",
            fontSize: "10px",
          }}
        >
          Registration successful. Redirecting to sign-in...
        </p>
      )}
      <form onSubmit={handleSubmit(onSubmitHandler)}>
        <FormField
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your email</FormLabel>
              <FormControl>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 10,
                    marginTop: 10,
                  }}
                >
                  <Mail size={30} style={{ marginRight: 8 }} />
                  <Input
                    style={{ width: "500px" }}
                    placeholder="e.g. john@doe.com"
                    {...register("email")}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your password</FormLabel>
              <FormControl>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 10,
                    marginTop: 10,
                  }}
                >
                  <Lock size={18} style={{ marginRight: 8 }} />
                  <Input
                    type="password"
                    placeholder="e.g. password123"
                    {...register("password")}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="institution"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your institution</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: 10,
                      marginTop: 10,
                    }}
                  >
                    <Landmark size={18} style={{ marginRight: 8 }} />
                    <SelectTrigger>
                      <SelectValue
                        placeholder="Select Institution"
                        {...register("institution")}
                      />
                    </SelectTrigger>
                  </div>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    {schools.map((school) => (
                      <SelectItem key={school.id} value={school.id}>
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div style={{ textAlign: "center", paddingBottom: 15, paddingTop: 5 }}>
          <Button
            type="submit"
            style={{ width: 200, borderRadius: 10 }}
            disabled={submitting}
          >
            Register
          </Button>
        </div>
      </form>
      <hr style={{ borderColor: "gray" }} />
    </Form>
  );
}
