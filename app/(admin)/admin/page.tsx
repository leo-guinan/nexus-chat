import {auth} from "@/auth";
import AdminDashboard from "@/components/admin/admin-dashboard";
import {isUserAdmin} from "@/app/actions/admin";

export default async function IndexPage() {
    const session = await auth()


    if (!session) return null;

    const isAdmin = await isUserAdmin(session.user.id)

    if (!isAdmin) return null

    return <AdminDashboard/>
}
