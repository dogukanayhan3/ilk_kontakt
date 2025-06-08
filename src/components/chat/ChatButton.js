import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import '../../component-styles/ChatButton.css';

const API_BASE = 'https://localhost:44388';
const JOB_LISTINGS_ROOT = `${API_BASE}/api/app/job-listing`;
const JOB_APPLICATIONS_ROOT = `${API_BASE}/api/app/job-application`;
const PROFILE_BY_USER = `${API_BASE}/api/app/user-profile/by-user`;
const EXPERIENCE_ROOT = `${API_BASE}/api/app/experience`;
const EDUCATION_ROOT = `${API_BASE}/api/app/education`;
const SKILL_ROOT = `${API_BASE}/api/app/skill`;

const WORK_TYPE_LABELS = {
    0: 'Ofiste',
    1: 'Uzaktan',
    2: 'Hibrit'
};

const EXPERIENCE_LEVEL_LABELS = {
    0: 'Staj',
    1: 'Giriş Seviyesi',
    2: 'Orta Seviye',
    3: 'Üst Seviye',
    4: 'Direktör',
    5: 'Yönetici'
};

function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}

const ChatButton = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [jobListings, setJobListings] = useState([]);
    const [userProfile, setUserProfile] = useState(null);
    const [userExperiences, setUserExperiences] = useState([]);
    const [userEducations, setUserEducations] = useState([]);
    const [userSkills, setUserSkills] = useState([]);
    const [pendingApplication, setPendingApplication] = useState(null);
    const { currentUser } = useAuth();

    // Reset chat history when user changes or logs off
    useEffect(() => {
        setMessages([]);
        setPendingApplication(null);
        setUserProfile(null);
        setUserExperiences([]);
        setUserEducations([]);
        setUserSkills([]);
    }, [currentUser]);

    useEffect(() => {
        if (isOpen && currentUser) {
            fetchJobListings();
            fetchUserProfile();
        }
    }, [isOpen, currentUser]);

    const fetchJobListings = async () => {
        try {
            const response = await fetch(
                `${JOB_LISTINGS_ROOT}?SkipCount=0&MaxResultCount=100`,
                {
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }
            );
            if (!response.ok) throw new Error('İş ilanları yüklenemedi');
            const data = await response.json();
            setJobListings(data.items || []);
        } catch (error) {
            console.error('Error fetching job listings:', error);
        }
    };

    const fetchUserProfile = async () => {
        if (!currentUser) return;
        
        try {
            const res = await fetch(PROFILE_BY_USER, { credentials: 'include' });
            if (res.ok) {
                const profile = await res.json();
                setUserProfile(profile);
                
                // Fetch related data
                await Promise.all([
                    fetchUserExperiences(profile.id),
                    fetchUserEducations(profile.id),
                    fetchUserSkills(profile.id)
                ]);
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };

    const fetchUserExperiences = async (profileId) => {
        try {
            const res = await fetch(
                `${EXPERIENCE_ROOT}?ProfileId=${profileId}`,
                { credentials: 'include' }
            );
            if (res.ok) {
                const data = await res.json();
                setUserExperiences(data.items || []);
            }
        } catch (error) {
            console.error('Error fetching experiences:', error);
        }
    };

    const fetchUserEducations = async (profileId) => {
        try {
            const res = await fetch(
                `${EDUCATION_ROOT}?ProfileId=${profileId}`,
                { credentials: 'include' }
            );
            if (res.ok) {
                const data = await res.json();
                setUserEducations(data.items || []);
            }
        } catch (error) {
            console.error('Error fetching educations:', error);
        }
    };

    const fetchUserSkills = async (profileId) => {
        try {
            const res = await fetch(
                `${SKILL_ROOT}?ProfileId=${profileId}`,
                { credentials: 'include' }
            );
            if (res.ok) {
                const data = await res.json();
                setUserSkills(data.items || []);
            }
        } catch (error) {
            console.error('Error fetching skills:', error);
        }
    };

    const findJobByTitle = (title) => {
        const searchTitle = title.toLowerCase();
        return jobListings.find(job => 
            job.title.toLowerCase().includes(searchTitle) ||
            job.company.toLowerCase().includes(searchTitle) ||
            job.description?.toLowerCase().includes(searchTitle)
        );
    };

    const findJobsByKeywords = (keywords) => {
        const searchTerms = keywords.toLowerCase().split(' ');
        return jobListings.filter(job => 
            searchTerms.some(term => 
                job.title.toLowerCase().includes(term) ||
                job.company.toLowerCase().includes(term) ||
                job.description?.toLowerCase().includes(term) ||
                job.location?.toLowerCase().includes(term)
            )
        );
    };

    const getRecommendedJobs = () => {
        if (!userSkills.length && !userExperiences.length) {
            return jobListings.slice(0, 5);
        }

        const userSkillNames = userSkills.map(skill => skill.skillName.toLowerCase());
        const userCompanies = userExperiences.map(exp => exp.companyName.toLowerCase());
        const userTitles = userExperiences.map(exp => exp.title.toLowerCase());

        const scoredJobs = jobListings.map(job => {
            let score = 0;
            const jobText = `${job.title} ${job.description || ''} ${job.company}`.toLowerCase();

            // Score based on skills
            userSkillNames.forEach(skill => {
                if (jobText.includes(skill)) score += 3;
            });

            // Score based on similar titles
            userTitles.forEach(title => {
                if (jobText.includes(title)) score += 2;
            });

            // Score based on company experience
            userCompanies.forEach(company => {
                if (jobText.includes(company)) score += 1;
            });

            return { ...job, score };
        });

        return scoredJobs
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);
    };

    const formatJobDetails = (job) => {
        return `📋 Pozisyon: ${job.title}
🏢 Şirket: ${job.company}
📍 Konum: ${job.location || 'Belirtilmemiş'}
💼 Çalışma Türü: ${WORK_TYPE_LABELS[job.workType] || 'Belirtilmemiş'}
⭐ Deneyim: ${EXPERIENCE_LEVEL_LABELS[job.experienceLevel] || 'Belirtilmemiş'}${job.description ? `\n📝 Açıklama: ${job.description}` : ''}`;
    };

    const formatJobList = (jobs, title = '') => {
        if (jobs.length === 0) return 'Uygun iş ilanı bulunamadı.';
        
        const jobList = jobs.map((job, index) => 
            `${index + 1}. 📋 ${job.title}\n   🏢 ${job.company}\n   📍 ${job.location || 'Belirtilmemiş'}\n   💼 ${WORK_TYPE_LABELS[job.workType] || 'Belirtilmemiş'}`
        ).join('\n\n');
        
        return `${title ? title + '\n\n' : ''}${jobList}\n\nDetayları görmek için "X numaralı ilanı göster" yazabilirsiniz.`;
    };

    const getUserProfileSummary = () => {
        if (!userProfile) return '';
        
        const skills = userSkills.map(s => s.skillName).join(', ');
        const latestExp = userExperiences.length > 0 ? userExperiences[0] : null;
        const latestEdu = userEducations.length > 0 ? userEducations[0] : null;
        
        return `Kullanıcı Profili:
Ad: ${userProfile.name || ''} ${userProfile.surname || ''}
Hakkında: ${userProfile.about || 'Belirtilmemiş'}
Yetenekler: ${skills || 'Belirtilmemiş'}
Son Deneyim: ${latestExp ? `${latestExp.title} @ ${latestExp.companyName}` : 'Belirtilmemiş'}
Eğitim: ${latestEdu ? `${latestEdu.instutionName}` : 'Belirtilmemiş'}`;
    };

    // FIXED: Enhanced job application function with proper error handling
    const handleApplyToJob = async (jobId) => {
        console.log('🚀 Starting job application process for job ID:', jobId);
        
        if (!currentUser) {
            console.log('❌ No current user found');
            return "❌ Başvuru yapabilmek için giriş yapmalısınız!";
        }

        if (currentUser.isCompanyProfile) {
            console.log('❌ Company profile trying to apply');
            return "❌ Şirket hesapları iş ilanlarına başvuru yapamaz.";
        }

        try {
            console.log('🔄 Step 1: Getting XSRF token...');
            
            // 1) Get XSRF token by hitting the configuration endpoint
            const configResponse = await fetch(`${API_BASE}/api/abp/application-configuration`, {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            if (!configResponse.ok) {
                console.error('❌ Failed to get configuration:', configResponse.status);
                throw new Error('Konfigürasyon alınamadı');
            }
            
            console.log('✅ Configuration response received');
            
            // 2) Extract XSRF token from cookie
            const xsrf = getCookie('XSRF-TOKEN');
            console.log('🔑 XSRF Token:', xsrf ? 'Found' : 'Not found');
            
            if (!xsrf) {
                throw new Error('XSRF token bulunamadı');
            }
            
            console.log('🔄 Step 2: Submitting job application...');
            
            // 3) Create the job application payload
            const applicationPayload = {
                jobListingId: jobId
            };
            
            console.log('📦 Application payload:', applicationPayload);
            
            // 4) Submit the job application
            const response = await fetch(JOB_APPLICATIONS_ROOT, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'RequestVerificationToken': xsrf,
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(applicationPayload)
            });

            console.log('📡 Application response status:', response.status);
            console.log('📡 Application response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                console.error('❌ Application failed with status:', response.status);
                
                let errorMessage = 'Başvuru yapılırken bir hata oluştu.';
                
                try {
                    const errorData = await response.json();
                    console.error('❌ Error response data:', errorData);
                    
                    if (errorData.error?.message) {
                        errorMessage = errorData.error.message;
                    } else if (errorData.error?.details) {
                        errorMessage = errorData.error.details;
                    }
                } catch (parseError) {
                    console.error('❌ Could not parse error response:', parseError);
                    const errorText = await response.text();
                    console.error('❌ Raw error response:', errorText);
                }
                
                throw new Error(errorMessage);
            }

            console.log('✅ Application submitted successfully');
            
            // 5) Parse the successful response
            const responseData = await response.json();
            console.log('✅ Application response data:', responseData);

            return "✅ Başvurunuz başarıyla alındı! İyi şanslar!";
            
        } catch (error) {
            console.error('❌ Application error:', error);
            
            // Provide more specific error messages
            if (error.message.includes('XSRF')) {
                return "❌ Güvenlik token hatası. Lütfen sayfayı yenileyin ve tekrar deneyin.";
            } else if (error.message.includes('Network')) {
                return "❌ Bağlantı hatası. İnternet bağlantınızı kontrol edin.";
            } else if (error.message.includes('already applied')) {
                return "❌ Bu pozisyona daha önce başvuru yaptınız.";
            } else {
                return `❌ Başvuru sırasında bir hata oluştu: ${error.message}`;
            }
        }
    };

    const processMessage = async (userMessage) => {
        const lowerMessage = userMessage.toLowerCase();

        // Handle job application confirmation
        if (pendingApplication) {
            if (lowerMessage.includes('evet') || lowerMessage.includes('onaylıyorum') || lowerMessage.includes('başvur')) {
                console.log('🎯 User confirmed application for job:', pendingApplication.id);
                const result = await handleApplyToJob(pendingApplication.id);
                setPendingApplication(null);
                return result;
            } else if (lowerMessage.includes('hayır') || lowerMessage.includes('iptal')) {
                console.log('❌ User cancelled application');
                setPendingApplication(null);
                return "Başvuru işlemi iptal edildi.";
            }
            return "Lütfen 'evet' veya 'hayır' diyerek başvurunuzu onaylayın veya iptal edin.";
        }

        // Handle numbered job details
        const numberMatch = lowerMessage.match(/(\d+)\s*numaralı\s*ilanı?\s*göster/);
        if (numberMatch) {
            const jobIndex = parseInt(numberMatch[1]) - 1;
            if (jobIndex >= 0 && jobIndex < jobListings.length) {
                const job = jobListings[jobIndex];
                return `${formatJobDetails(job)}\n\nBu pozisyona başvurmak için "${job.title} pozisyonuna başvur" yazabilirsiniz.`;
            }
            return "❌ Geçersiz ilan numarası.";
        }

        // Handle job listing requests
        if (lowerMessage.includes('listele') || lowerMessage.includes('ilanları göster') || lowerMessage.includes('tüm ilanlar')) {
            return formatJobList(jobListings, 'Mevcut İş İlanları:');
        }

        // Handle job search
        if (lowerMessage.includes('ara') || lowerMessage.includes('bul')) {
            const searchTerms = userMessage.replace(/(ara|bul)/gi, '').trim();
            if (searchTerms) {
                const foundJobs = findJobsByKeywords(searchTerms);
                return formatJobList(foundJobs, `"${searchTerms}" için bulunan ilanlar:`);
            }
            return "Arama yapmak için 'frontend ara' veya 'istanbul bul' gibi bir komut yazın.";
        }

        // Handle job applications - ENHANCED
        if (lowerMessage.includes('başvur')) {
            console.log('🎯 User wants to apply to a job');
            
            const jobTitle = userMessage.replace(/başvur/i, '').replace(/pozisyonuna|için/gi, '').trim();
            console.log('🔍 Looking for job with title:', jobTitle);
            
            const job = findJobByTitle(jobTitle);
            console.log('🎯 Found job:', job ? job.title : 'Not found');

            if (!job) {
                const suggestions = findJobsByKeywords(jobTitle).slice(0, 3);
                if (suggestions.length > 0) {
                    return `❌ "${jobTitle}" pozisyonu bulunamadı. Benzer ilanlar:\n\n${formatJobList(suggestions)}\n\nBunlardan birine başvurmak için tam pozisyon adını yazın.`;
                }
                return `❌ "${jobTitle}" pozisyonuna ait bir ilan bulamadım. "listele" yazarak tüm ilanları görebilirsiniz.`;
            }

            if (job.externalUrl) {
                return `Bu pozisyon için harici başvuru gerekiyor:\n\n${formatJobDetails(job)}\n\n🔗 Başvuru linki: ${job.externalUrl}`;
            }

            console.log('✅ Setting pending application for job:', job.id);
            setPendingApplication(job);
            return `Aşağıdaki pozisyona başvurmak istediğinizi onaylıyor musunuz?\n\n${formatJobDetails(job)}\n\nOnaylamak için 'evet', iptal etmek için 'hayır' yazın.`;
        }

        // Handle job recommendations
        if (lowerMessage.includes('öner') || lowerMessage.includes('benzer') || lowerMessage.includes('uygun')) {
            const recommendedJobs = getRecommendedJobs();
            return formatJobList(recommendedJobs, 'Size önerilen iş ilanları:');
        }

        // Handle profile-related queries
        if (lowerMessage.includes('profil') || lowerMessage.includes('hakkımda') || lowerMessage.includes('bilgilerim')) {
            if (!userProfile) {
                return "Profilinizi görüntüleyebilmek için önce profil sayfanızı oluşturmanız gerekiyor.";
            }
            return getUserProfileSummary();
        }

        // For other queries, use Gemini API with enhanced context
        try {
            const recentMessages = messages.slice(-5);
            const chatHistoryContext = recentMessages
                .map(msg => `${msg.sender === 'user' ? 'Kullanıcı' : 'Asistan'}: ${msg.text}`)
                .join('\n');

            const userContext = getUserProfileSummary();
            const jobContext = jobListings.slice(0, 10).map(job => 
                `${job.title} - ${job.company} (${job.location}) - ${WORK_TYPE_LABELS[job.workType]}`
            ).join('\n');

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyCgxFgzQQxZ4k1hMv8Qw0PYw7l6g-_zWKY`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `Sen bir kariyer web sitesinin uzman asistanısın. Kullanıcılara iş bulma, başvuru yapma ve kariyer tavsiyesi konularında yardım ediyorsun.

KULLANICI BİLGİLERİ:
${userContext}

MEVCUT İŞ İLANLARI:
${jobContext}

ÖNCEKİ KONUŞMA:
${chatHistoryContext}

KULLANICI SORUSU: ${userMessage}

KURALLAR:
- Kısa ve öz cevaplar ver (maksimum 3-4 cümle)
- Türkçe cevap ver
- Emoji kullanma
- Kullanıcının profiline uygun öneriler yap
- İş ilanları hakkında sorularda spesifik bilgi ver
- Başvuru yapmak için "X pozisyonuna başvur" formatını öner
- Profesyonel ve yardımsever ol

CEVAP:`
                        }]
                    }]
                })
            });

            const data = await response.json();
            if (data.candidates && data.candidates[0].content) {
                return data.candidates[0].content.parts[0].text;
            }
            return "Üzgünüm, şu anda size yardımcı olamıyorum. Lütfen tekrar deneyin.";
        } catch (error) {
            console.error('Error sending message to Gemini:', error);
            return "Bir hata oluştu. 'listele' yazarak iş ilanlarını görebilir, 'öner' yazarak size uygun pozisyonları bulabilirsiniz.";
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        const userMessage = {
            text: message,
            sender: 'user',
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMessage]);
        const currentMessage = message;
        setMessage('');
        setIsLoading(true);

        try {
            const reply = await processMessage(currentMessage);
            const botMessage = {
                text: reply,
                sender: 'bot',
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Error processing message:', error);
            const errorMessage = {
                text: "❌ Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.",
                sender: 'bot',
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const getWelcomeMessage = () => {
        if (!currentUser) {
            return "Merhaba! Size nasıl yardımcı olabilirim? İş ilanlarını görmek için 'listele' yazabilirsiniz.";
        }

        if (currentUser.isCompanyProfile) {
            return `Merhaba ${currentUser.userName}! Şirket hesabınızla iş ilanlarını görüntüleyebilir ve yönetebilirsiniz. 'listele' yazarak başlayabilirsiniz.`;
        }

        return `Merhaba ${currentUser.userName}! Size nasıl yardımcı olabilirim? 

Yapabilecekleriniz:
• 'listele' - Tüm iş ilanlarını görün
• 'öner' - Size uygun pozisyonları bulun  
• 'frontend ara' - Belirli pozisyonları arayın
• 'X pozisyonuna başvur' - Başvuru yapın
• 'profilim' - Profil bilgilerinizi görün`;
    };

    return (
        <div className="chat-container">
            {isOpen && (
                <div className="chat-window">
                    <div className="chat-header">
                        <h3>Kariyer Asistanı</h3>
                        <button className="close-button" onClick={toggleChat}>
                            <X size={20} />
                        </button>
                    </div>
                    <div className="chat-messages">
                        {messages.length === 0 && (
                            <div className="message bot-message">
                                <div className="message-text">
                                    {getWelcomeMessage()}
                                </div>
                            </div>
                        )}
                        {messages.map((msg, index) => (
                            <div 
                                key={index} 
                                className={`message ${msg.sender === 'bot' ? 'bot-message' : 'user-message'}`}
                            >
                                <div className="message-text">
                                    {msg.text.split('\n').map((line, i) => (
                                        <div key={i}>{line}</div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="message bot-message loading">
                                <div className="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        )}
                    </div>
                    <form className="chat-input-container" onSubmit={handleSendMessage}>
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Mesajınızı yazın..."
                            className="chat-input"
                            disabled={isLoading}
                        />
                        <button 
                            type="submit" 
                            className="send-button"
                            disabled={isLoading || !message.trim()}
                        >
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            )}
            <button 
                className={`chat-button ${isOpen ? 'active' : ''}`}
                onClick={toggleChat}
            >
                <MessageCircle size={24} />
            </button>
        </div>
    );
};

export default ChatButton;