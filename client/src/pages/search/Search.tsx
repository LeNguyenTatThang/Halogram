import { useCallback, useEffect, useRef, useState } from 'react'
import { searchUsers } from '../../utils/search'
import SearchBar from './components/SearchBar'
import SearchSkeletonList from './components/SearchSkeletonList'
import SearchUserItem from './components/SearchUserItem'
import type { SearchUser } from '../../types/Search'

const Search = () => {
    const [keyword, setKeyword] = useState('')
    const [users, setUsers] = useState<SearchUser[]>([])
    const [loading, setLoading] = useState(false)
    const [loadingMore, setLoadingMore] = useState(false)
    const [nextCursor, setNextCursor] = useState<string | null>(null)
    const [hasMore, setHasMore] = useState(false)

    const resultsContainerRef = useRef<HTMLDivElement>(null)

    const loadUsers = useCallback(
        async (
            keyword: string,
            cursor: string | null = null,
            append = false
        ) => {
            try {
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                append ? setLoadingMore(true) : setLoading(true)

                const res = await searchUsers(keyword, cursor)

                const newUsers: SearchUser[] = res.data.users

                if (append) {
                    setUsers((prev) => [...prev, ...newUsers])
                } else {
                    setUsers(newUsers)
                }

                setNextCursor(res.data.nextCursor)
                setHasMore(!!res.data.nextCursor)
            } catch (err) {
                console.error(err)
            } finally {
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                append ? setLoadingMore(false) : setLoading(false)
            }
        },
        []
    )

    // Search với debounce
    useEffect(() => {
        const q = keyword.trim()

        if (!q) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setUsers([])
            setNextCursor(null)
            setHasMore(false)
            return
        }

        const timer = setTimeout(() => {
            loadUsers(q)
        }, 300)

        return () => clearTimeout(timer)
    }, [keyword, loadUsers])

    const handleScroll = useCallback(() => {
        const node = resultsContainerRef.current

        if (!node || !hasMore || loading || loadingMore || !nextCursor) {
            return
        }

        const distanceToBottom =
            node.scrollHeight - (node.scrollTop + node.clientHeight)

        if (distanceToBottom <= 120) {
            loadUsers(keyword.trim(), nextCursor, true)
        }
    }, [hasMore, keyword, loading, loadingMore, nextCursor, loadUsers])

    useEffect(() => {
        if (!keyword.trim()) return

        resultsContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    }, [keyword])

    return (
        <div className="w-full flex flex-col">
            <SearchBar keyword={keyword} onChange={setKeyword} />

            {loading && <SearchSkeletonList />}

            {!loading && keyword && users.length === 0 && (
                <p className="text-center text-gray-500">No users found.</p>
            )}

            <div
                ref={resultsContainerRef}
                onScroll={handleScroll}
                className="flex max-h-[80vh] flex-col gap-2 overflow-y-auto pr-1 sm:max-h-[85vh]"
            >
                {users.map((user) => (
                    <SearchUserItem key={user.id} user={user} />
                ))}
            </div>

            {loadingMore && (
                <div className="py-3 text-center text-sm text-gray-500">
                    Loading more...
                </div>
            )}
        </div>
    )
}

export default Search