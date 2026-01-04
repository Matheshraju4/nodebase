"use client"
import { useForm } from "react-hook-form";
import z, { email } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";

const registerSchema = z.object({
    email: z.email("Enter valid Email"),
    password: z.string().min(1, "Password is Required"),

    confirmPassword: z.string()
}).refine((data) => data.confirmPassword === data.password, {
    message: "Password don't Match",
    path: ["confirmPassword"]
})


type RegisterFormValues = z.infer<typeof registerSchema>
export function RegisterForm() {

    const router = useRouter()
    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: ""
        }
    })


    const onSubmit = async (values: RegisterFormValues) => {
        await authClient.signUp.email({
            name: values.email,
            email: values.email,
            password: values.password,
            callbackURL: "/"

        }, {
            onSuccess: () => {
                router.push("/")
            },
            onError(context) {
                toast.error(context.error.message)
            },
        })
    }


    const isPending = form.formState.isSubmitting

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle>
                        Get Started

                    </CardTitle>

                    <CardDescription>
                        Create and account to get started
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="grid gap-6">

                                <div className="flex flex-col gap-4">

                                    <Button variant={"outline"} className="w-full " type="button" disabled={isPending}>
                                        <Image src="/logos/github.svg" alt="Github" width={20} height={20} />      Continue with Github
                                    </Button>
                                    <Button variant={"outline"} className="w-full " type="button" disabled={isPending}>
                                        <Image src="/logos/google.svg" alt="Github" width={20} height={20} />    Continue with Google
                                    </Button>
                                </div>
                                <div className="grid gap-6">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => {
                                            return <FormItem>
                                                <FormLabel>
                                                    Email
                                                </FormLabel>
                                                <FormControl>
                                                    <Input type="email" placeholder="m@example.com" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        }}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => {
                                            return <FormItem>
                                                <FormLabel>
                                                    Password
                                                </FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="********" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        }}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="confirmPassword"
                                        render={({ field }) => {
                                            return <FormItem>
                                                <FormLabel>
                                                    confirm Password
                                                </FormLabel>
                                                <FormControl>
                                                    <Input type="confirmPassword" placeholder="********" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        }}
                                    />
                                    <Button type="submit" className="w-full" disabled={isPending}>
                                        Sign Up
                                    </Button>
                                </div>

                                <div className="text-center text-sm">Already have an Account?

                                    <Link href={"/login"} className="underline underline-offset-4">Login</Link>
                                </div>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

        </div>
    )


}