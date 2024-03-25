import {ArrowDownIcon, ArrowUpIcon} from '@heroicons/react/20/solid'
import {cn} from "@/lib/utils";
import {embedExistingTasks, getStats} from "@/app/(actions)/actions/admin";
import EmbedTasks from "@/components/admin/embed-tasks";


export default async function AdminDashboard() {


    const stats = await getStats()

    const handleEmbedTasks = async () => {
        "use server"
        await embedExistingTasks()
    }

    return (
        <div className="p-4">
            <div className="flex justify-between">
                <EmbedTasks handleEmbedTasks={handleEmbedTasks}/>
            </div>
            <h3 className="text-base font-semibold leading-6">Last 30 days</h3>

            <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {stats.map((item) => (
                    <div
                        key={item.id}
                        className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6"
                    >
                        <dt>
                            <p className="truncate text-sm font-medium text-gray-500">{item.name}</p>
                        </dt>
                        <dd className="flex items-baseline pb-6 sm:pb-7">
                            <p className="text-2xl font-semibold text-gray-900">{item.stat}</p>
                            <p
                                className={cn(
                                    item.changeType === 'increase' ? 'text-green-600' : 'text-red-600',
                                    'ml-2 flex items-baseline text-sm font-semibold'
                                )}
                            >
                                {item.changeType === 'increase' ? (
                                    <ArrowUpIcon className="h-5 w-5 flex-shrink-0 self-center text-green-500"
                                                 aria-hidden="true"/>
                                ) : (
                                    <ArrowDownIcon className="h-5 w-5 flex-shrink-0 self-center text-red-500"
                                                   aria-hidden="true"/>
                                )}

                                <span
                                    className="sr-only"> {item.changeType === 'increase' ? 'Increased' : 'Decreased'} by </span>
                                {item.change}
                            </p>
                            {/*<div className="absolute inset-x-0 bottom-0 bg-gray-50 px-4 py-4 sm:px-6">*/}
                            {/*  <div className="text-sm">*/}
                            {/*    <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">*/}
                            {/*      View all<span className="sr-only"> {item.name} stats</span>*/}
                            {/*    </a>*/}
                            {/*  </div>*/}
                            {/*</div>*/}
                        </dd>
                    </div>
                ))}
            </dl>
        </div>
    )
}
