const suggestedUsers = [
    {
        id: 1,
        username: "cristiano",
        name: "Cristiano Ronaldo",
        avatar: "https://i.pravatar.cc/150?img=1"
    },
    {
        id: 2,
        username: "mrbeast",
        name: "MrBeast",
        avatar: "https://i.pravatar.cc/150?img=2"
    },
    {
        id: 3,
        username: "leomessi",
        name: "Lionel Messi",
        avatar: "https://i.pravatar.cc/150?img=3"
    },
    {
        id: 4,
        username: "taylorswift",
        name: "Taylor Swift",
        avatar: "https://i.pravatar.cc/150?img=4"
    },
    {
        id: 5,
        username: "selenagomez",
        name: "Selena Gomez",
        avatar: "https://i.pravatar.cc/150?img=5"
    }
]

const SuggestedUsers = () => {
    return (
        <aside className="sticky top-8 w-80">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img
                        src="https://i.pravatar.cc/150?img=10"
                        className="h-14 w-14 rounded-full object-cover"
                    />

                    <div>
                        <p className="text-sm font-semibold">dezdev</p>
                        <p className="text-sm text-gray-500">
                            Lê Nguyễn Tất Thắng
                        </p>
                    </div>
                </div>

                <button className="text-xs font-semibold text-blue-500 hover:text-blue-700">
                    Switch
                </button>
            </div>

            <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-500">
                    Suggested for you
                </span>

                <button className="text-xs font-semibold hover:text-gray-500">
                    See All
                </button>
            </div>

            <div className="space-y-4">
                {suggestedUsers.map((user) => (
                    <div
                        key={user.id}
                        className="flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <img
                                src={user.avatar}
                                className="h-11 w-11 rounded-full object-cover"
                            />

                            <div>
                                <p className="text-sm font-semibold">
                                    {user.username}
                                </p>

                                <p className="text-xs text-gray-500">
                                    {user.name}
                                </p>
                            </div>
                        </div>

                        <button className="text-xs font-semibold text-blue-500 hover:text-blue-700">
                            Follow
                        </button>
                    </div>
                ))}
            </div>
        </aside>
    )
}

export default SuggestedUsers