const SearchSkeletonList = ({ count = 5 }: { count?: number }) => {
    return (
        <div className="flex flex-col gap-2">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="flex items-center gap-3 animate-pulse py-2"
                >
                    <div className="h-10 w-10 rounded-full bg-gray-200" />

                    <div className="flex-1 space-y-2">
                        <div className="h-4 w-40 rounded bg-gray-200" />
                        <div className="h-3 w-24 rounded bg-gray-200" />
                    </div>
                </div>
            ))}
        </div>
    )
}

export default SearchSkeletonList
