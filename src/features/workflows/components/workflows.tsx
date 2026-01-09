"use client";

import { EntityContainer, EntityHeader, EntityPagination, EntitySearch } from "@/components/entity-components";
import { useCreateWorkflow, useSuspenseWorkflows } from "../hooks/use-workflow";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { useRouter } from "next/navigation";
import { useWorkflowParams } from "../hooks/use-workflows-params";
import { useEntitySearch } from "@/hooks/use-entity-search";




export const WorkflowsSearch = () => {

    const [params, setParams] = useWorkflowParams()

    const { searchValue, onSearchChange } = useEntitySearch({
        params, setParams
    })
    return <EntitySearch
        value={searchValue}
        onChange={onSearchChange}
        placeholder="Search workflows"

    />
}
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



export const WorkflowPagination = () => {
    const workflows = useSuspenseWorkflows();

    const [params, setParams] = useWorkflowParams()
    return <EntityPagination disabled={workflows.isFetching} totalPages={workflows.data.totalPages} page={workflows.data.page} onPageChange={(page) => setParams({ ...params, page })} />
}

export const WorkflowsContainer = ({ children }: { children: React.ReactNode }) => {
    return (<EntityContainer
        header={<WorkflowsHeader />}
        search={<WorkflowsSearch />}
        pagination={<WorkflowPagination />}
    >
        {children}
    </EntityContainer>)
}