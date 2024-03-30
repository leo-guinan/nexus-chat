"use client"
import {type Metadata} from 'next'
import {useRouter, useSearchParams} from 'next/navigation'
import GenerateTasks from "@/components/tasks/generate-tasks";
import LoadingSpinner from "@/components/loading-spinner";
import {generateTasksFromPlan} from "@/app/actions/tasks";
import {useEffect} from "react";


export default function GeneratingTasksPage() {
    const searchParams = useSearchParams()
    const documentUUID = searchParams.get('documentUUID')
    const taskUUID = searchParams.get('taskUUID')


    const router = useRouter();

  useEffect(() => {
    const performServerAction = async () => {
      try {
          if(documentUUID && taskUUID) {
              await generateTasksFromPlan(documentUUID, taskUUID)
              router.push(`/tasks/${taskUUID}`);
          } else {
              router.push('/');
          }
      } catch (error) {
        console.error('An error occurred:', error);
        // Handle the error (optional)
      }
    };

    performServerAction();
  }, [router]);




    return (
        <>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                    <LoadingSpinner label={"Generating Tasks..."} />
                </div>
            </div>
        </>

    )
}
