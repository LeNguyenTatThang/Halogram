import { Outlet } from 'react-router-dom'
import Navigation from './Navigation'
import Online from './Online'

const MainLayout = () => {
    return (
        <>
            <Navigation locale="en" />
            <Online />

            <div className="mx-auto">
                <Outlet />
            </div>
        </>
    )
}

export default MainLayout