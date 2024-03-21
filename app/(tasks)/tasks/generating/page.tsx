"use client"
import {type Metadata} from 'next'
import {useRouter, useSearchParams} from 'next/navigation'
import GenerateTasks from "@/components/tasks/generate-tasks";
import LoadingSpinner from "@/components/loading-spinner";
import {generateTasksFromPlan} from "@/app/(actions)/actions/tasks";
import {useEffect} from "react";

export interface DocumentPageProps {
    params: {
        id: string
    }
}


export default async function GeneratingTasksPage({params}: DocumentPageProps) {
    const searchParams = useSearchParams()
    const documentUUID = searchParams.get('documentUUID')


    const router = useRouter();

  useEffect(() => {
    const performServerAction = async () => {
      try {
          if(documentUUID) {
              await generateTasksFromPlan(documentUUID)

              router.push('/tasks');
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
