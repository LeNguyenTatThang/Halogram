import { Outlet } from 'react-router-dom'
import Navigation from './Navigation'
import Online from './Online'

const MainLayout = () => {
    return (
        <>
            <Navigation />
            <Online />

            <div className="md:ml-16">
                <Outlet />
            </div>
        </>
    )
}

export default MainLayout