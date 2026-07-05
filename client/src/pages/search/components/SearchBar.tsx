import { Search as SearchIcon } from 'lucide-react'

interface SearchBarProps {
    keyword: string
    onChange: (value: string) => void
}

const SearchBar = ({ keyword, onChange }: SearchBarProps) => {
    return (
        <div className="relative mb-4">
            <SearchIcon
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
                value={keyword}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Search users..."
                className="w-full rounded-lg border px-10 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
    )
}

export default SearchBar
