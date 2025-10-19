import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
  he: {
    translation: {
      // Navigation
      nav: {
        benefits: 'היתרונות',
        howItWorks: 'איך זה עובד',
        login: 'התחברות',
        signup: 'הרשמה',
        jobMatch: 'Jobinder'
      },
      // Hero Section
      hero: {
        title: 'מצא עבודה ב-67% פחות זמן',
        subtitle: 'הטינדר למשרות - ממוצע של 12 ימים למציאת עבודה',
        description: 'בינה מלאכותית חכמה שמתאימה בין הכישורים שלך לבין הזדמנויות העבודה המושלמות. פשוט החלק ימינה למשרה שמעניינת אותך!',
        cta: 'התחל חיפוש עבודה',
        secondaryCta: 'התחברות',
        tryDemo: 'נסה דמו של 30 שניות - ללא הרשמה',
        findJob: 'בוא נמצא לך עבודה - זה לוקח 2 דקות',
        imEmployer: 'אני מעסיק',
        features: {
          free: 'חינם לחלוטין',
          noCommitment: 'ללא התחייבות',
          results: 'תוצאות תוך 24 שעות'
        }
      },
      // Statistics
      stats: {
        activeNow: 'פעיל עכשיו',
        searchingNow: 'מחפשים עבודה עכשיו',
        matchesToday: 'התאמות היום',
        successfulHires: 'גיוסים מוצלחים',
        avgDays: 'ימים ממוצע למציאת עבודה',
        employersSearched: 'מעסיקים חיפשו את הכישורים שלך השבוע',
        letThemFind: 'תן להם למצוא אותך'
      },
      // Activity Feed
      activity: {
        foundJob: 'מצא משרה ב',
        receivedMatches: 'קיבלה {count} התאמות חדשות',
        ago: {
          minute: 'לפני דקה',
          minutes: 'לפני {count} דקות',
          hour: 'לפני שעה',
          hours: 'לפני {count} שעות'
        }
      },
      // Benefits Section
      benefits: {
        title: 'למה Jobinder?',
        subtitle: 'מערכת חכמה ומתקדמת שחוסכת זמן ומוצאת את ההתאמה המושלמת',
        timeSaving: {
          title: 'חיסכון בזמן',
          description: 'רק משרות רלוונטיות בדיוק למה שאתה מחפש, ללא עומס מידע מיותר'
        },
        ai: {
          title: 'בינה מלאכותית',
          description: 'אלגוריתם חכם שלומד את העדפותיך ומשפר את ההתאמות עם הזמן'
        },
        accurateMatching: {
          title: 'התאמות מדויקות',
          description: 'מתאימים בין כישורים, ניסיון ותרבות ארגונית לחיבור אמיתי'
        },
        pleasant: {
          title: 'חוויה נעימה',
          description: 'ממשק פשוט וידידותי שהופך את חיפוש העבודה לחוויה מהנה'
        },
        instant: {
          title: 'התאמות מיידיות',
          description: 'קבל התאמה למשרות רלוונטיות תוך שניות'
        },
        smart: {
          title: 'אלגוריתם חכם',
          description: 'בינה מלאכותית שלומדת את העדפותיך ומשתפרת עם הזמן'
        },
        private: {
          title: 'פרטיות קודם כל',
          description: 'המידע שלך מאובטח ולא משותף ללא אישורך'
        },
        fast: {
          title: 'תוצאות מהירות',
          description: 'התחל לקבל ראיונות תוך 24 שעות'
        }
      },
      // Demo Section
      demo: {
        title: 'רוצה לראות איך זה עובד?',
        subtitle: 'נסה את הדמו האינטראקטיבי שלנו - ללא הרשמה, ללא מחויבות',
        match: 'התאמה',
        tryDemo: 'נסה דמו מלא',
        tryLike: 'נסה לעשות Like למשרה הזו ↗️',
        itsMatch: 'זה התאמה!',
        alsoLiked: 'גם {company} אהבו את הפרופיל שלך',
        startNow: 'התחל עכשיו - בחינם!'
      },
      // How it Works
      howItWorks: {
        title: 'איך זה עובד?',
        subtitle: '4 צעדים פשוטים למצוא את העבודה המושלמת',
        step1: {
          title: 'צור פרופיל',
          description: 'הוסף את הכישורים, הניסיון והעדפות העבודה שלך'
        },
        step2: {
          title: 'קבל המלצות',
          description: 'המערכת תציג לך משרות המותאמות אישית עבורך'
        },
        step3: {
          title: 'החלק והתאמ',
          description: 'החלק ימינה למשרות מעניינות, שמאלה לאלו שפחות'
        },
        step4: {
          title: 'צאט והתחל',
          description: 'כשיש התאמה הדדית, פתח שיחה עם המעסיק'
        }
      },
      // Limited Offer
      limitedOffer: {
        badge: 'הצעה מוגבלת',
        title: 'החברים הראשונים יקבלו יתרונות מיוחדים!',
        highlighted: {
          title: 'פרופיל מודגש',
          description: 'המעסיקים יראו אותך ראשון'
        },
        earlyAccess: {
          title: 'גישה מוקדמת',
          description: 'תכונות חדשות לפני כולם'
        },
        consultation: {
          title: 'ייעוץ אישי',
          description: 'עזרה בבניית פרופיל מושלם'
        },
        limitedSpots: 'נשארו רק מספר מקומות מוגבל!',
        wantBenefits: 'אני רוצה את היתרונות האלה!',
        registered: 'נרשמו כבר {count} אנשים השבוע'
      },
      // Testimonials
      testimonials: {
        title: 'מה אומרים עלינו?',
        subtitle: 'סיפורי הצלחה אמיתיים מהמשתמשים שלנו',
        reviews: {
          dani: {
            name: 'דני כהן',
            role: 'מפתח Full Stack',
            text: 'מצאתי עבודה בחלומות בתוך שבועיים! הממשק כל כך פשוט וחכם. הרגשתי שכל משרה שהוצגה לי באמת רלוונטית.'
          },
          michal: {
            name: 'מיכל לוי',
            role: 'מנהלת שיווק',
            text: 'כמעסיקה, חסכתי שעות של סינון קורות חיים. המועמדים שמגיעים אליי הם בדיוק מה שחיפשתי.'
          },
          avi: {
            name: 'אבי חן',
            role: 'מהנדס תוכנה',
            text: 'הצלחתי לשנות קריירה בזכות Jobinder. הפלטפורמה עזרה לי להבין איך להציג את עצמי לתחום חדש.'
          }
        }
      },
      // Final Stats
      finalStats: {
        title: 'למה Jobinder עובד טוב יותר?',
        moreMatches: 'יותר התאמות איכותיות מאתרי גיוס רגילים',
        lessTime: 'פחות זמן עד למציאת עבודה מתאימה',
        satisfaction: 'שביעות רצון ממעסיקים ומחפשי עבודה'
      },
      // CTA
      cta: {
        title: 'מוכנים להתחיל?',
        subtitle: 'הצטרפו לאלפי מחפשי עבודה ומעסיקים שכבר מצאו את ההתאמה המושלמת',
        startJobSearch: 'התחל חיפוש עבודה',
        postJobs: 'פרסם משרות'
      },
      // Footer
      footer: {
        tagline: 'טינדר למשרות - המקום לחיבור מושלם',
        description: 'פלטפורמת הגיוס המתקדמת לחיבור מושלם בין מעסיקים למועמדים',
        copyright: '© 2024 Jobinder. כל הזכויות שמורות.'
      },
      // Auth Modals
      auth: {
        login: {
          title: 'התחברות',
          subtitle: 'ברוכים השבים למערכת',
          email: 'אימייל',
          password: 'סיסמה',
          submit: 'התחבר',
          noAccount: 'אין לך חשבון?',
          signupHere: 'הירשם כאן'
        },
        signup: {
          title: 'הרשמה',
          subtitle: 'הצטרפו לקהילה שלנו',
          userType: 'סוג המשתמש',
          jobSeeker: 'מחפש עבודה',
          employer: 'מעסיק',
          fullName: 'שם מלא',
          email: 'אימייל',
          password: 'סיסמה',
          submit: 'הירשם',
          haveAccount: 'כבר יש לך חשבון?',
          loginHere: 'התחבר כאן'
        }
      },
      // Job Card
      job: {
        location: 'מיקום',
        salary: 'משכורת',
        skills: 'כישורים נדרשים'
      }
    }
  },
  en: {
    translation: {
      nav: {
        benefits: 'Benefits',
        howItWorks: 'How It Works',
        login: 'Login',
        signup: 'Sign Up',
        jobMatch: 'Jobinder'
      },
      hero: {
        title: 'Find a Job 67% Faster',
        subtitle: 'Tinder for Jobs - Average 12 days to find work',
        description: 'Smart AI that matches your skills with perfect job opportunities. Simply swipe right on jobs you like!',
        cta: 'Start Job Search',
        secondaryCta: 'Login',
        tryDemo: 'Try 30-second demo - no signup',
        findJob: "Let's find you a job - takes 2 minutes",
        imEmployer: "I'm an employer",
        features: {
          free: 'Completely free',
          noCommitment: 'No commitment',
          results: 'Results within 24 hours'
        }
      },
      stats: {
        activeNow: 'Active Now',
        searchingNow: 'Looking for work now',
        matchesToday: 'Matches today',
        successfulHires: 'Successful hires',
        avgDays: 'Average days to find work',
        employersSearched: 'Employers searched for your skills this week',
        letThemFind: 'Let them find you'
      },
      benefits: {
        title: 'Why Jobinder?',
        subtitle: 'Smart and advanced system that saves time and finds the perfect match',
        timeSaving: {
          title: 'Time Saving',
          description: 'Only relevant jobs exactly what you are looking for, no information overload'
        },
        ai: {
          title: 'Artificial Intelligence',
          description: 'Smart algorithm that learns your preferences and improves matches over time'
        },
        accurateMatching: {
          title: 'Accurate Matching',
          description: 'Matching skills, experience and organizational culture for a real connection'
        },
        pleasant: {
          title: 'Pleasant Experience',
          description: 'Simple and friendly interface that makes job search enjoyable'
        },
        instant: {
          title: 'Instant Matches',
          description: 'Get matched with relevant jobs in seconds'
        },
        smart: {
          title: 'Smart Algorithm',
          description: 'AI learns your preferences and improves over time'
        },
        private: {
          title: 'Privacy First',
          description: 'Your data is secure and never shared without permission'
        },
        fast: {
          title: 'Fast Results',
          description: 'Start getting interviews within 24 hours'
        }
      },
      cta: {
        title: 'Ready to Start?',
        subtitle: 'Join thousands of job seekers and employers who have already found their perfect match',
        button: 'Start Job Search'
      },
      footer: {
        about: {
          title: 'About Jobinder',
          desc: 'The smart platform for matching job seekers and employers using AI technology'
        },
        links: {
          title: 'Quick Links',
          about: 'About Us',
          privacy: 'Privacy Policy',
          terms: 'Terms of Service'
        },
        contact: {
          title: 'Contact',
          email: 'support@jobinder.com'
        },
        copyright: '© 2025 Jobinder. All rights reserved.'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'he', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;

