"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { RealtimeFeedback } from "@/components/workflow/conversation";

import {
    ApiKeyErrorDialog,
    AudioControls,
    ConnectionStatus,
    WorkflowConfigErrorDialog,
} from "../../run/[runId]/components";
import { useWebSocketRTC } from "../../run/[runId]/hooks";
import type { WorkflowRuntimeNodeTransition } from "./types";

interface EmbeddedVoiceTesterProps {
    workflowId: number;
    workflowRunId: number;
    initialContextVariables?: Record<string, string>;
    accessToken: string;
    onReset: () => void;
    onNodeTransition?: (transition: WorkflowRuntimeNodeTransition) => void;
}

export function EmbeddedVoiceTester({
    workflowId,
    workflowRunId,
    initialContextVariables,
    accessToken,
    onReset,
    onNodeTransition,
}: EmbeddedVoiceTesterProps) {
    const router = useRouter();
    const {
        audioRef,
        audioInputs,
        selectedAudioInput,
        setSelectedAudioInput,
        connectionActive,
        permissionError,
        isCompleted,
        apiKeyModalOpen,
        setApiKeyModalOpen,
        apiKeyError,
        apiKeyErrorCode,
        workflowConfigError,
        workflowConfigModalOpen,
        setWorkflowConfigModalOpen,
        connectionStatus,
        start,
        stop,
        isStarting,
        getAudioInputDevices,
        feedbackMessages,
    } = useWebSocketRTC({
        workflowId,
        workflowRunId,
        accessToken,
        initialContextVariables,
        onNodeTransition,
    });

    return (
        <>
            <div className="flex h-full min-h-0 flex-col gap-3">
                <div className="shrink-0 space-y-3">
                    {isCompleted ? (
                        <div className="flex items-center justify-center">
                            <Button onClick={onReset} size="lg">
                                <RefreshCw className="h-4 w-4" />
                                Start Another Test
                            </Button>
                        </div>
                    ) : (
                        <AudioControls
                            audioInputs={audioInputs}
                            selectedAudioInput={selectedAudioInput}
                            setSelectedAudioInput={setSelectedAudioInput}
                            isCompleted={isCompleted}
                            connectionActive={connectionActive}
                            permissionError={permissionError}
                            start={start}
                            stop={stop}
                            isStarting={isStarting}
                            getAudioInputDevices={getAudioInputDevices}
                        />
                    )}

                    <ConnectionStatus connectionStatus={connectionStatus} />
                </div>

                <div className="min-h-0 flex-1">
                    <RealtimeFeedback
                        mode="live"
                        messages={feedbackMessages}
                        isCallActive={connectionActive}
                        isCallCompleted={isCompleted}
                    />
                </div>

                <audio ref={audioRef} autoPlay playsInline className="hidden" />
            </div>

            <ApiKeyErrorDialog
                open={apiKeyModalOpen}
                onOpenChange={setApiKeyModalOpen}
                error={apiKeyError}
                errorCode={apiKeyErrorCode}
                onNavigateToCredits={() => router.push("/api-keys")}
                onNavigateToModelConfig={() => router.push("/model-configurations")}
            />

            <WorkflowConfigErrorDialog
                open={workflowConfigModalOpen}
                onOpenChange={setWorkflowConfigModalOpen}
                error={workflowConfigError}
                onNavigateToWorkflow={() => router.push(`/workflow/${workflowId}`)}
            />
        </>
    );
}

export default EmbeddedVoiceTester;
