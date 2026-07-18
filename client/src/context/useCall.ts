import { useContext } from 'react'
import { CallContext } from './CallContext' 

export function useCall() {
    const context = useContext(CallContext)

    if (!context) {
        throw new Error('useCall must be used within a CallProvider')
    }

    return context
}