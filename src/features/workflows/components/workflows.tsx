"use client";

import { EntityContainer, EntityHeader } from "@/components/entity-components";
import { useCreateWorkflow, useSuspenseWorkflows } from "../hooks/use-workflow";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { useRouter } from "next/navigation";


export const WorkflowsList = () => {
    const workflows = useSuspenseWorkflows();
    return <div className="flex-1 flex items-center justify-center">
        <p>{JSON.stringify(workflows.data, null, 2)}</p>
    </div>;
};

export const WorkflowsHeader = ({ disabled }: { disabled?: boolean }) => {


    const createWorkFlow = useCreateWorkflow()

    const router = useRouter()
    const { handleError, modal } = useUpgradeModal()
    const handleCreate = () => {
        createWorkFlow.mutate(undefined, {

            onSuccess: (data) => {
                router.push(`/workflows/${data.id}`)
            },
            onError: (error) => {
                handleError(error)
            }
        })
    }
    return (
        <>

            {modal}
            <EntityHeader
                title="Workflows"
                description="Create and manage your workflows"
                onNew={handleCreate}
                newButtonLabel="New workflow"
                disabled={disabled}
                isCreating={createWorkFlow.isPending}
            />
        </>
    );
};

export const WorkflowsContainer = ({ children }: { children: React.ReactNode }) => {
    return (<EntityContainer
        header={<WorkflowsHeader />}
        search={<></>}
        pagination={<></>}
    >
        {children}
    </EntityContainer>)
}