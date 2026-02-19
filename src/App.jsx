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

/**
 * 구매 버튼 헬퍼 컴포넌트
 * @param {string} lang - 현재 선택된 언어
 * @param {number} productIndex - 제품 번호 (0: 틀, 1: 스틱, 2: 팬)
 */
const PurchaseIcons = ({ lang, productIndex }) => {
  const disabledClass = "flex items-center gap-2 bg-gray-100 text-gray-400 border border-gray-200 px-4 py-2 w-full justify-center rounded-none cursor-not-allowed pointer-events-none";
  
  // 제품별 링크 설정
  const links = [
    { // 0: 별하트 계란말이 틀
      naver: "https://mkt.shopping.naver.com/link/68f668bf309bbc4b1c8000cb",
      amazon: "https://www.amazon.co.jp/gp/product/B0CVNG3VPT/",
      rakuten: null // 비활성화
    },
    { // 1: 별란스틱
      naver: "https://mkt.shopping.naver.com/link/68f668bfdb0ddd370ee27b0a",
      amazon: "https://www.amazon.co.jp/gp/product/B0FJLHR5D3/",
      rakuten: null // 비활성화
    },
    { // 2: 트리플 팬 (출시 예정)
      naver: null,
      amazon: null,
      rakuten: null
    }
  ];

  const currentLinks = links[productIndex];

  if (lang === 'ko') {
    if (!currentLinks.naver) return <div className={disabledClass}><ShoppingCart size={16} /><span className="text-[11px] font-black uppercase tracking-wider text-gray-400">네이버 스마트스토어</span></div>;
    return (
      <a href={currentLinks.naver} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#03C75A] text-white px-4 py-2 hover:bg-[#02b351] transition-colors w-full justify-center rounded-none">
        <ShoppingCart size={16} />
        <span className="text-[11px] font-black uppercase tracking-wider">네이버 스마트스토어</span>
      </a>
    );
  }

  if (lang === 'ja') {
    return (
      <div className="flex gap-1 w-full text-black">
        {/* 아마존 JP 버튼 */}
        {currentLinks.amazon ? (
          <a href={currentLinks.amazon} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center gap-2 bg-[#FF9900] text-black px-1 py-2 hover:bg-[#e68a00] transition-colors justify-center rounded-none">
            <span className="text-[10px] font-black uppercase tracking-tighter">AmazonJP</span>
          </a>
        ) : (
          <div className="flex-1 flex items-center gap-2 bg-gray-100 text-gray-400 border border-gray-200 px-1 py-2 justify-center rounded-none cursor-not-allowed">
            <span className="text-[10px] font-black uppercase tracking-tighter">AmazonJP</span>
          </div>
        )}
        
        {/* 라쿠텐 버튼 (현재 모두 비활성화) */}
        {currentLinks.rakuten ? (
          <a href={currentLinks.rakuten} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center gap-2 bg-[#BF0000] text-white px-1 py-2 hover:bg-[#a60000] transition-colors justify-center rounded-none text-white">
            <span className="text-[10px] font-black uppercase tracking-tighter">楽天市場</span>
          </a>
        ) : (
          <div className="flex-1 flex items-center gap-2 bg-gray-100 text-gray-400 border border-gray-200 px-1 py-2 justify-center rounded-none cursor-not-allowed">
            <span className="text-[10px] font-black uppercase tracking-tighter">楽天市場</span>
          </div>
        )}
      </div>
    );
  }

  if (lang === 'en') {
    // 영어는 아마존 JP가 아닌 미국 아마존 등을 상정하여 일단 아마존 버튼 1개만 표시 (링크 없을 시 비활성화)
    if (!currentLinks.amazon) return <div className={disabledClass}><span className="text-[11px] font-black uppercase tracking-wider text-gray-400">Amazon US</span></div>;
    return (
      <a href={currentLinks.amazon} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#FF9900] text-black px-4 py-2 hover:bg-[#e68a00] transition-colors w-full justify-center rounded-none">
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
      brand: { 
        tag: "Our Brand Identity", 
        title: "식탁과 요리에 즐거움 1큰술 더하기",
        caption: "위 이미지는 일본에서 상표 등록된 소나앤도쿄의 정식 로고 입니다."
      },
      products: {
        tag: "Product Lineup",
        title: "SONA 가 프로듀스한 자사 상품 라인업",
        footnote: "※ 도시락 데코레이션 카테고리 부문",
        p1: {
          title: "별·하트 계란말이 틀",
          badge: "아마존 재팬 베스트셀러 1위! (※)",
          desc: "틀에 넣는 것만으로 누구나 예쁜 모양 완성! 초보자의 Pain Point를 해결한 아이템.",
          features: ["한/일/중 디자인 등록", "누적 리뷰 고평가"]
        },
        p2: {
          title: "별란스틱",
          badge: "New Release",
          desc: "가벼운 힘으로 매끄러운 계란물을 제조! 알끈 제거 기능까지 포함된 프리미엄 도구.",
          features: ["18-8 스테인리스 소재", "폭신한 계란말이 최적화"]
        },
        p3: {
          title: "트리플 팬 (출시 예정)",
          badge: "Coming Soon",
          desc: "세 가지 요리를 동시에! SONA 에디션 신규 컬러 2종과 전용 뒤집개 세트 상품!",
          features: ["SONA Edition", "3구 동시 조리 시스템"]
        }
      },
      roadmapIntro: { tag: "Brand Roadmap", title: "지속 가능한