import NavigationBar from './NavigationBar';
import Footer from "./Footer";
import ChatButton from '../chat/ChatButton';

function Layout({ children }) {
    return (
        <>
            <NavigationBar />
            <main>
                {children}
            </main>
            <Footer />
            <ChatButton />
        </>
    );
}

export default Layout;