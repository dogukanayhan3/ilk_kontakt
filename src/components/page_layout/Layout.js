import NavigationBar from './NavigationBar';
import Footer from "./Footer";

function Layout({ children }) {
    return (
        <>
            <NavigationBar />
            <main>
                {children}
            </main>
            <Footer />
        </>
    );
}

export default Layout;