import {auth} from "@/auth";
import NewSubmind from "@/components/submind/new-submind";

export default async function IndexPage() {
    const session = await auth()

    if (!session) return null


    return (
        <>
            <NewSubmind/>
        </>
    )
}
