import { Outlet } from 'react-router-dom'
import Navigation from './Navigation'
import Online from './Online'

const MainLayout = () => {
    return (
        <>
            <Navigation locale="en" />
            <Online />

            <div className="ml-64">
                <Outlet />
            </div>
        </>
    )
}

export default MainLayout