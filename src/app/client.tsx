"use client"

import { useTRPC } from "@/trpc/client"
import { useSuspenseQuery } from "@tanstack/react-query"

export const Client = () => {
    const trpc = useTRPC()
    const { data: users } = useSuspenseQuery(trpc.hello.queryOptions())

    return <div>
        {JSON.stringify(users)}
    </div>
}