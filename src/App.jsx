import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  Instagram, 
  ArrowRight, 
  BarChart3, 
  Globe, 
  Users, 
  ShoppingBag, 
  CheckCircle2, 
  Star, 
  Mail, 
  ShoppingCart,
  TrendingUp,
  Eye, 
  Calendar,
  Award,
  UserRound
} from 'lucide-react';

/**
 * @component LegalModal
 * 법적 고지 사항 전용 모달
 */
const LegalModal = ({ isOpen, title, content, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-none shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 text-black"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 bg-white border-b border-gray-100">
          <h2 className="text-xl font-medium text-gray-900 tracking-tight">{title}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
            <X size={26} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 md:p-12 text-gray-700 leading-relaxed text-sm md:text-base bg-gray-50/30">
          <div className="legal-content-wrapper text-black" dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </div>
      <div className="absolute inset-0 -z-10" onClick={onClose}></div>
    </div>
  );
};

const PurchaseIcons = ({ lang, naverUrl, amazonUrl, rakutenUrl }) => {
  const disabledClass = "flex items-center gap-2 bg-gray-100 text-gray-400 border border-gray-200 px-4 py-3.5 w-full justify-center rounded-none cursor-not-allowed pointer-events-none";
  const labelStyle = "text-[13px] font-medium uppercase tracking-widest";

  if (lang === 'ko') {
    return naverUrl ? (
      <a href={naverUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#03C75A] text-white px-4 py-3.5 hover:bg-[#02b351] transition-colors w-full justify-center rounded-none shadow-sm">
        <ShoppingCart size={18} />
        <span className={labelStyle}>네이버 스마트스토어</span>
      </a>
    ) : (
      <div className={disabledClass}><ShoppingCart size={18} /><span className={labelStyle}>네이버 스마트스토어</span></div>
    );
  }

  if (lang === 'ja') {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {amazonUrl ? (
          <a href={amazonUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#FF9900] text-black px-4 py-3.5 hover:bg-[#e68a00] transition-colors w-full justify-center rounded-none shadow-sm">
            <span className={labelStyle}>Amazon JP</span>
          </a>
        ) : (
          <div className={disabledClass}><span className={labelStyle}>Amazon JP</span></div>
        )}
        {rakutenUrl ? (
          <a href={rakutenUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#BF0000] text-white px-4 py-3.5 hover:bg-[#a60000] transition-colors w-full justify-center rounded-none shadow-sm">
            <span className={labelStyle}>楽天市場</span>
          </a>
        ) : (
          <div className={disabledClass}><span className={labelStyle}>楽天市場</span></div>
        )}
      </div>
    );
  }

  if (lang === 'en') {
    return amazonUrl ? (
      <a href={amazonUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#FF9900] text-black px-4 py-3.5 hover:bg-[#e68a00] transition-colors w-full justify-center rounded-none shadow-sm">
        <span className={labelStyle}>Amazon US</span>
      </a>
    ) : (
      <div className={disabledClass}><span className={labelStyle}>Amazon US</span></div>
    );
  }
  return null;
};

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lang, setLang] = useState('ko');
  const [modalType, setModalType] = useState(null);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');

  const translations = {
    ko: {
      nav: { about: '소개', influencer: '인플루언서', products: '제품', roadmap: '로드맵', cta: '문의하기' },
      hero: {
        tag: "영향력이 성과로 이어지는 에코시스템",
        title: <>콘텐츠로 <br /> 세상의 <br /><span className="text-yellow-500 underline decoration-black underline-offset-8">취향을 잇다</span></>,
        desc: "Kray는 단순한 인플루언서 마케팅을 넘어 실질적인 판매 실적과 브랜드 자산을 구축하는 '콘텐츠 커머스' 기업입니다. 일본 현지의 도시락 문화를 한국적 감성으로 재해석하여 한일 양국에 새로운 라이프스타일을 제안합니다."
      },
      valuesIntro: { tag: "Executive Summary", title: "평범함 속의 특별함" },
      values: [
        { title: "인플루언서 기반 경영", desc: "요리·도시락에 특화된 인플루언서 경영" },
        { title: "독보적인 콘텐츠 파급력", desc: "압도적인 도달 범위와 높은 바이럴 잠재력" },
        { title: "최적의 마켓 핏 기획력", desc: "시장의 요구를 정확히 관통하는 상품 개발" },
        { title: "한일 양국 트렌드 가교", desc: "한국적 감성과 일본 제조 기술의 융합" },
      ],
      stats: [
        { label: "팔로워 수", value: "13.3만", sub: "Instagram Audience" },
        { label: "릴스 누적 재생", value: "1억+", sub: "Short-form Impact" },
        { label: "최대 조회수", value: "1,722만", sub: "Viral Content" },
        { label: "업로드 빈도", value: "주 4~5회", sub: "Daily Engagement" },
      ],
      influencerIntro: { tag: "Unrivaled Reach", title: "1억 재생수가 증명하는 영향력" },
      influencer: {
        title: "압도적인 콘텐츠 파워",
        desc: "일본 거주 한국인 인플루언서 'SONA'는 현지에서 경험한 도시락 문화를 특유의 감성으로 재해석하여 전 세계 시청자들의 마음을 사로잡았습니다. 단순한 영상을 넘어, '나도 만들 수 있겠다'는 확신을 주는 튜토리얼을 제공합니다."
      },
      strategy: {
        title: "Content Strategy: 'Show & Teach'",
        subtitle: "시선을 사로잡는 비주얼 + 직관적 튜토리얼 = 자연스러운 구매로 연결",
        steps: [
          { title: "Visual (Show)", desc: "꽃 김밥, 캐릭터 토스트 등 귀여운 도시락과 센스 넘치는 요리로 시선을 압도합니다." },
          { title: "Process (Teach)", desc: "직관적인 튜토리얼과 도구 활용법으로 '나도 할 수 있다'는 확신을 줍니다." },
          { title: "Action (Buy)", desc: "자연스러운 구매 경로 제안으로 실제 소비와 팬덤 형성으로 이끌어냅니다." },
        ]
      },
      brand: { 
        tag: "Our Brand Identity", 
        title: "요리에 즐거움 1큰술",
        caption: "위 이미지는 일본에서 상표 등록된 소나앤도쿄의 정식 로고 입니다."
      },
      products: {
        tag: "Product Lineup",
        title: "SONA가 프로듀스한 라인업",
        footnote: "※ 도시락 데코레이션 카테고리 부문",
        items: [
          {
            title: "별·하트 계란말이 틀",
            badge: "아마존 재팬 베스트셀러 1위! (※)",
            desc: "틀에 넣는 것만으로 누구나 예쁜 모양 완성! 초보자의 Pain Point를 해결한 아이템.",
            features: ["한/일/중 디자인 등록", "누적 리뷰 고평가"],
            urls: {
              naver: "https://mkt.shopping.naver.com/link/68f668bf309bbc4b1c8000cb",
              amazon: "https://www.amazon.co.jp/gp/product/B0CVNG3VPT/",
              rakuten: null
            }
          },
          {
            title: "별란스틱",
            badge: "New Release",
            desc: "가벼운 힘으로 매끄러운 계란물을 제조! 알끈 제거 기능까지 포함된 프리미엄 도구.",
            features: ["18-8 스테인리스 소재", "폭신한 계란말이 최적화"],
            urls: {
              naver: "https://mkt.shopping.naver.com/link/68f668bfdb0ddd370ee27b0a",
              amazon: "https://www.amazon.co.jp/gp/product/B0FJLHR5D3/",
              rakuten: null
            }
          },
          {
            title: "트리플 팬 (출시 예정)",
            badge: "Coming Soon",
            desc: "세 가지 요리를 동시에! SONA 에디션 신규 컬러 2종과 전용 뒤집개 세트 상품!",
            features: ["SONA Edition", "3구 동시 조리 시스템"],
            urls: { naver: null, amazon: null, rakuten: null }
          }
        ]
      },
      roadmapIntro: { tag: "Brand Roadmap", title: "지속 가능한 브랜드로 성장" },
      roadmap: [
        { year: "2024.02", title: "별·하트 계란말이 틀 출시", desc: "별/하트 모양 프로듀스" },
        { year: "2024.05", title: "도시락 레시피 출간", desc: "한국어판 정식 발행" },
        { year: "2025.07", title: "별란스틱 출시", desc: "본격적인 라인업 확장" },
        { year: "2026.05", title: "트리플 팬 출시 예정", desc: "자사 브랜드 입지 강화" },
      ],
      contact: {
        title: "CONNECT US",
        desc: <>Kray와 함께 새로운 콘텐츠 커머스의 미래를 만들어갈 비즈니스 파트너를 기다립니다. <br className="hidden md:block" /> 협업 제안 및 문의는 아래 메일로 연락 부탁드립니다.</>
      },
      legal: {
        privacy: "개인정보 처리방침",
        terms: "이용약관",
        notices: "特定商取引法に基づく表記"
      }
    },
    ja: {
      nav: { about: '紹介', influencer: 'インフルエンサー', products: '製品', roadmap: 'ロードマップ', cta: 'お問い合わせ' },
      hero: {
        tag: "影響力が成果に繋がるエコシステム",
        title: <>コンテンツで <br /> 世界の <br /><span className="text-yellow-500 underline decoration-black underline-offset-8">「好み」を繋ぐ</span></>,
        desc: "Krayは単なるインフルエンサーマーケティングを超え、実質的な販売実績とブランド資産を構築する「コンテンツコマース」企業です。日本現地のお弁当文化を韓国的な感性で再解釈し、日韓両国に新しいライフスタイルを提案します。"
      },
      valuesIntro: { tag: "Executive Summary", title: "平凡の中に特別さが染み込む" },
      values: [
        { title: "クリエイター経営", desc: "料理・お弁当特화型クリエイターによる経営" },
        { title: "圧倒的なコンテンツ拡散力", desc: "圧倒的なコンテンツ拡散力とリーチ力" },
        { title: "マーケット適合の商品企画", desc: "市場ニーズを的確に捉えた最適な商品開発" },
        { title: "日韓トレンドの架け橋", desc: "韓国の感性と日本製造技術の融合" },
      ],
      stats: [
        { label: "フォロワー数", value: "13.3万人", sub: "Instagram Audience" },
        { label: "リール累計再生", value: "1億超え", sub: "Short-form Impact" },
        { label: "最多再生回数", value: "1,722万回", sub: "星のキンパ動画" },
        { label: "投稿頻度", value: "週4〜5回", sub: "継続的な発信" },
      ],
      influencerIntro: { tag: "Unrivaled Reach", title: "1億再生が証明する影響力" },
      influencer: {
        title: "圧倒的なコンテンツパワー",
        desc: "日本在住の韓国人クリエイター「SONA」は、現地で経験したお弁当文化を独自の感性で再解釈し、世界中の視聴者を魅了しました。単なる動画を超え、「私にもできる」という確信を与えるチュートリアルを提供しています。"
      },
      strategy: {
        title: "Content Strategy: 「魅せる」& 「教える」",
        subtitle: "目を引くビジュアル + 直感的なチュートリアル = 自然な購買への繋がり",
        steps: [
          { title: "Visual (魅せる)", desc: "可愛いお弁当やセンス溢れる料理が画面を圧倒します。" },
          { title: "Process (教える)", desc: "分かりやすい動画と道具の使い方で、誰でも作れるという自信を与えます。" },
          { title: "Action (買う)", desc: "自然な購買導線で、実際の購入とファン層の形成へと導きます。" },
        ]
      },
      brand: { 
        tag: "Our Brand Identity", 
        title: "料理に楽しさ大さじ1杯",
        caption: "上記の画像は日本で商標登録された SONA and TOKYO の公式ロゴです。"
      },
      products: {
        tag: "Product Lineup",
        title: "SONAプロデュースのラインナップ",
        footnote: "※弁当デコレーションカテゴリー部門",
        items: [
          {
            title: "星・ハートの卵焼き型",
            badge: "Amazon JP 売れ筋ランキング1位! (※)",
            desc: "型に入れるだけで誰でも可愛い形が完成します！お弁当初心者の悩みを解決する画期的なアイテムです。",
            features: ["日・韓・中にて意匠登録済", "お客様からの高い評価"],
            urls: {
              naver: "https://mkt.shopping.naver.com/link/68f668bf309bbc4b1c8000cb",
              amazon: "https://www.amazon.co.jp/gp/product/B0CVNG3VPT/",
              rakuten: null
            }
          },
          {
            title: "星の卵とき",
            badge: "New Release",
            desc: "軽い力でなめらかな溶き卵が作れるプレミアム調理器具です。",
            features: ["18-8ステンレス素材", "ふわふわ卵焼きに最適化"],
            urls: {
              naver: "https://mkt.shopping.naver.com/link/68f668bfdb0ddd370ee27b0a",
              amazon: "https://www.amazon.co.jp/gp/product/B0FJLHR5D3/",
              rakuten: null
            }
          },
          {
            title: "トリプルパン (予定)",
            badge: "Coming Soon",
            desc: "3品同時に！SONAエディションの新色2種と専用ターナーがセットになって発売！",
            features: ["SONA Edition", "3口同時調理システム"],
            urls: { naver: null, amazon: null, rakuten: null }
          }
        ]
      },
      roadmapIntro: { tag: "Brand Roadmap", title: "持続可能なブランドへ成長" },
      roadmap: [
        { year: "2024.02", title: "星・ハートの卵焼き型 発売", desc: "星・ハート型のプロデュース" },
        { year: "2024.05", title: "レシピ本出版", desc: "韓国にてベストセラー" },
        { year: "2025.07", title: "星の卵とき 発売", desc: "ラインアップの拡充" },
        { year: "2026.05", title: "トリプルパン 発売予定", desc: "自社ブランドの強化" },
      ],
      contact: {
        title: "CONNECT US",
        desc: <>Krayと共に新しいコンテンツコマースの未来を創るパートナーを募集しています。<br className="hidden md:block" /> 提携のご提案やお問い合わせは、下記のメールアドレスまでご連絡ください。</>
      },
      legal: {
        privacy: "プライバシーポリシー",
        terms: "利用規約",
        notices: "特定商取引法に基づく表記"
      }
    },
    en: {
      nav: { about: 'About', influencer: 'Influencer', products: 'Products', roadmap: 'Roadmap', cta: 'Contact Us' },
      hero: {
        tag: "Ecosystem Where Influence Leads to Results",
        title: <>Connecting <br /><span className="text-yellow-500 underline decoration-black underline-offset-8">Global Tastes</span> with Content</>,
        desc: "Kray is a 'Content Commerce' company that builds brand assets and actual sales records beyond simple influencer marketing. We propose a new lifestyle by reinterpreting Japanese bento culture with Korean sensibilities."
      },
      valuesIntro: { tag: "Executive Summary", title: "Infusing Extraordinary Value into the Ordinary" },
      values: [
        { title: "Influencer-Led Business", desc: "Management led by specialists in bento content" },
        { title: "Global Content Impact", desc: "Creative expression with unrivaled viral reach" },
        { title: "Market Fit Planning", desc: "Product planning tailored exactly to market needs" },
        { title: "Cross-Border Bridge", desc: "The fusion of Korean sensibilities and Japanese manufacturing technology" },
      ],
      stats: [
        { label: "Followers", value: "133K", sub: "Instagram Audience" },
        { label: "Total Reels Views", value: "100M+", sub: "Short-form Impact" },
        { label: "Most Viewed Reel", value: "17.2M", sub: "Star Kimbap Video" },
        { label: "Post Frequency", value: "4-5/Week", sub: "Steady Communication" },
      ],
      influencerIntro: { tag: "Unrivaled Reach", title: "Proving Influence with 100M Views" },
      influencer: {
        title: "Overwhelming Content Power",
        desc: "SONA, a Korean influencer living in Japan, reinterpreted the local bento culture with her unique sensibility and captured global audiences. Beyond videos, she provides tutorials that give confidence: 'I can do this too'."
      },
      strategy: {
        title: "Content Strategy: 'Show & Teach'",
        subtitle: "Eye-catching Visuals + Intuitive Tutorials = Natural Connection to Purchase",
        steps: [
          { title: "Visual (Show)", desc: "Cute lunch boxes and sensible dishes dominate the screen." },
          { title: "Process (Teach)", desc: "Tutorials that give everyone the confidence to replicate." },
          { title: "Action (Buy)", desc: "Natural flow to purchase through strategic call-to-actions." },
        ]
      },
      brand: { 
        tag: "Our Brand Identity", 
        title: "A Tablespoon of Joy in Cooking",
        caption: "The image above is the official trademarked logo of SONA and TOKYO in Japan."
      },
      products: {
        tag: "Product Lineup",
        title: "Lineup Produced by SONA",
        footnote: "* Bento Decoration Category",
        items: [
          {
            title: "Star & Heart Egg Roll Mold",
            badge: "Amazon JP Best Seller #1 (*)",
            desc: "Perfect shapes just by putting eggs in the mold! Solves bento beginners' pain points.",
            features: ["Design Registered", "Highly Rated by Users"],
            urls: {
              naver: "https://mkt.shopping.naver.com/link/68f668bf309bbc4b1c8000cb",
              amazon: "https://www.amazon.co.jp/gp/product/B0CVNG3VPT/",
              rakuten: null
            }
          },
          {
            title: "Star-shaped Egg Beater",
            badge: "New Release",
            desc: "Make smooth beaten eggs with light force. Premium tool with egg-spot removal.",
            features: ["18-8 Stainless Steel", "Fluffy egg roll optimized"],
            urls: {
              naver: "https://mkt.shopping.naver.com/link/68f668bfdb0ddd370ee27b0a",
              amazon: "https://www.amazon.co.jp/gp/product/B0FJLHR5D3/",
              rakuten: null
            }
          },
          {
            title: "Triple Pan",
            badge: "Coming Soon",
            desc: "Three dishes at once! SONA Edition with 2 new colors and a dedicated spatula set!",
            features: ["SONA Edition", "Simultaneous 3-dish system"],
            urls: { naver: null, amazon: null, rakuten: null }
          }
        ]
      },
      roadmapIntro: { tag: "Brand Roadmap", title: "Growth as a Sustainable Brand" },
      roadmap: [
        { year: "2024.02", title: "Star & Heart Egg Roll Mold Launch", desc: "Star & Heart Series" },
        { year: "2024.05", title: "Recipe Book", desc: "Published in Korea" },
        { year: "2025.07", title: "Star-shaped Egg Beater Stick Launch", desc: "Lineup Expansion" },
        { year: "2026.05", title: "Triple Pan Launch", desc: "Planned release" },
      ],
      contact: {
        title: "CONNECT US",
        desc: <>We look forward to business partners creating the future of content commerce with Kray. <br className="hidden md:block" /> For collaboration inquiries, please contact us via the email below.</>
      },
      legal: {
        privacy: "Privacy Policy",
        terms: "Terms of Use",
        notices: "Legal Notices"
      }
    }
  };

  const t = translations[lang] || translations.en;

  const openModal = async (type) => {
    const fileNameMap = { privacy: 'privacy.html', terms: 'terms.html', notices: 'legal.html' };
    setModalTitle(t.legal[type]);
    try {
      const response = await fetch(`/${fileNameMap[type]}`);
      if (response.ok) {
        const fullHtml = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(fullHtml, 'text/html');
        const langSection = doc.getElementById(lang);
        if (langSection) setModalContent(langSection.innerHTML);
        else {
          const fallbackSection = doc.getElementById('ja');
          setModalContent(fallbackSection ? fallbackSection.innerHTML : fullHtml);
        }
      } else setModalContent(`<p class="text-center py-20">데이터를 불러올 수 없습니다.</p>`);
    } catch (error) { setModalContent(`<p class="text-center py-20">오류가 발생했습니다.</p>`); }
    setModalType(type);
  };

  useEffect(() => {
    document.title = "Kray, Inc. | Official Website";
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/png'; link.rel = 'shortcut icon'; link.href = '/favicon.png'; 
    document.getElementsByTagName('head')[0].appendChild(link);

    const browserLang = navigator.language.split('-')[0];
    if (['ko', 'ja', 'en'].includes(browserLang)) setLang(browserLang);
    else setLang('en');

    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const sectionTitleStyle = "text-3xl md:text-4xl font-medium tracking-tight leading-snug";
  const cardDescriptionStyle = "text-[15px] md:text-base leading-relaxed font-normal";
  const unifiedSmallTextStyle = "text-sm font-normal";

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden antialiased text-black">
      <style>{`
        @keyframes infinite-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-film { animation: infinite-scroll 22s linear infinite; display: flex; width: fit-content; }
      `}</style>

      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-5' : 'bg-transparent py-8'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center text-black">
          <a href="#" className="flex items-center text-black">
            <img src="/kray_logo.png" alt="Kray, Inc." className="h-12 md:h-16 w-auto object-contain" />
          </a>
          <div className="flex items-center gap-4 md:gap-10">
            <div className="hidden md:flex items-center gap-10">
              {(Object.keys(t.nav) || []).filter(k => k !== 'cta').map((key) => (
                <a key={key} href={`#${key}`} className="text-base font-medium text-gray-800 hover:text-yellow-600 transition-colors uppercase tracking-tight">{t.nav[key]}</a>
              ))}
              <div className="flex items-center bg-gray-100 p-1.5 rounded-full gap-2 ml-4 border border-gray-200">
                {['ko', 'ja', 'en'].map(l => (
                  <button key={l} onClick={() => setLang(l)} className={`px-3 py-1 rounded-full text-[10px] font-medium uppercase transition-all ${lang === l ? 'bg-black text-white' : 'text-gray-400 hover:text-black'}`}>{l}</button>
                ))}
              </div>
              <a href="#contact" className="bg-black text-white px-6 py-3 rounded-full text-base font-medium hover:bg-gray-800 transition-transform active:scale-95 text-center tracking-tight">{t.nav.cta}</a>
            </div>
            <div className="flex md:hidden items-center bg-gray-100 p-1 rounded-full gap-1 border border-gray-200 shadow-sm text-black">
              {['ko', 'ja', 'en'].map(l => (
                <button key={l} onClick={() => setLang(l)} className={`px-3 py-1 rounded-full text-[9px] font-medium uppercase transition-all ${lang === l ? 'bg-black text-white' : 'text-gray-400'}`}>{l}</button>
              ))}
            </div>
            <button className="md:hidden text-black" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center gap-8 text-center animate-in fade-in duration-300 text-black">
          <button className="absolute top-5 right-4 text-black" onClick={() => setIsMenuOpen(false)}><X size={32} /></button>
          {(Object.keys(t.nav) || []).filter(k => k !== 'cta').map((key) => (
            <a key={key} href={`#${key}`} onClick={() => setIsMenuOpen(false)} className="text-2xl font-medium uppercase text-black">{t.nav[key]}</a>
          ))}
          <a href="#contact" onClick={() => setIsMenuOpen(false)} className="bg-black text-white px-10 py-5 rounded-full text-xl font-medium">{t.nav.cta}</a>
        </div>
      )}

      {/* Hero Section */}
      <section id="about" className="relative overflow-hidden pt-48 pb-20 lg:pt-64 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left text-black">
          <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-16">
            <div className="flex-1 text-black">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-100 text-yellow-700 text-[13px] font-medium mb-8 border border-yellow-100">
                <Star size={14} fill="currentColor" /><span>{t.hero.tag}</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-medium leading-[1.1] mb-10 text-gray-950 tracking-tighter">{t.hero.title}</h1>
              <p className="text-gray-600 mb-10 leading-relaxed text-lg max-w-2xl font-normal">{t.hero.desc}</p>
            </div>
            <div className="relative w-full max-w-lg">
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-yellow-400 rounded-full opacity-20 blur-3xl animate-pulse"></div>
              <div className="relative z-10 aspect-[4/5] bg-gray-50 rounded-none overflow-hidden group">
                <img src="/sona_ceo.jpg" alt="CREATOR SONA" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-md px-5 py-3 rounded-none shadow-xl text-left border-l-4 border-yellow-500">
                  <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest mb-1 text-black">CREATOR</p>
                  <p className="text-xl font-medium text-gray-900 leading-none text-black">SONA</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Executive Summary Section */}
      <section className="bg-gray-50 py-24 lg:py-40 text-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 lg:mb-24">
            <h2 className="text-xs font-medium text-yellow-600 uppercase tracking-[0.2em] mb-6">Executive Summary</h2>
            <p className={`${sectionTitleStyle} text-gray-950`}>{t.valuesIntro.title}</p>
          </div>
          <div className="w-full max-w-5xl mx-auto mb-16 lg:mb-24 overflow-hidden rounded-none border border-gray-200 bg-white group">
            <img src="/bento_main.jpg" alt="Bento" className="w-full h-[300px] sm:h-[450px] lg:h-[600px] object-cover object-[center_38%] transition-transform duration-1000 group-hover:scale-105" />
          </div>
          <div className="grid gap-4 sm:gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {(t.values || []).map((item, idx) => (
              <div key={idx} className="bg-white px-6 py-12 border border-gray-100 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-yellow-400 flex items-center justify-center mb-8 text-black">
                  {[<UserRound size={36} />,<BarChart3 size={36} />,<ShoppingBag size={36} />,<Globe size={36} />][idx]}
                </div>
                <h3 className="text-lg font-medium text-gray-950 mb-4 tracking-tight uppercase">{item.title}</h3>
                <p className={`${cardDescriptionStyle} text-gray-500`}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Influencer Section */}
      <section id="influencer" className="py-24 lg:py-40 text-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 lg:mb-24">
            <h2 className="text-xs font-medium text-yellow-600 uppercase tracking-[0.2em] mb-6">Unrivaled Reach</h2>
            <p className={`${sectionTitleStyle} text-gray-950 uppercase`}>{t.influencerIntro.title}</p>
          </div>
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            <div className="flex-1 w-full flex justify-center">
              <div className="relative rounded-none overflow-hidden w-full max-w-[480px] aspect-[9/16] group">
                <img src="/viral_reel.jpg" alt="Viral Reel" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
              </div>
            </div>
            <div className="flex-1 w-full flex flex-col gap-12">
              <div className="text-left border-l-4 border-yellow-500 pl-8">
                <h2 className="text-2xl md:text-3xl font-medium text-gray-950 mb-6 leading-tight tracking-tight">{t.influencer.title}</h2>
                <p className="text-gray-600 leading-relaxed text-lg font-normal">{t.influencer.desc}</p>
              </div>
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
                {(t.stats || []).map((stat, idx) => (
                  <div key={idx} className="bg-white p-8 border border-gray-100 shadow-sm flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-yellow-400 flex items-center justify-center mb-8 text-black border border-yellow-500 shadow-md">
                       {[<Users size={36} />, <Eye size={36} />, <Award size={36} />, <Calendar size={36} />][idx]}
                    </div>
                    <div>
                      <p className={`${unifiedSmallTextStyle} text-gray-400 mb-3 uppercase tracking-widest`}>{stat.label}</p>
                      <p className="text-3xl font-medium text-gray-950 leading-none mb-3 tracking-tighter">{stat.value}</p>
                      <p className="text-[10px] text-yellow-600 font-medium uppercase tracking-[0.1em]">{stat.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Strategy Section */}
      <section className="bg-black text-white py-24 lg:py-40 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-12 lg:mb-20">
            <h2 className="text-[11px] font-medium text-yellow-500 uppercase tracking-[0.3em] mb-6">Content Strategy</h2>
            <h3 className={`${sectionTitleStyle} text-white mb-6`}>{t.strategy.title}</h3>
            <p className="text-gray-400 max-w-2xl mx-auto font-normal mb-16 text-base md:text-lg">{t.strategy.subtitle}</p>
            <div className="relative w-full overflow-hidden mb-20 py-6 bg-white/[0.03] border-y border-white/10">
              <div className="animate-film whitespace-nowrap">
                {[1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6].map((num, i) => (
                  <div key={i} className="inline-block px-3">
                    <div className="w-[270px] aspect-square bg-gray-900 overflow-hidden rounded-none border border-white/10 group shadow-2xl">
                      <img src={`/slide0${num}.jpg`} alt={`Slide ${num}`} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="grid gap-8 grid-cols-1 md:grid-cols-3">
            {(t.strategy.steps || []).map((item, idx) => (
              <div key={idx} className="relative group p-10 border border-white/20 hover:border-yellow-400/50 bg-white/[0.03] transition-all duration-500 text-left">
                <span className="text-7xl font-medium text-yellow-400/10 absolute top-4 right-4 pointer-events-none">0{idx+1}</span>
                <h3 className="text-xl md:text-2xl font-medium text-yellow-400 mb-6 flex items-center gap-4 uppercase tracking-tight">
                  <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full"></span>{item.title}
                </h3>
                <p className={`${unifiedSmallTextStyle} text-gray-400`}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Lineup Section */}
      <section id="products" className="py-24 lg:py-40 text-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-black">
          <div className="text-center mb-16 lg:mb-20">
            <h2 className="text-xs font-medium text-yellow-600 uppercase tracking-[0.2em] mb-6">Product Lineup</h2>
            <p className={`${sectionTitleStyle} text-gray-950`}>{t.products.title}</p>
          </div>
          <div className="grid gap-8 lg:gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {(t.products.items || []).map((p, idx) => (
              <div key={idx} className="flex flex-col">
                <div className="group flex flex-col hover:shadow-2xl transition-all h-full bg-white border border-gray-100 rounded-none overflow-hidden relative text-left">
                  <div className="w-full aspect-[4/5] bg-gray-50 flex items-center justify-center overflow-hidden relative">
                    <img src={[`/produc01_thum.jpg`, `/produc02_thum.jpg`, `/produc03_thum.jpg`][idx]} alt={p.title} className={`w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 ${idx === 2 ? 'grayscale-100 opacity-40 contrast-150' : ''}`} />
                  </div>
                  <div className="px-8 pt-3 pb-5 flex flex-col h-full">
                    <div className="mb-2 min-h-[18px]">
                      <span className={`px-3 py-0.5 text-[10px] font-medium uppercase tracking-widest shadow-sm text-white ${idx === 0 ? 'bg-orange-500' : idx === 1 ? 'bg-blue-600' : 'bg-gray-400'}`}>{p.badge}</span>
                    </div>
                    <h3 className="text-lg md:text-xl font-medium text-gray-950 mb-6 tracking-tight uppercase">{p.title}</h3>
                    <p className={`${cardDescriptionStyle} text-gray-600 mb-2 leading-tight flex-grow`}>{p.desc}</p>
                    <div className="flex flex-col gap-1 mb-10 border-t border-gray-50 pt-2">
                      {(p.features || []).map((f, i) => (
                        <div key={i} className="flex items-center gap-2.5 text-black">
                          <CheckCircle2 size={13} className={`${idx === 2 ? 'text-gray-300' : 'text-yellow-600'} shrink-0`} />
                          <span className={unifiedSmallTextStyle}>{f}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-auto"><PurchaseIcons lang={lang} naverUrl={p.urls.naver} amazonUrl={p.urls.amazon} rakutenUrl={p.urls.rakuten} /></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section id="roadmap" className="py-24 lg:py-40 text-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-20 text-black">
            <h2 className="text-xs font-medium text-yellow-600 uppercase tracking-[0.2em] mb-6">Brand Roadmap</h2>
            <p className={`${sectionTitleStyle} text-gray-950`}>{t.roadmapIntro.title}</p>
          </div>
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {(t.roadmap || []).map((item, idx) => (
              <div key={idx} className="relative bg-white px-8 py-12 border border-gray-100 hover:shadow-xl transition-all text-left flex flex-col min-h-[220px]">
                <p className="text-lg font-medium text-yellow-600 mb-4 tracking-tighter uppercase">{item.year}</p>
                <h4 className="text-lg font-medium text-gray-950 mb-4 tracking-tight leading-tight flex-grow">{item.title}</h4>
                <p className={`${unifiedSmallTextStyle} text-gray-500 leading-relaxed`}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="bg-black text-white pt-32 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-4xl lg:text-6xl font-medium mb-10 uppercase italic tracking-tighter">CONNECT US</h2>
          <div className="text-gray-400 mb-16 leading-relaxed text-lg md:text-xl font-normal opacity-90">{t.contact.desc}</div>
          <div className="flex justify-center text-white">
            <div className="flex flex-col items-center gap-6 group cursor-default">
              <div className="w-20 h-20 bg-white/5 flex items-center justify-center group-hover:bg-yellow-400 group-hover:text-black transition-all duration-500 mb-4 text-white">
                <Mail size={36} strokeWidth={1.5} />
              </div>
              <div className="text-center text-white">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-[0.3em] mb-3">Email Inquiry</p>
                <p className="text-2xl md:text-3xl font-medium tracking-tight group-hover:text-yellow-400 transition-colors">business@krayinc.com</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-24 text-center border-t border-white/10 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <img src="/kray_logo.png" alt="Kray, Inc." className="h-12 md:h-16 w-auto invert mx-auto mb-10" />
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-10 text-white">
            <button onClick={() => openModal('privacy')} className="text-[11px] md:text-xs text-zinc-500 hover:text-white uppercase tracking-wider">{t.legal.privacy}</button>
            <button onClick={() => openModal('terms')} className="text-[11px] md:text-xs text-zinc-500 hover:text-white uppercase tracking-wider">{t.legal.terms}</button>
            <button onClick={() => openModal('notices')} className="text-[11px] md:text-xs text-zinc-500 hover:text-white uppercase tracking-wider">{t.legal.notices}</button>
          </div>
          <p className="text-[11px] md:text-xs text-zinc-600 font-normal uppercase tracking-[0.2em] leading-loose">
            © 2024 Kray, Inc. All rights reserved. <br className="sm:hidden" /> Established 2024.07 (Japan)
          </p>
        </div>
      </footer>

      <LegalModal isOpen={!!modalType} title={modalTitle} content={modalContent} onClose={() => setModalType(null)} />
    </div>
  );
};

export default App;