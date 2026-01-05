
"use client"
import { Button } from "@/components/ui/button"
// import { requireAuth } from "@/lib/auth-utils"
import { useTRPC } from "@/trpc/client"
// import { caller } from "@/trpc/server"
import { useMutation, useQuery } from "@tanstack/react-query"

const Page = () => {
  // await requireAuth()


  const trpc = useTRPC()

  const { data } = useQuery(trpc.getWorkflows.queryOptions())

  const create = useMutation(trpc.createWorkflow.mutationOptions({

  }))

  const generateText = useMutation(trpc.testAi.mutationOptions({}))


  return (
    <div className="min-h-screen min-w-screen flex justify-center items-center">
      Protected Server Component
      {JSON.stringify(data)}

      {JSON.stringify(generateText.data, null, 2)}
      <Button disabled={create.isPending} onClick={() => {
        create.mutate()
      }}>Create Workflow</Button>

      <Button disabled={generateText.isPending} onClick={() => { generateText.mutate() }}>TextAI</Button>
    </div>
  )
}

export default Page