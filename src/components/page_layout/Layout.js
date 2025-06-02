import NavigationBar from './NavigationBar';
import Footer from "./Footer";
import ChatButton from '../chat/ChatButton';
import DMButton from '../dm/DMButton';

function Layout({ children }) {
    return (
        <>
            <NavigationBar />
            <main>
                {children}
            </main>
            <Footer />
            <DMButton />
            <ChatButton />
        </>
    );
}

export default Layout;