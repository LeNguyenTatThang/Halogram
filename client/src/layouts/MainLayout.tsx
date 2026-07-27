import { Outlet } from 'react-router-dom'
import Navigation from './Navigation'

const MainLayout = () => {
    return (
        <>
            <Navigation />

            <div className="md:ml-16 xl:mr-64">
                <Outlet />
            </div>
        </>
    )
}

export default MainLayout