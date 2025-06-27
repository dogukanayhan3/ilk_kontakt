import React, { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  X,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import "../../component-styles/ChatButton.css";

const API_BASE = process.env.REACT_APP_API_BASE || "https://localhost:44388";
const JOB_LISTINGS_ROOT = `${API_BASE}/api/app/job-listing`;
const JOB_APPLICATIONS_ROOT = `${API_BASE}/api/app/job-application`;
const PROFILE_BY_USER = `${API_BASE}/api/app/user-profile/by-user`;
const EXPERIENCE_ROOT = `${API_BASE}/api/app/experience`;
const EDUCATION_ROOT = `${API_BASE}/api/app/education`;
const SKILL_ROOT = `${API_BASE}/api/app/skill`;
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

const WORK_TYPE_LABELS = {
  0: "Ofiste",
  1: "Uzaktan",
  2: "Hibrit",
};


const EXPERIENCE_LEVEL_LABELS = {
  0: "Staj",
  1: "Giriş Seviyesi",
  2: "Orta Seviye",
  3: "Üst Seviye",
  4: "Direktör",
  5: "Yönetici",
};

// Utility Functions
function getCookie(name) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

// Türkçe karakter normalizasyonu
const normalizeText = (text) => {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
};

// Enhanced intent detection with better platform query handling
const detectIntent = (message) => {
  const lowerMessage = message.toLowerCase();
  const normalizedMessage = normalizeText(message);

  // Platform/site related queries - HIGHEST PRIORITY
  const platformIntents = [
    /site.*ne.*yarar/i,
    /platform.*ne.*yarar/i,
    /ilk.*kontakt.*ne/i,
    /sitenin.*amacı/i,
    /ne.*işe.*yarar/i,
    /nasıl.*çalışır/i,
    /hakkında/i,
    /özellikler/i,
    /nedir/i,
    /amacı.*nedir/i,
    /bu.*site/i,
    /bu.*platform/i,
    /site.*hakkında/i,
    /site.*amacı/i,
    /platform.*hakkında/i,
    /ne.*amaçla/i,
  ];

  // Job listing requests - SPECIFIC PATTERNS
  const listingIntents = [
    /^listele$/i,
    /tüm.*ilanlar/i,
    /mevcut.*ilanlar/i,
    /açık.*pozisyonlar/i,
    /ilanları.*göster/i,
    /pozisyonları.*listele/i,
    /hangi.*işler.*var/i,
    /iş.*ilanları.*nerede/i,
    /nerede.*görüntüle/i,
    /bana.*açık.*olan.*pozisyonları/i,
    /diğer.*ilanlar/i,
    /başka.*ilanlar/i,
    /tüm.*pozisyonlar/i,
  ];

  // Job application intents - MORE FLEXIBLE
  const applicationIntents = [
    /başvur/i,
    /basvur/i,
    /apply/i,
    /başvurmak\s+istiyorum/i,
    /başvuru\s+yap/i,
    /bu\s+işe\s+başvur/i,
    /pozisyonuna\s+başvur/i,
    /ilanına\s+başvur/i,
    /başvurmak\s+isterim/i,
    /başvurmak\s+istiyorum/i,
    /bu\s+pozisyona\s+başvur/i,
    /işe\s+başvur/i,
  ];

  // Job search intents - REFINED
  const searchIntents = [
    /ara(?!k)/i,
    /bul/i,
    /göster/i, // "arak" kelimesini hariç tut
    /hangi\s+işler/i,
    /iş\s+ara/i,
    /pozisyon\s+ara/i,
    /iş\s+fırsatları/i,
    /kariyer\s+fırsatları/i,
    /stajyer.*ilanları/i,
    /intern.*positions/i,
  ];

  // Recommendation intents
  const recommendIntents = [
    /öner/i,
    /tavsiye/i,
    /uygun/i,
    /bana\s+göre/i,
    /benzer/i,
    /profilime\s+uygun/i,
    /özel\s+öneriler/i,
    /size\s+uygun/i,
    /kişiselleştirilmiş/i,
    /deneyimime\s+uygun/i,
  ];

  // Profile intents
  const profileIntents = [
    /^profilim$/i,
    /hakkımda/i,
    /bilgilerim/i,
    /özgeçmiş/i,
    /cv/i,
    /deneyimlerim/i,
    /becerilerim/i,
    /eğitimim/i,
    /yeteneklerim/i,
  ];

  // Check in priority order
  if (
    platformIntents.some(
      (pattern) => pattern.test(lowerMessage) || pattern.test(normalizedMessage)
    )
  ) {
    return "platform";
  }
  if (
    listingIntents.some(
      (pattern) => pattern.test(lowerMessage) || pattern.test(normalizedMessage)
    )
  ) {
    return "listing";
  }
  if (
    applicationIntents.some(
      (pattern) => pattern.test(lowerMessage) || pattern.test(normalizedMessage)
    )
  ) {
    return "apply";
  }
  if (
    searchIntents.some(
      (pattern) => pattern.test(lowerMessage) || pattern.test(normalizedMessage)
    )
  ) {
    return "search";
  }
  if (
    recommendIntents.some(
      (pattern) => pattern.test(lowerMessage) || pattern.test(normalizedMessage)
    )
  ) {
    return "recommend";
  }
  if (
    profileIntents.some(
      (pattern) => pattern.test(lowerMessage) || pattern.test(normalizedMessage)
    )
  ) {
    return "profile";
  }

  return "general";
};

// Enhanced job extraction with better fuzzy matching
const extractJobFromMessage = (message, jobListings) => {
  const cleanMessage = message
    .replace(
      /(başvur|başvurmak|başvuru|apply|için|pozisyonuna|işine|pozisyon|iş|çalışmak|ilanına)/gi,
      ""
    )
    .replace(/\s+/g, " ")
    .trim();

  if (!cleanMessage) return null;

  // Try exact title match first
  let job = jobListings.find(
    (j) => j.title.toLowerCase() === cleanMessage.toLowerCase()
  );

  if (!job) {
    // Try partial title match with higher threshold
    job = jobListings.find((j) => {
      const titleWords = j.title.toLowerCase().split(" ");
      const searchWords = cleanMessage.toLowerCase().split(" ");

      // At least 70% of search words should match
      const matchCount = searchWords.filter((word) =>
        titleWords.some(
          (titleWord) => titleWord.includes(word) || word.includes(titleWord)
        )
      ).length;

      return matchCount >= Math.ceil(searchWords.length * 0.7);
    });
  }

  if (!job) {
    // Try company name match
    job = jobListings.find(
      (j) =>
        j.company.toLowerCase().includes(cleanMessage.toLowerCase()) ||
        cleanMessage.toLowerCase().includes(j.company.toLowerCase())
    );
  }

  return job;
};

// Enhanced search function with better filtering
const searchJobs = (searchTerms, jobListings) => {
  if (!searchTerms.trim()) return [];

  const terms = searchTerms
    .toLowerCase()
    .split(" ")
    .filter((term) => term.length > 1);

  return jobListings.filter((job) => {
    const jobText = `${job.title} ${job.company} ${job.description || ""} ${
      job.location || ""
    }`.toLowerCase();

    // Exact phrase match gets highest priority
    if (jobText.includes(searchTerms.toLowerCase())) {
      return true;
    }

    // Multiple term match
    const matchCount = terms.filter((term) => jobText.includes(term)).length;
    return matchCount >= Math.ceil(terms.length / 2); // At least half of the terms should match
  });
};

const ChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [jobListings, setJobListings] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [userExperiences, setUserExperiences] = useState([]);
  const [userEducations, setUserEducations] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [pendingApplication, setPendingApplication] = useState(null);
  const { currentUser } = useAuth();
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechSynthesisRef = useRef(null);
  const speechUtteranceRef = useRef(null);

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

  // Initialize speech synthesis
  useEffect(() => {
    if ("speechSynthesis" in window) {
      speechSynthesisRef.current = window.speechSynthesis;
    }
  }, []);

  // Speech Recognition Setup
  useEffect(() => {
    if (
      !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      recognitionRef.current = null;
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "tr-TR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event) => {
      setIsListening(false);
      if (event.error !== "no-speech") {
        console.error("Speech recognition error:", event.error);
      }
    };

    recognition.onresult = (event) => {
      setIsListening(false);
      const transcript = event.results[0][0].transcript.trim();
      if (transcript) {
        handleSpeechResult(transcript);
      }
    };

    recognitionRef.current = recognition;
  }, []);

  // API Functions
  const fetchJobListings = async () => {
    try {
      const response = await fetch(
        `${JOB_LISTINGS_ROOT}?SkipCount=0&MaxResultCount=100`,
        {
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("İş ilanları yüklenemedi");
      const data = await response.json();
      setJobListings(data.items || []);
    } catch (error) {
      console.error("Error fetching job listings:", error);
    }
  };

  const fetchUserProfile = async () => {
    if (!currentUser) return;

    try {
      const res = await fetch(PROFILE_BY_USER, { credentials: "include" });
      if (res.ok) {
        const profile = await res.json();
        setUserProfile(profile);

        await Promise.all([
          fetchUserExperiences(profile.id),
          fetchUserEducations(profile.id),
          fetchUserSkills(profile.id),
        ]);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const fetchUserExperiences = async (profileId) => {
    try {
      const res = await fetch(`${EXPERIENCE_ROOT}?ProfileId=${profileId}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setUserExperiences(data.items || []);
      }
    } catch (error) {
      console.error("Error fetching experiences:", error);
    }
  };

  const fetchUserEducations = async (profileId) => {
    try {
      const res = await fetch(`${EDUCATION_ROOT}?ProfileId=${profileId}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setUserEducations(data.items || []);
      }
    } catch (error) {
      console.error("Error fetching educations:", error);
    }
  };

  const fetchUserSkills = async (profileId) => {
    try {
      const res = await fetch(`${SKILL_ROOT}?ProfileId=${profileId}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setUserSkills(data.items || []);
      }
    } catch (error) {
      console.error("Error fetching skills:", error);
    }
  };

  // Enhanced recommendation algorithm
  const getAdvancedRecommendations = () => {
    console.log("🔍 Starting advanced job recommendations...");

    if (
      !userSkills.length &&
      !userExperiences.length &&
      !userEducations.length
    ) {
      console.log("⚠️ No user data found, returning first 5 jobs");
      return jobListings.slice(0, 5);
    }

    const userSkillNames = userSkills.map((skill) =>
      skill.skillName.toLowerCase()
    );
    const userExperienceTitles = userExperiences.map((exp) =>
      exp.title.toLowerCase()
    );
    const userEducationFields = userEducations.map((edu) =>
      (edu.fieldOfStudy || edu.instutionName || "").toLowerCase()
    );
    const userCompanies = userExperiences.map((exp) =>
      exp.companyName.toLowerCase()
    );

    console.log("🎯 User Skills:", userSkillNames);
    console.log("💼 User Experience Titles:", userExperienceTitles);
    console.log("🎓 User Education Fields:", userEducationFields);

    const scoredJobs = jobListings.map((job) => {
      let score = 0;
      const jobText = `${job.title} ${job.description || ""} ${
        job.company
      }`.toLowerCase();

      // Skill matching (highest weight - 5 points each)
      userSkillNames.forEach((skill) => {
        if (jobText.includes(skill)) {
          score += 5;
          console.log(`✅ Exact skill match: "${skill}" in job "${job.title}"`);
        } else {
          // Partial skill matching (2 points each word)
          const skillWords = skill.split(" ").filter((word) => word.length > 3);
          skillWords.forEach((word) => {
            if (jobText.includes(word)) {
              score += 2;
              console.log(
                `✅ Partial skill match: "${word}" in job "${job.title}"`
              );
            }
          });
        }
      });

      // Experience title matching (4 points exact, 1.5 partial)
      userExperienceTitles.forEach((title) => {
        if (jobText.includes(title)) {
          score += 4;
          console.log(`✅ Exact title match: "${title}" in job "${job.title}"`);
        } else {
          const titleWords = title.split(" ").filter((word) => word.length > 3);
          titleWords.forEach((word) => {
            if (jobText.includes(word)) {
              score += 1.5;
              console.log(
                `✅ Partial title match: "${word}" in job "${job.title}"`
              );
            }
          });
        }
      });

      // Education field matching (3 points)
      userEducationFields.forEach((field) => {
        if (field && jobText.includes(field)) {
          score += 3;
          console.log(`✅ Education match: "${field}" in job "${job.title}"`);
        }
      });

      // Company experience bonus (1 point)
      userCompanies.forEach((company) => {
        if (jobText.includes(company)) {
          score += 1;
          console.log(
            `✅ Company experience match: "${company}" in job "${job.title}"`
          );
        }
      });

      // Experience level matching (2 points)
      if (userExperiences.length > 0) {
        const userExpYears = userExperiences.length; // Simplified calculation
        if (userExpYears <= 2 && job.experienceLevel <= 1) {
          score += 2;
          console.log(
            `✅ Experience level match for entry level in job "${job.title}"`
          );
        } else if (userExpYears <= 5 && job.experienceLevel <= 2) {
          score += 2;
          console.log(
            `✅ Experience level match for mid level in job "${job.title}"`
          );
        } else if (userExpYears > 5 && job.experienceLevel >= 3) {
          score += 2;
          console.log(
            `✅ Experience level match for senior level in job "${job.title}"`
          );
        }
      }

      console.log(`📊 Job "${job.title}" final score: ${score}`);
      return { ...job, score };
    });

    const recommendedJobs = scoredJobs
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    console.log(
      "🎯 Final Recommended Jobs:",
      recommendedJobs.map((job) => ({
        title: job.title,
        score: job.score,
      }))
    );

    return recommendedJobs;
  };

  // Formatting functions
  const formatJobDetails = (job) => {
    return `📋 Pozisyon: ${job.title}
🏢 Şirket: ${job.company}
📍 Konum: ${job.location || "Belirtilmemiş"}
💼 Çalışma Türü: ${WORK_TYPE_LABELS[job.workType] || "Belirtilmemiş"}
⭐ Deneyim: ${EXPERIENCE_LEVEL_LABELS[job.experienceLevel] || "Belirtilmemiş"}${
      job.description ? `\n📝 Açıklama: ${job.description}` : ""
    }`;
  };

  const getMatchReasons = (job, userProfile, userSkills, userExperiences) => {
    const reasons = [];
    
    // Check skill matches
    if (userSkills.length > 0) {
      const matchingSkills = userSkills.filter(skill => 
        job.description?.toLowerCase().includes(skill.skillName.toLowerCase())
      );
      if (matchingSkills.length > 0) {
        reasons.push(`Yeteneklerinizle uyumlu: ${matchingSkills.slice(0, 2).map(s => s.skillName).join(', ')}`);
      }
    }

    // Check experience matches
    if (userExperiences.length > 0) {
      const relevantExp = userExperiences.find(exp => 
        job.title.toLowerCase().includes(exp.title.toLowerCase()) ||
        job.description?.toLowerCase().includes(exp.title.toLowerCase())
      );
      if (relevantExp) {
        reasons.push(`Deneyiminizle uyumlu: ${relevantExp.title}`);
      }
    }

    // Check work type preference
    if (userProfile?.preferredWorkType === job.workType) {
      reasons.push(`Tercih ettiğiniz çalışma modeli: ${WORK_TYPE_LABELS[job.workType]}`);
    }

    // Check experience level
    if (userExperiences.length > 0) {
      const userExpLevel = Math.min(Math.floor(userExperiences.length / 2), 4);
      if (userExpLevel === job.experienceLevel) {
        reasons.push(`Deneyim seviyenize uygun: ${EXPERIENCE_LEVEL_LABELS[job.experienceLevel]}`);
      }
    }

    return reasons.slice(0, 2); // Return top 2 reasons
  };

  const formatJobList = (jobs, title = "") => {
    if (jobs.length === 0) return "Uygun iş ilanı bulunamadı.";

    const jobList = jobs
      .map(
        (job, index) => {
          const matchRate = job.score ? Math.min(Math.round(job.score * 10), 100) : null;
          const matchReasons = job.score ? getMatchReasons(job, userProfile, userSkills, userExperiences) : [];
          
          return `${index + 1}. 📋 ${job.title}\n   🏢 ${job.company}\n   📍 ${
            job.location || "Belirtilmemiş"
          }\n   💼 ${WORK_TYPE_LABELS[job.workType] || "Belirtilmemiş"}${
            matchRate ? `\n   🎯 Uygunluk: ${matchRate}%` : ""
          }${
            matchReasons.length > 0 ? `\n  🤔 Neden Uygun: \n ✨${matchReasons.join("\n✨")}` : ""
          }`;
        }
      )
      .join("\n\n");

    return `${
      title ? title + "\n\n" : ""
    }${jobList}\n\nDetayları görmek için "X numaralı ilanı göster" yazabilirsiniz.`;
  };

  const getUserProfileSummary = () => {
    if (!userProfile) return "Profil bilgileriniz henüz yüklenmemiş.";

    const skills = userSkills.map((s) => s.skillName).join(", ");
    const latestExp = userExperiences.length > 0 ? userExperiences[0] : null;
    const latestEdu = userEducations.length > 0 ? userEducations[0] : null;

    return `👤 Profil Bilgileriniz:

📝 Ad: ${userProfile.name || ""} ${userProfile.surname || ""}
💭 Hakkında: ${userProfile.about || "Belirtilmemiş"}
🎯 Yetenekler: ${skills || "Belirtilmemiş"}
💼 Son Deneyim: ${
      latestExp
        ? `${latestExp.title} @ ${latestExp.companyName}`
        : "Belirtilmemiş"
    }
🎓 Eğitim: ${latestEdu ? `${latestEdu.instutionName}` : "Belirtilmemiş"}
📊 Toplam Deneyim: ${userExperiences.length} pozisyon
🏫 Eğitim Sayısı: ${userEducations.length} kurum
⚡ Yetenek Sayısı: ${userSkills.length} beceri`;
  };

  // Enhanced job application function
  const handleApplyToJob = async (jobId) => {
    console.log("🚀 Starting job application process for job ID:", jobId);

    if (!currentUser) {
      console.log("❌ No current user found");
      return "❌ Başvuru yapabilmek için giriş yapmalısınız!";
    }

    if (currentUser.isCompanyProfile) {
      console.log("❌ Company profile trying to apply");
      return "❌ Şirket hesapları iş ilanlarına başvuru yapamaz.";
    }

    try {
      console.log("🔄 Step 1: Getting XSRF token...");

      const configResponse = await fetch(
        `${API_BASE}/api/abp/application-configuration`,
        {
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      if (!configResponse.ok) {
        console.error("❌ Failed to get configuration:", configResponse.status);
        throw new Error("Konfigürasyon alınamadı");
      }

      const xsrf = getCookie("XSRF-TOKEN");
      console.log("🔑 XSRF Token:", xsrf ? "Found" : "Not found");

      if (!xsrf) {
        throw new Error("XSRF token bulunamadı");
      }

      console.log("🔄 Step 2: Submitting job application...");

      const applicationPayload = { jobListingId: jobId };

      const response = await fetch(JOB_APPLICATIONS_ROOT, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          RequestVerificationToken: xsrf,
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify(applicationPayload),
      });

      console.log("📡 Application response status:", response.status);

      if (!response.ok) {
        console.error("❌ Application failed with status:", response.status);

        let errorMessage = "Başvuru yapılırken bir hata oluştu.";

        try {
          const errorData = await response.json();
          console.error("❌ Error response data:", errorData);

          if (errorData.error?.message) {
            errorMessage = errorData.error.message;
          } else if (errorData.error?.details) {
            errorMessage = errorData.error.details;
          }
        } catch (parseError) {
          console.error("❌ Could not parse error response:", parseError);
        }

        throw new Error(errorMessage);
      }

      console.log("✅ Application submitted successfully");
      const responseData = await response.json();
      console.log("✅ Application response data:", responseData);

      return "✅ Başvurunuz başarıyla alındı! İyi şanslar! Başvuru durumunuzu profil sayfanızdan takip edebilirsiniz.";
    } catch (error) {
      console.error("❌ Application error:", error);

      if (error.message.includes("XSRF")) {
        return "❌ Güvenlik token hatası. Lütfen sayfayı yenileyin ve tekrar deneyin.";
      } else if (error.message.includes("Network")) {
        return "❌ Bağlantı hatası. İnternet bağlantınızı kontrol edin.";
      } else if (error.message.includes("already applied")) {
        return "❌ Bu pozisyona daha önce başvuru yaptınız.";
      } else {
        return `❌ Başvuru sırasında bir hata oluştu: ${error.message}`;
      }
    }
  };

  // Enhanced Gemini prompt creation
  const createEnhancedPrompt = (
    userMessage,
    userContext,
    jobContext,
    chatHistory
  ) => {
    return `Sen "İlk Kontakt" platformunun uzman kariyer asistanısın. Bu platform profesyonel ağ kurma ve kariyer gelişiminin yeni adresidir.

PLATFORM HAKKINDA:
İlk Kontakt, profesyonel ağ kurmak, kariyerini geliştirmek ve yeni iş fırsatları bulmak isteyen herkes için tasarlanmış kapsamlı bir dijital platformdur. 

TEMEL ÖZELLİKLER:
• Kariyer Gelişimi: Kişiselleştirilmiş kariyer tavsiyeleri, beceri geliştirme imkanları ve sektör bilgileri
• Etkili Ağ Oluşturma: Meslektaşlar, sektör liderleri ve potansiyel iş birlikçileriyle bağlantı kurma
• Akıllı İş Arama: Yeteneklere ve hedeflere uygun iş ilanları ve hızlı başvuru sistemi
• Bilgi Paylaşımı: Makaleler, içgörüler ve sektör haberleri paylaşım platformu
• Mentorluk: Deneyimli profesyonellerle eşleştirme ve kariyer rehberliği
• Şirket Markalaşması: Kurumsal kültür sergileme ve yetenek çekme fırsatları
• Veri Analitiği: Profil görüntülemeleri, bağlantı büyümesi ve etkileşim takibi

KULLANICI PROFİLİ:
${userContext}

MEVCUT İŞ İLANLARI (İlk 10):
${jobContext}

ÖNCEKİ KONUŞMA:
${chatHistory}

KULLANICI MESAJI: "${userMessage}"

GÖREVİN:
1. Kullanıcının mesajındaki niyeti doğru anlayarak uygun yanıt ver
2. İş başvurusu istiyorsa: Spesifik pozisyon adıyla "X pozisyonuna başvur" formatını öner
3. İş arama istiyorsa: Kullanıcının profiline uygun önerilerde bulun
4. Genel sorularda: İlk Kontakt'ın özelliklerini doğal şekilde entegre et
5. Kullanıcının deneyim, beceri ve eğitimine göre kişiselleştirilmiş tavsiyeler ver
6. Platform özelliklerini (mentorluk, ağ kurma, veri analitiği) vurgula

YANIT KURALLARI:
- Türkçe ve samimi bir dil kullan
- Maksimum 4-5 cümle ile öz yanıt ver
- Kullanıcının deneyim/becerilerine göre özelleştir
- Platform özelliklerini doğal şekilde entegre et
- Emoji kullanma, profesyonel kal
- Somut öneriler ve eylem adımları ver

YANIT:`;
  };

  // Message processing handlers

  // New handler for listing requests
  const handleJobListing = () => {
    console.log("📋 Handling job listing request");
    return formatJobList(jobListings, "Mevcut İş İlanları:");
  };

  // Enhanced platform query handler
  const handlePlatformQuery = (userMessage) => {
    console.log("🏢 Handling platform information query");

    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes("nerede") || lowerMessage.includes("görüntüle")) {
      return `İş ilanlarını İlk Kontakt üzerinde görüntülemek için:

📱 **Web Sitesinde:**
• Ana sayfanın üst menüsünden "İş İlanları" sekmesine tıklayın
• Arama filtrelerini kullanarak pozisyon, şehir veya şirket bazında filtreleme yapın
• Profilinize uygun önerilen ilanları "Önerilen İşler" bölümünde görün

💬 **Bu Asistan Üzerinden:**
• "listele" - Tüm ilanları görüntüle
• "öner" - Size özel öneriler al
• "frontend ara" - Belirli pozisyonları ara
• "X pozisyonuna başvur" - Direkt başvuru yap

Hangi yöntemi tercih edersiniz?`;
    }

    return `İlk Kontakt, kariyerinizi geliştirmek için ihtiyacınız olan her şeyi bir araya getiren kapsamlı bir platformdur.

🎯 **Ana Özellikler:**
• Profesyonel ağ kurma ve genişletme
• Kişiselleştirilmiş iş önerileri ve hızlı başvuru
• Mentorluk programları ve kariyer rehberliği
• Beceri geliştirme ve eğitim fırsatları
• Veri analitiği ile profil performans takibi
• Sektör haberleri ve bilgi paylaşımı

${
  userProfile
    ? `Yazılım geliştirme alanındaki deneyiminizle bu platform üzerinde yeni fırsatlar keşfedebilir, sektör liderleriyle bağlantı kurabilir ve kariyerinizi bir sonraki seviyeye taşıyabilirsiniz.`
    : "Giriş yaparak tüm bu özelliklere erişebilir ve kariyerinizi ilerletebilirsiniz."
}`;
  };

  // Enhanced search handler with better filtering
  const handleJobSearch = (userMessage) => {
    console.log("🔍 Handling job search request");

    // Extract search terms more carefully
    const searchTerms = userMessage
      .replace(
        /(ara(?!k)|bul|göster|hangi işler|iş ara|pozisyon ara|iş fırsatları|stajyer.*ilanları)/gi,
        ""
      )
      .replace(/\s+/g, " ")
      .trim();

    // Special handling for intern/stajyer requests
    if (
      userMessage.toLowerCase().includes("stajyer") ||
      userMessage.toLowerCase().includes("intern")
    ) {
      const internJobs = jobListings.filter(
        (job) =>
          job.experienceLevel === 0 ||
          job.title.toLowerCase().includes("staj") ||
          job.title.toLowerCase().includes("intern")
      );

      if (internJobs.length === 0) {
        return `Şu anda stajyer pozisyonu bulunmuyor. 

Alternatif öneriler:
• "listele" yazarak tüm ilanları görün
• "öner" yazarak profilinize uygun önerileri alın
• Giriş seviyesi pozisyonları değerlendirin`;
      }

      return formatJobList(internJobs, "Stajyer İlanları:");
    }

    // If no specific terms, don't search
    if (!searchTerms || searchTerms.length < 2) {
      return "Arama yapmak için daha spesifik terimler kullanın. Örneğin: 'frontend ara', 'ankara işleri', 'uzaktan çalışma' gibi.";
    }

    const foundJobs = searchJobs(searchTerms, jobListings);

    if (foundJobs.length === 0) {
      return `"${searchTerms}" için uygun ilan bulunamadı. 
    
Alternatif öneriler:
• "listele" yazarak tüm ilanları görün
• "öner" yazarak profilinize uygun önerileri alın
• Daha genel terimlerle arama yapın (örn: "developer", "analyst")`;
    }

    return formatJobList(foundJobs, `"${searchTerms}" için bulunan ilanlar:`);
  };

  const handleJobRecommendations = () => {
    console.log("💡 Handling job recommendations request");

    const recommendedJobs = getAdvancedRecommendations();

    if (recommendedJobs.every((job) => job.score === 0)) {
      return formatJobList(
        recommendedJobs,
        "Size önerilen iş ilanları (genel öneriler):"
      );
    }

    return formatJobList(
      recommendedJobs,
      "Profilinize uygun önerilen iş ilanları:"
    );
  };

  const handleProfileQuery = () => {
    console.log("👤 Handling profile query");

    if (!userProfile) {
      return "Profilinizi görüntüleyebilmek için önce profil sayfanızı oluşturmanız gerekiyor. Profil sayfanızda eğitim geçmişinizi, iş deneyimlerinizi ve becerilerinizi ekleyerek size daha uygun iş önerileri alabilirsiniz.";
    }

    return getUserProfileSummary();
  };

  // Enhanced job application handler with better matching
  const handleJobApplication = async (userMessage) => {
    console.log("🎯 Handling job application request");

    const job = extractJobFromMessage(userMessage, jobListings);
    console.log("🔍 Extracted job:", job ? job.title : "Not found");

    if (!job) {
      // More intelligent suggestions
      const searchTerms = userMessage
        .replace(
          /(başvur|başvurmak|başvuru|apply|için|pozisyonuna|işine|ilanına)/gi,
          ""
        )
        .trim();

      if (searchTerms.length > 2) {
        const suggestions = searchJobs(searchTerms, jobListings).slice(0, 3);

        if (suggestions.length > 0) {
          return `Belirttiğiniz "${searchTerms}" pozisyonu tam olarak bulunamadı. Benzer ilanlar:

${formatJobList(suggestions)}

Bunlardan birine başvurmak için tam pozisyon adını kullanın. Örneğin: "${
            suggestions[0].title
          } pozisyonuna başvur"`;
        }
      }

      return `Belirttiğiniz pozisyon bulunamadı. 

Yapabilecekleriniz:
• "listele" - Tüm ilanları görün
• "öner" - Size uygun önerileri alın
• Tam pozisyon adını kullanın (örn: "Full Stack Developer pozisyonuna başvur")`;
    }

    // --- EXPERIENCE FIT CHECKPOINT ---
    let experienceWarning = null;
    let userExpLevel = null;
    if (userExperiences.length > 0) {
      const latestExp = userExperiences[0];
      const title = latestExp.title.toLowerCase();
      if (title.includes("staj") || title.includes("intern") || title.includes("trainee")) userExpLevel = 0;
      else if (title.includes("giriş") || title.includes("junior")) userExpLevel = 1;
      else if (title.includes("orta") || title.includes("mid")) userExpLevel = 2;
      else if (title.includes("üst") || title.includes("senior")) userExpLevel = 3;
      else if (title.includes("direktör") || title.includes("director")) userExpLevel = 4;
      else if (title.includes("yönetici") || title.includes("manager")) userExpLevel = 5;
      else userExpLevel = 2;
    }
    if (userExpLevel === null) userExpLevel = 0;
    // Underfit warning
    if ((userExpLevel === 0 || userExpLevel === 1) && job.experienceLevel >= 3) {
      experienceWarning = `⚠️ Uyarı: Bu pozisyon için deneyiminiz yetersiz görünüyor. Yine de başvurmak ister misiniz?\n\nProfiliniz: ${EXPERIENCE_LEVEL_LABELS[userExpLevel]}\nPozisyon: ${EXPERIENCE_LEVEL_LABELS[job.experienceLevel]}`;
    }
    // Overfit warning
    if (userExpLevel >= 3 && (job.experienceLevel === 0 || job.experienceLevel === 1)) {
      experienceWarning = `⚠️ Uyarı: Bu pozisyon, mevcut deneyim seviyenize göre çok daha düşük bir seviyede. Yine de başvurmak ister misiniz?\n\nProfiliniz: ${EXPERIENCE_LEVEL_LABELS[userExpLevel]}\nPozisyon: ${EXPERIENCE_LEVEL_LABELS[job.experienceLevel]}`;
    }
    // --- END EXPERIENCE FIT CHECKPOINT ---

    if (job.externalUrl) {
      return `Bu pozisyon için harici başvuru gerekiyor:

${formatJobDetails(job)}

🔗 Başvuru linki: ${job.externalUrl}`;
    }

    // If there is a warning, prepend it to the confirmation message
    if (experienceWarning) {
      return `${experienceWarning}\n\nAşağıdaki pozisyona başvurmak istediğinizi onaylıyor musunuz?\n\n${formatJobDetails(job)}\n\nOnaylamak için 'evet', iptal etmek için 'hayır' yazın.`;
    }

    console.log("✅ Setting pending application for job:", job.id);
    setPendingApplication(job);
    return `Aşağıdaki pozisyona başvurmak istediğinizi onaylıyor musunuz?\n\n${formatJobDetails(job)}\n\nOnaylamak için 'evet', iptal etmek için 'hayır' yazın.`;
  };

  const handleGeneralQuery = async (userMessage) => {
    console.log("💬 Handling general query with Gemini");

    try {
      const recentMessages = messages.slice(-5);
      const chatHistoryContext = recentMessages
        .map(
          (msg) =>
            `${msg.sender === "user" ? "Kullanıcı" : "Asistan"}: ${msg.text}`
        )
        .join("\n");

      const userContext = getUserProfileSummary();
      const jobContext = jobListings
        .slice(0, 10)
        .map(
          (job) =>
            `${job.title} - ${job.company} (${job.location}) - ${
              WORK_TYPE_LABELS[job.workType]
            }`
        )
        .join("\n");

      const prompt = createEnhancedPrompt(
        userMessage,
        userContext,
        jobContext,
        chatHistoryContext
      );

      const response = await fetch(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      const data = await response.json();
      if (data.candidates && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      }
      return "Üzgünüm, şu anda size yardımcı olamıyorum. 'listele' yazarak iş ilanlarını görebilir, 'öner' yazarak size uygun pozisyonları bulabilirsiniz.";
    } catch (error) {
      console.error("Error sending message to Gemini:", error);
      return "Bir hata oluştu. 'listele' yazarak iş ilanlarını görebilir, 'öner' yazarak size uygun pozisyonları bulabilirsiniz.";
    }
  };

  // Main message processing function
  const processMessage = async (userMessage) => {
    const intent = detectIntent(userMessage);
    const lowerMessage = userMessage.toLowerCase();

    console.log("🎯 Detected intent:", intent);
    console.log("📝 User message:", userMessage);

    // Handle pending applications with flexible confirmation
    if (pendingApplication) {
      const confirmationWords = [
        "evet",
        "onaylıyorum",
        "başvur",
        "tamam",
        "olur",
        "kabul",
        "onayla",
        "yes",
      ];
      const cancelWords = ["hayır", "iptal", "vazgeç", "olmaz", "cancel", "no"];

      if (confirmationWords.some((word) => lowerMessage.includes(word))) {
        const result = await handleApplyToJob(pendingApplication.id);
        setPendingApplication(null);
        return result;
      } else if (cancelWords.some((word) => lowerMessage.includes(word))) {
        setPendingApplication(null);
        return "Başvuru işlemi iptal edildi. Başka bir pozisyon için 'öner' yazarak size uygun ilanları görebilirsiniz.";
      }
      return "Lütfen başvurunuzu onaylamak için 'evet', iptal etmek için 'hayır' deyin.";
    }

    // Handle numbered job details
    const numberMatch = lowerMessage.match(
      /(\d+)\s*numaralı\s*ilanı?\s*göster/
    );
    if (numberMatch) {
      const jobIndex = parseInt(numberMatch[1]) - 1;
      if (jobIndex >= 0 && jobIndex < jobListings.length) {
        const job = jobListings[jobIndex];
        return `${formatJobDetails(job)}\n\nBu pozisyona başvurmak için "${
          job.title
        } pozisyonuna başvur" yazabilirsiniz.`;
      }
      return "❌ Geçersiz ilan numarası. 'listele' yazarak mevcut ilanları görebilirsiniz.";
    }

    // Route to appropriate handler based on intent
    switch (intent) {
      case "platform":
        return handlePlatformQuery(userMessage);
      case "listing":
        return handleJobListing();
      case "apply":
        return await handleJobApplication(userMessage);
      case "search":
        return handleJobSearch(userMessage);
      case "recommend":
        return handleJobRecommendations();
      case "profile":
        return handleProfileQuery();
      default:
        return await handleGeneralQuery(userMessage);
    }
  };

  // Speech functions
  const speakText = (text) => {
    if (!speechSynthesisRef.current) return;

    speechSynthesisRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = "tr-TR";
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const voices = speechSynthesisRef.current.getVoices();
    const turkishVoices = voices.filter((voice) => voice.lang.includes("tr"));

    if (turkishVoices.length > 0) {
      const preferredVoice =
        turkishVoices.find((voice) => voice.name.includes("female")) ||
        turkishVoices[0];
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechUtteranceRef.current = utterance;
    speechSynthesisRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const handleSpeechResult = async (transcript) => {
    const userMessage = {
      text: transcript,
      sender: "user",
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const reply = await processMessage(transcript);
      const botMessage = {
        text: reply,
        sender: "bot",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMessage]);
      // speakText(reply); // Auto speaking disabled
    } catch (error) {
      console.error("Error processing speech result:", error);
      const errorMessage = {
        text: "❌ Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.",
        sender: "bot",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      // speakText(errorMessage.text); // Auto speaking disabled
    } finally {
      setIsLoading(false);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      stopSpeaking();
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  // Message sending
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = {
      text: message,
      sender: "user",
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    const currentMessage = message;
    setMessage("");
    setIsLoading(true);

    try {
      const reply = await processMessage(currentMessage);
      const botMessage = {
        text: reply,
        sender: "bot",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMessage]);
      // speakText(reply); // Auto speaking disabled
    } catch (error) {
      console.error("Error processing message:", error);
      const errorMessage = {
        text: "❌ Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.",
        sender: "bot",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      // speakText(errorMessage.text); // Auto speaking disabled
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // Enhanced welcome message
  const getWelcomeMessage = () => {
    if (!currentUser) {
      return `Merhaba! Ben "İlk Kontakt" platformunun kariyer asistanıyım. Size profesyonel ağ kurma, kariyer geliştirme ve iş fırsatları bulma konusunda yardımcı olabilirim.

İlk Kontakt ile yapabilecekleriniz:
• Profesyonel profil oluşturma ve yönetme
• Sektör profesyonelleriyle ağ kurma
• Kişiselleştirilmiş iş önerileri alma
• Mentorluk fırsatları bulma
• Kariyer gelişimi için içerik paylaşımı

Giriş yaparak tüm özelliklere erişebilir, "listele" yazarak iş ilanlarını görüntüleyebilirsiniz.`;
    }

    if (currentUser.isCompanyProfile) {
      return `Merhaba ${currentUser.userName}! Şirket hesabınızla İlk Kontakt'ta şunları yapabilirsiniz:

• İş ilanları yayınlama ve yönetme
• Şirket profilinizi güncelleme ve markalaşma
• Nitelikli adaylarla eşleşme
• Başvuruları görüntüleme ve değerlendirme
• Kurumsal ağınızı genişletme

'listele' yazarak mevcut iş ilanlarını görüntüleyebilirsiniz.`;
    }

    const profileStatus = userProfile
      ? "✅ Profil tamamlanmış"
      : "⚠️ Profil eksik";
    const skillCount = userSkills.length;
    const expCount = userExperiences.length;

    return `Merhaba ${currentUser.userName}! Ben İlk Kontakt kariyer asistanınızım.

📊 Profil Durumunuz: ${profileStatus}
🎯 Yetenekler: ${skillCount} beceri
💼 Deneyimler: ${expCount} pozisyon

Yapabilecekleriniz:
• "listele" - Tüm iş ilanlarını görüntüle
• "öner" - Size özel iş önerileri al
• "frontend ara" - Belirli pozisyonları ara  
• "X pozisyonuna başvur" - Hızlı başvuru yap
• "profilim" - Profil bilgilerinizi görüntüle

Ayrıca mentorluk, ağ kurma ve kariyer gelişimi konularında da size yardımcı olabilirim!`;
  };

  const handleActionClick = async (action) => {
    const response = action === "apply" ? "evet" : "hayır";

    const userMessage = {
      text: response,
      sender: "user",
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const reply = await processMessage(response);
      const botMessage = {
        text: reply,
        sender: "bot",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMessage]);
      // speakText(reply); // Auto speaking disabled
    } catch (error) {
      console.error("Error processing message:", error);
      const errorMessage = {
        text: "❌ Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.",
        sender: "bot",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      // speakText(errorMessage.text); // Auto speaking disabled
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageContent = (msg) => {
    const lines = msg.text.split("\n");
    const hasActions =
      msg.sender === "bot" &&
      (msg.text.includes("onaylıyor musunuz?") ||
        msg.text.includes("onaylamak için"));

    return (
      <>
        {lines.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
        {hasActions && (
          <div className="message-actions">
            <button
              className="message-action-button apply"
              onClick={() => handleActionClick("apply")}
            >
              Başvur
            </button>
            <button
              className="message-action-button cancel"
              onClick={() => handleActionClick("cancel")}
            >
              İptal
            </button>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="chat-container">
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h3>İlk Kontakt Kariyer Asistanı</h3>
            <div className="header-controls">
              <button
                className="speech-toggle-btn"
                onClick={
                  isSpeaking
                    ? stopSpeaking
                    : () => speakText(messages[messages.length - 1]?.text)
                }
                title={isSpeaking ? "Konuşmayı Durdur" : "Son Mesajı Oku"}
                disabled={!messages.length}
              >
                {isSpeaking ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <button className="close-button" onClick={toggleChat}>
                <X size={20} />
              </button>
            </div>
          </div>
          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="message bot-message">
                <div className="message-text">{getWelcomeMessage()}</div>
              </div>
            )}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${
                  msg.sender === "bot" ? "bot-message" : "user-message"
                }`}
              >
                <div className="message-text">{renderMessageContent(msg)}</div>
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
              placeholder="Mesajınızı yazın veya mikrofona konuşun..."
              className="chat-input"
              disabled={isLoading || isListening}
            />
            <button
              type="button"
              className={`mic-button ${isListening ? "listening" : ""}`}
              onClick={isListening ? stopListening : startListening}
              title={isListening ? "Dinleniyor..." : "Mikrofon ile konuş"}
              disabled={isLoading}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            <button
              type="submit"
              className="send-button"
              disabled={isLoading || !message.trim() || isListening}
            >
              <Send size={20} />
            </button>
          </form>
          {isListening && (
            <div className="listening-indicator">
              Dinleniyor... Lütfen konuşun.
            </div>
          )}
        </div>
      )}
      <button
        className={`chat-button ${isOpen ? "active" : ""}`}
        onClick={toggleChat}
      >
        <MessageCircle size={24} />
      </button>
    </div>
  );
};

export default ChatButton;
