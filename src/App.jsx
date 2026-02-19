import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  Instagram, 
  Youtube, 
  ArrowRight, 
  BarChart3, 
  Globe, 
  Users, 
  ShoppingBag, 
  CheckCircle2, 
  Star, 
  Heart,
  Mail, 
  PlayCircle,
  ExternalLink,
  ShoppingCart,
  TrendingUp,
  Eye,
  Calendar,
  Award,
  UserRound
} from 'lucide-react';

// 구매 버튼 헬퍼 컴포넌트 (스토어 주소는 여기서 수정하세요)
const PurchaseIcons = ({ lang, disabled }) => {
  const disabledClass = "flex items-center gap-2 bg-gray-100 text-gray-400 border border-gray-200 px-4 py-2 w-full justify-center rounded-none cursor-not-allowed pointer-events-none";
  
  if (lang === 'ko') {
    if (disabled) {
      return (
        <div className={disabledClass}>
          <ShoppingCart size={16} />
          <span className="text-[11px] font-black uppercase tracking-wider">네이버 스마트스토어</span>
        </div>
      );
    }
    return (
      /* 🔗 [한국어] 아래 href="#" 부분의 #을 지우고 네이버 스마트스토어 주소를 넣으세요 */
      <a href="#" className="flex items-center gap-2 bg-[#03C75A] text-white px-4 py-2 hover:bg-[#02b351] transition-colors w-full justify-center rounded-none">
        <ShoppingCart size={16} />
        <span className="text-[11px] font-black uppercase tracking-wider">네이버 스마트스토어</span>
      </a>
    );
  }

  if (lang === 'ja') {
    if (disabled) {
      return (
        <div className="flex gap-1 w-full text-black">
          <div className="flex-1 flex items-center gap-2 bg-gray-100 text-gray-400 border border-gray-200 px-1 py-2 justify-center rounded-none cursor-not-allowed text-black">
            <span className="text-[10px] font-black uppercase tracking-tighter text-gray-400">AmazonJP</span>
          </div>
          <div className="flex-1 flex items-center gap-2 bg-gray-100 text-gray-400 border border-gray-200 px-1 py-2 justify-center rounded-none cursor-not-allowed text-black">
            <span className="text-[10px] font-black uppercase tracking-tighter text-gray-400">楽天市場</span>
          </div>
        </div>
      );
    }
    return (
      <div className="flex gap-1 w-full text-black">
        {/* 🔗 [일본어] 아래 href="#" 부분의 #을 지우고 아마존 재팬 주소를 넣으세요 */}
        <a href="#" className="flex-1 flex items-center gap-2 bg-[#FF9900] text-black px-1 py-2 hover:bg-[#e68a00] transition-colors justify-center rounded-none">
          <span className="text-[10px] font-black uppercase tracking-tighter">AmazonJP</span>
        </a>
        {/* 🔗 [일본어] 아래 href="#" 부분의 #을 지우고 라쿠텐 주소를 넣으세요 */}
        <a href="#" className="flex-1 flex items-center gap-2 bg-[#BF0000] text-white px-1 py-2 hover:bg-[#a60000] transition-colors justify-center rounded-none">
          <span className="text-[10px] font-black uppercase tracking-tighter">楽天市場</span>
        </a>
      </div>
    );
  }

  if (lang === 'en') {
    if (disabled) {
      return (
        <div className={disabledClass}>
          <span className="text-[11px] font-black uppercase tracking-wider text-gray-400">Amazon US</span>
        </div>
      );
    }
    return (
      /* 🔗 [영어] 아래 href="#" 부분의 #을 지우고 아마존 미국 주소를 넣으세요 */
      <a href="#" className="flex items-center gap-2 bg-[#FF9900] text-black px-4 py-2 hover:bg-[#e68a00] transition-colors w-full justify-center rounded-none">
        <span className="text-[11px] font-black uppercase tracking-wider">Amazon US</span>
      </a>
    );
  }
  return null;
};

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lang, setLang] = useState('ko');
  const [focusedImage, setFocusedImage] = useState('right');

  const translations = {
    ko: {
      nav: { about: '소개', influencer: '인플루언서', products: '제품', roadmap: '로드맵', cta: '문의하기' },
      hero: {
        tag: "영향력이 성과로 이어지는 에코시스템",
        title: <>콘텐츠로 세상의 <br /><span className="text-yellow-500 underline decoration-black underline-offset-8">취향을 잇다</span></>,
        desc: "Kray는 단순한 인플루언서 마케팅을 넘어 실질적인 판매 실적과 브랜드 자산을 구축하는 '콘텐츠 커머스' 기업입니다. 일본 현지의 도시락 문화를 한국적 감성으로 재해석하여 한일 양국에 새로운 라이프스타일을 제안합니다."
      },
      valuesIntro: { tag: "Executive Summary", title: "품격 있는 콘텐츠로 마음을 잇다" },
      values: [
        { title: "인플루언서 기반 경영", desc: "요리·도시락에 특화된 인플루언서 CEO 경영" },
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
      influencerIntro: { tag: "Unrivaled Reach", title: "1억 재생수가 증명하는 파급력" },
      influencer: {
        title: "압도적 파급력의 콘텐츠 파워",
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
      brand: { tag: "Our Brand Identity", title: "식탁과 요리에 즐거움 1큰술 더하기" },
      products: {
        tag: "Product Lineup",
        title: "SONA 가 프로듀스한 자사 상품 라인업",
        footnote: "※ 도시락 데코레이션 카테고리 부문",
        p1: {
          title: "별·하트 계란말이 틀",
          desc: "틀에 넣는 것만으로 누구나 예쁜 모양 완성! 초보자의 Pain Point를 해결한 아이템.",
          badge: "아마존 재팬 베스트셀러 1위! (※)",
          features: ["한/일/중 디자인 등록", "누적 리뷰 고평가"]
        },
        p2: {
          title: "별란스틱",
          desc: "가벼운 힘으로 매끄러운 계란물을 제조! 알끈 제거 기능까지 포함된 프리미엄 도구.",
          badge: "New Release",
          features: ["18-8 스테인리스 소재", "폭신한 계란말이 최적화"]
        },
        p3: {
          title: "트리플 팬 (출시 예정)",
          desc: "세 가지 요리를 동시에! SONA 에디션 신규 컬러 2종과 전용 뒤집개 세트 상품!",
          badge: "Coming Soon",
          features: ["SONA Edition", "3구 동시 조리 시스템"]
        }
      },
      roadmapIntro: { tag: "Brand Roadmap", title: "지속 가능한 브랜드로 성장하는 과정" },
      roadmap: [
        { year: "2024.02", title: "별·하트 계란말이 틀 출시", desc: "별/하트 모양 프로듀스" },
        { year: "2024.05", title: "도시락 레시피 출간", desc: "한국어판 정식 발행" },
        { year: "2025.07", title: "별란스틱 출시", desc: "본격적인 라인업 확장" },
        { year: "2026.05", title: "트리플 팬 출시 예정", desc: "자사 브랜드 입지 강화" },
      ],
      contact: {
        title: "CONNECT US",
        desc: "Kray와 함께 새로운 콘텐츠 커머스의 미래를 만들어갈 비즈니스 파트너를 기다립니다. 협업 제안 및 문의는 아래 메일로 연락 부탁드립니다."
      }
    },
    ja: {
      nav: { about: '紹介', influencer: 'インフルエンサー', products: '製品', roadmap: 'ロードマップ', cta: 'お問い合わせ' },
      hero: {
        tag: "影響力が成果に繋がるエコシステム",
        title: <>コンテンツで世界の<br /><span className="text-yellow-500 underline decoration-black underline-offset-8">「好み」を繋ぐ</span></>,
        desc: "Krayは単なるインフルエンサーマーケティングを越え、実質的な販売実績とブランド資産を構築する「コンテンツコマース」企業です。日本現地のお弁当文化を韓国的な感性で再解釈し、日韓両国に新しいライフスタイルを提案します。"
      },
      valuesIntro: { tag: "Executive Summary", title: "高品質なコンテンツで心を繋ぐ" },
      values: [
        { title: "インフルエンサー経営", desc: "料理・お弁当特化型クリエイターによる経営" },
        { title: "圧倒的なコンテンツ拡散力", desc: "圧倒的なコンテンツ拡散力とリーチ力" },
        { title: "マーケット適合の商品企画", desc: "市場ニーズを的적하게捉えた最適な商品開発" },
        { title: "日韓トレンドの架け橋", desc: "韓国の感性と日本製造技術の融合" },
      ],
      stats: [
        { label: "フォロワー数", value: "13.3万人", sub: "Instagram Audience" },
        { label: "リール累計再生", value: "1億超え", sub: "Short-form Impact" },
        { label: "最多再生回数", value: "1,722万回", sub: "星のキンパ動画" },
        { label: "投稿頻度", value: "週4〜5回", sub: "継続的な発信" },
      ],
      influencerIntro: { tag: "Unrivaled Reach", title: "1億再生回数が証明する波及力" },
      influencer: {
        title: "圧倒的な波及力のコンテンツパワー",
        desc: "日本在住の韓国人インフルエンサー「SONA」は、現地で経験したお弁当文化を独自の感性で再解釈し、世界中の視聴者を魅了しました。単なる動画を超え、「私にもできる」という確信を与えるチュートリアルを提供しています。"
      },
      strategy: {
        title: "Content Strategy: '魅せる & 教える'",
        subtitle: "目を引くビジュアル + 直感的なチュートリアル = 自然な購買への繋がり",
        steps: [
          { title: "Visual (魅せる)", desc: "可愛いお弁当やセンス溢れる料理が画面を圧倒します。" },
          { title: "Process (教える)", desc: "分かりやすい動画で、誰でも作れるという自信を与えます。" },
          { title: "Action (買う)", desc: "自然な購買導線で、実際の購入と共有を誘導します。" },
        ]
      },
      brand: { tag: "Brand Identity", title: "食卓と料理に楽しさ大さじ1杯を加える" },
      products: {
        tag: "Product Lineup",
        title: "SONAがプロデュースした自社商品ラインナップ",
        footnote: "※弁当デコレーションカテゴリー部門",
        p1: {
          title: "星・ハートの卵焼き型",
          desc: "型に入れるだけで誰でも可愛い形が完成します！お弁当初心者の悩みを解決する画期的なアイテムです。",
          badge: "Amazon JP 売れ筋ランキング1位! (※)",
          features: ["日・韓・中にて意匠登録済", "お客様からの高い評価"]
        },
        p2: {
          title: "星の卵とき",
          desc: "軽い力でなめらかな溶き卵が作れるプレミアム調理器具です。",
          badge: "New Release",
          features: ["18-8ステンレス素材", "ふわふわ卵焼きに最適化"]
        },
        p3: {
          title: "トリプルパン (予定)",
          desc: "3品同時に！SONAエディションの新色2種と専用터너가 세트로 발매!",
          badge: "Coming Soon",
          features: ["SONA Edition", "3口同時調理システム"]
        }
      },
      roadmapIntro: { tag: "Brand Roadmap", title: "持続可能なブランドへと成長する軌跡" },
      roadmap: [
        { year: "2024.02", title: "星・ハートの卵焼き型 発売", desc: "星・ハート型プロデュース" },
        { year: "2024.05", title: "レシピ本出版", desc: "韓国にてベストセラー" },
        { year: "2025.07", title: "星の卵とき 発売", desc: "ラインアップの拡充" },
        { year: "2026.05", title: "トリプルパン 発売予定", desc: "自社ブランドの強化" },
      ],
      contact: {
        title: "CONNECT US",
        desc: "Krayと共に新しいコンテンツコマースの未来를 創るパートナー를 募集しています。提携のご提案やお問い合わせは、下記のメールアドレスまでご連絡ください。"
      }
    },
    en: {
      nav: { about: 'About', influencer: 'Influencer', products: 'Products', roadmap: 'Roadmap', cta: 'Contact Us' },
      hero: {
        tag: "Ecosystem Where Influence Leads to Results",
        title: <>Connecting <br /><span className="text-yellow-500 underline decoration-black underline-offset-8">Global Tastes</span> with Content</>,
        desc: "Kray is a 'Content Commerce' company that builds brand assets and actual sales records beyond simple influencer marketing. We propose a new lifestyle by reinterpreting Japanese bento culture with Korean sensibilities."
      },
      valuesIntro: { tag: "Executive Summary", title: "Connecting Hearts with Quality Content" },
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
        title: "Unrivaled Influence of Content Power",
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
      brand: { tag: "Our Brand Identity", title: "Adding a Tablespoon of Joy to Your Table and Cooking" },
      products: {
        tag: "Product Lineup",
        title: "Proprietary Product Lineup Produced by SONA",
        footnote: "* Bento Decoration Category",
        p1: {
          title: "Star & Heart-shaped Egg Roll Mold",
          desc: "Perfect shapes just by putting eggs in the mold! Solves bento beginners' pain points.",
          badge: "Amazon JP Best Seller #1 (*)",
          features: ["Design Registered", "Highly Rated by Users"]
        },
        p2: {
          title: "Star-shaped Egg Beater Stick",
          desc: "Make smooth beaten eggs with light force. Premium tool with egg-spot removal.",
          badge: "New Release",
          features: ["18-8 Stainless Steel", "Fluffy egg roll optimized"]
        },
        p3: {
          title: "Triple Pan",
          desc: "Three dishes at once! SONA Edition with 2 new colors and a dedicated spatula set!",
          badge: "Coming Soon",
          features: ["SONA Edition", "Simultaneous 3-dish system"]
        }
      },
      roadmapIntro: { tag: "Brand Roadmap", title: "Journey of Growing into a Sustainable Brand" },
      roadmap: [
        { year: "2024.02", title: "Star & Heart-shaped Egg Roll Mold Launch", desc: "Star & Heart Series" },
        { year: "2024.05", title: "Recipe Book", desc: "Published in Korea" },
        { year: "2025.07", title: "Star-shaped Egg Beater Stick Launch", desc: "Lineup Expansion" },
        { year: "2026.05", title: "Triple Pan Launch", desc: "Planned release" },
      ],
      contact: {
        title: "CONNECT US",
        desc: "We look forward to business partners creating the future of content commerce with Kray. For collaboration inquiries, please contact us via the email below."
      }
    }
  };

  const t = translations[lang] || translations.en;

  useEffect(() => {
    const browserLang = navigator.language.split('-')[0];
    if (['ko', 'ja', 'en'].includes(browserLang)) setLang(browserLang);
    else setLang('en');

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-black overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <a href="#" className="flex items-center">
              <img src="/kray_logo.png" alt="Kray Inc." className="h-8 w-auto object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
              <span className="text-xl font-black tracking-tighter leading-none uppercase md:hidden block ml-2">Kray</span>
            </a>
          </div>
          <div className="hidden md:flex items-center gap-6">
            {(Object.keys(t.nav) || []).filter(k => k !== 'cta').map((key) => (
              <a key={key} href={`#${key}`} className="text-xs font-bold hover:text-yellow-600 transition-colors uppercase">{t.nav[key]}</a>
            ))}
            <div className="flex items-center bg-gray-100 p-1 rounded-full gap-1 ml-2 border border-gray-200">
              {['ko', 'ja', 'en'].map(l => (
                <button key={l} onClick={() => setLang(l)} className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase transition-all ${lang === l ? 'bg-black text-white' : 'text-gray-400 hover:text-black'}`}>{l}</button>
              ))}
            </div>
            <a href="#contact" className="bg-black text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-gray-800 transition-transform active:scale-95 text-center">{t.nav.cta}</a>
          </div>
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center gap-8 text-center animate-in fade-in duration-300">
          <button className="absolute top-5 right-4" onClick={() => setIsMenuOpen(false)}><X size={24} /></button>
          {(Object.keys(t.nav) || []).filter(k => k !== 'cta').map((key) => (
            <a key={key} href={`#${key}`} onClick={() => setIsMenuOpen(false)} className="text-2xl font-black uppercase">{t.nav[key]}</a>
          ))}
          <a href="#contact" onClick={() => setIsMenuOpen(false)} className="bg-black text-white px-8 py-4 rounded-full text-lg font-bold">{t.nav.cta}</a>
        </div>
      )}

      {/* Hero Section */}
      <section id="about" className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-black mb-6">
                <Star size={14} fill="currentColor" /><span>{t.hero.tag}</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black leading-tight mb-8">{t.hero.title}</h1>
              <p className="text-gray-600 mb-10 leading-relaxed text-lg max-w-2xl">{t.hero.desc}</p>
            </div>
            <div className="relative w-full max-w-lg">
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-yellow-400 rounded-full opacity-20 blur-3xl animate-pulse"></div>
              <div className="relative z-10 aspect-[4/5] bg-gray-100 rounded-none overflow-hidden shadow-2xl border border-gray-100 group">
                <img 
                  src="/sona_ceo.jpg" 
                  alt="CEO SONA" 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/600x800?text=CEO+SONA'; }} 
                />
                <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-none shadow-lg text-left">
                  <p className="text-[9px] font-black text-gray-400 uppercase mb-0.5">Creator & CEO</p>
                  <p className="text-lg font-black text-black leading-none">SONA</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Executive Summary Section */}
      <section className="bg-gray-50 py-24 lg:py-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 lg:mb-20">
            <h2 className="text-sm font-black text-yellow-600 uppercase tracking-widest mb-4">{t.valuesIntro.tag}</h2>
            <p className="text-3xl lg:text-4xl font-black italic tracking-tighter">{t.valuesIntro.title}</p>
          </div>

          <div className="w-full max-w-5xl mx-auto mb-16 lg:mb-24 overflow-hidden rounded-none shadow-2xl border border-gray-200 bg-white group">
            <img 
              src="/bento_main.jpg" 
              alt="Bento" 
              className="w-full h-[300px] sm:h-[450px] lg:h-[550px] object-cover transition-transform duration-1000 group-hover:scale-105"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/1200x600?text=Bento+Main'; }}
            />
          </div>

          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(t.values || []).map((item, idx) => (
              <div key={idx} className="bg-white px-4 py-10 sm:px-5 rounded-none hover:shadow-lg transition-all border border-gray-100 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-yellow-400 rounded-none flex items-center justify-center mb-8 text-black shadow-sm shrink-0">
                  {[<UserRound size={48} strokeWidth={1.5} />, <BarChart3 size={48} strokeWidth={1.5} />, <ShoppingBag size={48} strokeWidth={1.5} />, <Globe size={48} strokeWidth={1.5} />][idx]}
                </div>
                <h3 className={`${lang === 'ko' ? 'text-lg' : 'text-[14px] sm:text-[15px]'} font-black mb-3 tracking-tighter whitespace-nowrap w-full uppercase`}>
                  {item.title}
                </h3>
                <p className="text-gray-500 text-[11px] sm:text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Influencer Impact Section */}
      <section id="influencer" className="py-24 lg:py-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-black">
          <div className="text-center mb-16 lg:mb-24">
            <h2 className="text-sm font-black text-yellow-600 uppercase tracking-widest mb-4">{t.influencerIntro.tag}</h2>
            <p className="text-3xl lg:text-5xl font-black italic tracking-tighter uppercase">{t.influencerIntro.title}</p>
          </div>
          
          <div className="flex flex-col lg:flex-row items-start gap-16 lg:gap-24">
            <div className="flex-1 w-full flex justify-center items-center relative min-h-[400px] sm:min-h-[600px]">
              {/* Profile Image (Left) */}
              <div 
                onClick={() => setFocusedImage('left')}
                className={`relative bg-white rounded-none shadow-2xl border-[8px] border-gray-900 overflow-hidden -translate-x-10 translate-y-6 hover:scale-105 transition-all duration-500 cursor-pointer w-[160px] sm:w-[280px] aspect-[9/18.5] ${focusedImage === 'left' ? 'z-30' : 'z-10 opacity-80'}`}
              >
                <img src="/profile_sona.jpg" alt="Profile" className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://via.placeholder.com/400x800?text=Profile'; }} />
              </div>
              
              {/* Viral Reel (Right) */}
              <div 
                onClick={() => setFocusedImage('right')}
                className={`absolute bg-black rounded-none shadow-2xl border-[8px] border-gray-900 overflow-hidden translate-x-10 -translate-y-6 hover:scale-105 transition-all duration-500 group cursor-pointer w-[160px] sm:w-[280px] aspect-[9/18.5] ${focusedImage === 'right' ? 'z-30' : 'z-10 opacity-80'}`}
              >
                <img src="/viral_reel.jpg" alt="Viral Reel" className="absolute inset-0 w-full h-full object-cover opacity-90 transition-opacity group-hover:opacity-100" onError={(e) => { e.target.src = 'https://via.placeholder.com/400x800?text=Viral+Reel'; }} />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <PlayCircle className="text-white fill-white/20 animate-pulse" size={48} />
                </div>
              </div>
            </div>

            <div className="flex-1 w-full flex flex-col gap-12">
              <div className="text-left border-l-4 border-yellow-400 pl-6">
                <h2 className="text-lg lg:text-2xl font-bold mb-6 leading-tight tracking-tight text-black">
                  {t.influencer.title}
                </h2>
                <p className="text-gray-600 leading-relaxed text-lg max-w-xl">{t.influencer.desc}</p>
              </div>
              
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
                {(t.stats || []).map((stat, idx) => (
                  <div key={idx} className="bg-white p-6 sm:p-8 rounded-none border-2 border-gray-100 shadow-sm hover:shadow-xl hover:border-yellow-400 transition-all group flex flex-col gap-4 text-black">
                    <div className="flex items-center justify-between">
                       <div className="p-3 bg-gray-50 group-hover:bg-yellow-100 transition-colors rounded-none">
                         {[<Users size={20} />, <Eye size={20} />, <Award size={20} />, <Calendar size={20} />][idx]}
                       </div>
                       <TrendingUp className="text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-[0.2em]">{stat.label}</p>
                      <p className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-none mb-2 tracking-tighter whitespace-nowrap">
                        {stat.value}
                      </p>
                      <p className="text-[9px] text-yellow-600 font-bold uppercase tracking-widest">{stat.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-start">
                 <a 
                  href="https://www.instagram.com/sona_tokyolife/" 
                  target="_blank" 
                  className="flex items-center gap-3 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white px-8 py-4 font-black hover:opacity-90 transition-all uppercase tracking-widest text-sm rounded-none shadow-lg"
                 >
                   <Instagram size={20} /> @sona_tokyolife
                 </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Strategy Section */}
      <section className="bg-black text-white py-24 lg:py-40 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-12 lg:mb-20">
            <h2 className="text-xs font-black text-yellow-400 uppercase tracking-widest mb-4">Content Strategy</h2>
            <h3 className="text-2xl lg:text-4xl font-black italic tracking-tighter mb-4 text-white">{t.strategy.title}</h3>
            <p className="text-gray-400 max-w-2xl mx-auto font-medium mb-12 text-xs sm:text-sm">{t.strategy.subtitle}</p>
            <div className="w-full max-w-5xl mx-auto rounded-none overflow-hidden shadow-2xl border border-white/10 group bg-white/5">
              <img 
                src="/content_strategy.jpg" 
                alt="Strategy" 
                className="w-full h-auto object-cover group-hover:scale-[1.01] transition-transform duration-700" 
                onError={(e) => { e.target.src = 'https://via.placeholder.com/1200x400?text=Content+Strategy'; }}
              />
            </div>
          </div>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            {(t.strategy.steps || []).map((item, idx) => (
              <div key={idx} className="relative group p-8 rounded-none border border-white/10 hover:bg-white/5 transition-all text-left text-white">
                <span className="text-5xl font-black text-white/5 absolute top-4 right-6 pointer-events-none">0{idx+1}</span>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-3 text-white"><span className="w-2 h-2 bg-yellow-400 rounded-full"></span>{item.title}</h3>
                <p className="text-gray-400 leading-relaxed text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Identity Section */}
      <section className="bg-gray-50 border-y border-gray-100 py-20 lg:py-48">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <div className="mb-12 text-black">
            <h2 className="text-sm font-black text-yellow-600 uppercase tracking-widest mb-4">{t.brand.tag}</h2>
            <p className="text-3xl lg:text-4xl font-black italic tracking-tighter max-w-4xl">{t.brand.title}</p>
          </div>
          <div className="w-full max-w-[240px] sm:max-w-sm group transition-transform duration-500 hover:scale-105">
             <img 
              src="/sonaandtokyo-logo.png" 
              alt="SONA AND TOKYO Logo" 
              className="w-full h-auto object-contain drop-shadow-xl" 
              onError={(e) => { e.target.src = 'https://via.placeholder.com/600x200?text=BRAND+LOGO'; }}
             />
          </div>
        </div>
      </section>

      {/* Product Lineup Section */}
      <section id="products" className="py-24 lg:py-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 lg:mb-20 text-black">
            <h2 className="text-sm font-black text-yellow-600 uppercase tracking-widest mb-4">Product Lineup</h2>
            <p className="text-3xl lg:text-4xl font-black italic tracking-tighter">{t.products.title}</p>
          </div>
          <div className="grid gap-10 lg:gap-12 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[t.products.p1, t.products.p2, t.products.p3].map((p, idx) => (
              <div key={idx} className="group flex flex-col hover:shadow-2xl transition-all h-full bg-white border border-gray-100 rounded-none overflow-hidden text-left relative text-black">
                <div className="w-full aspect-[4/5] bg-gray-50 flex items-center justify-center overflow-hidden relative">
                  <img 
                    src={[`/produc01_thum.jpg`, `/produc02_thum.jpg`, `/produc03_thum.jpg`][idx]} 
                    alt={p.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/600x800?text=Product'; }}
                  />
                  <div className="absolute top-4 left-4 z-10"><span className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest text-white shadow-lg ${idx === 0 ? 'bg-yellow-600' : idx === 1 ? 'bg-blue-600' : 'bg-gray-400'}`}>{p.badge}</span></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>
                </div>
                <div className="px-6 pt-10 pb-10 sm:px-7 flex flex-col h-full">
                  <h3 className={`${lang === 'en' ? 'text-[15.5px] tracking-tighter' : 'text-2xl tracking-tight'} font-black mb-4 leading-tight uppercase min-h-[1.2em]`}>{p.title}</h3>
                  <p className="text-gray-500 text-sm mb-8 leading-relaxed flex-grow">{p.desc}</p>
                  <div className="flex flex-col gap-3 mb-10">
                    {(p.features || []).map((f, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs font-bold text-black"><CheckCircle2 size={16} className={`${idx === 2 ? 'text-gray-300' : 'text-yellow-500'} shrink-0`} /><span className="tracking-tight">{f}</span></div>
                    ))}
                  </div>
                  <div className="mt-auto"><PurchaseIcons lang={lang} disabled={idx === 2} /></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-left max-w-7xl mx-auto px-2 text-gray-400"><p className="text-[10px] font-bold italic tracking-tighter">{t.products.footnote}</p></div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section id="roadmap" className="bg-gray-50 border-t border-gray-100 py-24 lg:py-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-black">
          <div className="mb-16 lg:mb-20">
            <h2 className="text-sm font-black text-yellow-600 uppercase tracking-widest mb-4">Brand Roadmap</h2>
            <p className="text-3xl lg:text-4xl font-black italic tracking-tighter text-black">{t.roadmapIntro.title}</p>
          </div>
          <div className="relative">
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-px bg-gray-200 -translate-y-1/2"></div>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {(t.roadmap || []).map((item, idx) => (
                <div key={idx} className="relative bg-white px-5 py-8 sm:px-6 rounded-none border border-gray-100 hover:shadow-xl transition-all text-left h-full flex flex-col text-black">
                  <div className="hidden lg:block absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-yellow-400 rounded-none shadow-sm z-10"></div>
                  <p className="text-xs font-black text-yellow-600 mb-2 tracking-tighter">{item.year}</p>
                  <h4 className={`${lang === 'en' ? 'text-[14px] leading-tight' : 'text-lg leading-none'} font-black mb-3 tracking-tighter text-black break-words min-h-[3.5em] flex items-center`}>
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-gray-500 font-medium leading-relaxed mt-auto text-black">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="bg-black text-white pt-24 pb-12 lg:pt-40 lg:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-black mb-8 uppercase italic tracking-tighter text-white">CONNECT US</h2>
            <p className="text-gray-400 mb-12 leading-relaxed text-sm sm:text-lg">{t.contact.desc}</p>
            
            <div className="flex justify-center">
              <div className="flex flex-col items-center gap-4 group cursor-default">
                <div className="w-16 h-16 rounded-none bg-white/10 flex items-center justify-center group-hover:bg-yellow-400 group-hover:text-black transition-all mb-4 text-white">
                  <Mail size={32} />
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Email Inquiry</p>
                  <p className="text-xl sm:text-2xl font-black drop-shadow-sm group-hover:text-yellow-400 transition-colors text-white">business@krayinc.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-16 text-center border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-black">
          <div className="flex flex-col items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="p-1">
                <img src="/kray_logo.png" alt="Kray Inc." className="h-6 w-auto invert brightness-100" onError={(e) => { e.target.style.display = 'none'; }} />
              </div>
              <div className="h-4 w-[1px] bg-white/20 mx-1"></div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Inc.</span>
            </div>
            
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest leading-loose text-center">
              © 2025 Kray, Inc. All rights reserved. <br className="sm:hidden" /> Established 2025.07 (Japan)
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;