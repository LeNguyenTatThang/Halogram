const Notifications = () => {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
                <img
                    src="https://randomuser.me/api/portraits/men/32.jpg"
                    alt="User Avatar"
                    className="w-10 h-10 rounded-full"
                />
                <div>
                    <p className="font-semibold">John Doe</p>
                    <p className="text-gray-600 dark:text-gray-400">Liked your post</p>
                </div>
            </div>
            <div className="flex items-start gap-3">
                <img
                    src="https://randomuser.me/api/portraits/women/42.jpg"
                    alt="User Avatar"
                    className="w-10 h-10 rounded-full"
                />
                <div>
                    <p className="font-semibold">Jane Doe</p>
                    <p className="text-gray-600 dark:text-gray-400">Commented on your post</p>
                </div>
            </div>
        </div>
    )
}

export default Notifications