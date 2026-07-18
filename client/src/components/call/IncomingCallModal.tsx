import { Phone, PhoneOff, Video } from 'lucide-react'
import { useCall } from '../../context/useCall'

const IncomingCallModal = () => {
    const {
        incomingCall,
        acceptCall,
        rejectCall,
    } = useCall()

    if (!incomingCall) return null

    const handleAccept = () => {
        acceptCall(incomingCall)
    }

    const handleReject = () => {
        rejectCall(incomingCall)
    }

    return (
        <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center">

            <div className="w-[360px] rounded-2xl bg-neutral-900 p-8 text-white shadow-2xl">

                <div className="flex flex-col items-center">

                    <div className="w-24 h-24 rounded-full bg-neutral-700 flex items-center justify-center mb-5">
                        <Video size={40} />
                    </div>

                    <h2 className="text-2xl font-semibold">
                        Incoming {incomingCall.type.toLowerCase()} call
                    </h2>

                    <p className="text-neutral-400 mt-2">
                        User is calling you...
                    </p>

                    <div className="mt-8 flex gap-8">

                        <button
                            onClick={handleReject}
                            className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition"
                        >
                            <PhoneOff />
                        </button>

                        <button
                            onClick={handleAccept}
                            className="w-16 h-16 rounded-full bg-green-600 hover:bg-green-700 flex items-center justify-center transition"
                        >
                            <Phone />
                        </button>

                    </div>

                </div>

            </div>

        </div>
    )
}

export default IncomingCallModal