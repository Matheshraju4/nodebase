

import { requireAuth } from "@/lib/auth-utils"
import { caller } from "@/trpc/server"

const Page = async () => {
  await requireAuth()


  const data = await caller.getUsers()

  return (
    <div className="min-h-screen min-w-screen flex justify-center items-center">
      Protected Server Component
      {JSON.stringify(data)}
    </div>
  )
}

export default Page