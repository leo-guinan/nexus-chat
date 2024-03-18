import {auth} from "@/auth";
import Tasks from "@/components/tasks/tasks";
import {getTasks, isUserAdmin} from "@/app/actions";
import AdminDashboard from "@/components/admin/admin-dashboard";

export default async function IndexPage() {
    const session = await auth()


    if (!session) return null;

    const isAdmin = await isUserAdmin(session.user.id)

    if (!isAdmin) return null

    return <AdminDashboard />
}
