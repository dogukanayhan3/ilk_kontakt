import Layout from "./Layout";
import Post from "./Post";
import data from "../data.json";
import "../component-styles/HomePage.css"

function HomePage() {
    return(
        <Layout>
            <section className="welcome">
                <h1>Hoş Geldiniz</h1>
                <p>Hayallerinize giden yolda ilk kontakt noktanız!</p>
            </section>
            <section className="feed">
                <div className="feed-left">
                    <div className="profile-card">
                        <img src="https://via.placeholder.com/150" alt="Profile"/>
                        <h3>Doğukan Ayhan</h3>
                        <p>Yazılım Mühendisi</p>
                        <button>Profil</button>
                    </div>
                </div>
                <div className="feed-main">
                    {data.map((post, index) => (
                        <Post key={index}
                            post_owner={post.post_owner} 
                            post_content={post.post_content} 
                            post_likes={post.post_likes} 
                            post_comments={post.post_comments}
                        />
                    ))}
                </div>
                <div className="feed-right">
                    <div className="profile-card">
                        <h3>Bağlantı Önerileri</h3>
                        <p>Yeni profesyonellerle tanışarak ağınızı genişletin!</p>
                        <button>Bağlantılar</button>
                    </div>
                    <div className="profile-card">
                        <h3>Açık Pozisyonlar</h3>
                        <p>İlgilendiğiniz alanda açık olan pozisyonları görüntüleyin!</p>
                        <button>Pozisyonlar</button>
                    </div>
                </div>
            </section>
        </Layout>
    );
}

export default HomePage;