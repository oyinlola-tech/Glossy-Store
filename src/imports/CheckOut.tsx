import svgPaths from "./svg-w3gab8ohpi";
import imgQrcode1 from "figma:asset/991387c05dd6d44594e01b675513068803e2426d.png";
import imgPngTransparentGooglePlayStoreLogoGooglePlayAppStoreAndroidWalletsTextLabelLogo from "figma:asset/a61d4c7110b18ab55a1e1a07ebf54a46ebb07284.png";
import imgDownloadAppstore from "figma:asset/38932d5accb54c528f9bcf326ca48ea29bd6d890.png";
import imgG922500X5001 from "figma:asset/5d5c2e5250752d55f8b60f2aa2923183dadbc135.png";
import imgG27Cq4500X5001 from "figma:asset/5e634682db5174aff99bb9337d2dc9598a0b44e4.png";
import imgImage32 from "figma:asset/bacbff99a8fc8e50822cb2d2d168e5d0e8bf7ea6.png";
import imgImage30 from "figma:asset/cfb0a6ee01b240273b40dab07f8246ef98aed88a.png";
import imgImage31 from "figma:asset/6eefb61d27c754abac218d25d8ea4360de61f8e8.png";
import imgImage33 from "figma:asset/b28e31b9c88d0c9b038b82deeb0523d82cffe267.png";

function Frame7() {
  return (
    <div className="content-stretch flex gap-[8px] items-center not-italic relative shrink-0 text-[#fafafa] text-[14px]">
      <p className="font-['Poppins:Regular',sans-serif] h-[18px] leading-[21px] relative shrink-0 w-[474px] whitespace-pre-wrap">Summer Sale For All Swim Suits And Free Express Delivery - OFF 50%!</p>
      <p className="[text-decoration-skip-ink:none] decoration-solid font-['Poppins:SemiBold',sans-serif] leading-[24px] relative shrink-0 text-center underline">ShopNow</p>
    </div>
  );
}

function DropDown() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="DropDown">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="DropDown">
          <path d={svgPaths.p1a93e980} fill="var(--fill-0, white)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex gap-[5px] items-center justify-center relative shrink-0">
      <p className="font-['Poppins:Regular',sans-serif] leading-[21px] not-italic relative shrink-0 text-[#fafafa] text-[14px]">English</p>
      <DropDown />
    </div>
  );
}

function Frame26() {
  return (
    <div className="absolute content-stretch flex gap-[231px] items-start right-[136px] top-[12px]">
      <Frame7 />
      <Frame2 />
    </div>
  );
}

function TopHeader() {
  return (
    <div className="absolute bg-black h-[48px] left-0 overflow-clip top-0 w-[1440px]" data-name="Top Header">
      <Frame26 />
    </div>
  );
}

function Logo() {
  return (
    <div className="h-[24px] relative shrink-0 w-[118px]" data-name="Logo">
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold inset-0 leading-[24px] not-italic text-[24px] text-black tracking-[0.72px]">Exclusive</p>
    </div>
  );
}

function Header1() {
  return (
    <div className="h-[24px] relative shrink-0 w-[48px]" data-name="Header">
      <p className="absolute font-['Poppins:Regular',sans-serif] inset-0 leading-[24px] not-italic text-[16px] text-black text-center">Home</p>
    </div>
  );
}

function Header2() {
  return (
    <div className="h-[24px] relative shrink-0 w-[66px]" data-name="Header">
      <p className="absolute font-['Poppins:Regular',sans-serif] inset-0 leading-[24px] not-italic text-[16px] text-black text-center">Contact</p>
    </div>
  );
}

function Header3() {
  return (
    <div className="h-[24px] relative shrink-0 w-[48px]" data-name="Header">
      <p className="absolute font-['Poppins:Regular',sans-serif] inset-0 leading-[24px] not-italic text-[16px] text-black text-center">About</p>
    </div>
  );
}

function Header4() {
  return (
    <div className="h-[24px] relative shrink-0 w-[61px]" data-name="Header">
      <p className="absolute font-['Poppins:Regular',sans-serif] inset-0 leading-[24px] not-italic text-[16px] text-black text-center">Sign Up</p>
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex gap-[48px] items-start relative shrink-0">
      <Header1 />
      <Header2 />
      <Header3 />
      <Header4 />
    </div>
  );
}

function Frame8() {
  return (
    <div className="content-stretch flex gap-[160px] items-start relative shrink-0">
      <Logo />
      <Frame6 />
    </div>
  );
}

function Component() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Component 2">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Component 2">
          <path d={svgPaths.p14625780} id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex gap-[34px] items-center justify-center relative shrink-0">
      <p className="font-['Poppins:Regular',sans-serif] leading-[18px] not-italic opacity-50 relative shrink-0 text-[12px] text-black">What are you looking for?</p>
      <Component />
    </div>
  );
}

function SearchComponentSet() {
  return (
    <div className="bg-[#f5f5f5] content-stretch flex flex-col items-center justify-center pl-[20px] pr-[12px] py-[7px] relative rounded-[4px] shrink-0" data-name="Search Component Set">
      <Frame3 />
    </div>
  );
}

function Group3() {
  return (
    <div className="absolute bottom-[46.88%] contents left-1/2 right-0 top-0">
      <div className="absolute bottom-[46.88%] left-1/2 right-0 top-[3.13%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
          <circle cx="8" cy="8" fill="var(--fill-0, #DB4444)" id="Ellipse 1" r="8" />
        </svg>
      </div>
      <p className="absolute font-['Poppins:Regular',sans-serif] inset-[0_15.63%_46.88%_62.5%] leading-[18px] not-italic text-[#fafafa] text-[12px] text-center whitespace-pre-wrap">4</p>
    </div>
  );
}

function Wishlist() {
  return (
    <div className="overflow-clip relative shrink-0 size-[32px]" data-name="Wishlist">
      <div className="absolute inset-[21.88%_18.75%]" data-name="Vector">
        <div className="absolute inset-[-4.17%_-3.75%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21.5 19.5">
            <path d={svgPaths.p3af58300} id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
      <Group3 />
    </div>
  );
}

function Cart() {
  return (
    <div className="absolute bottom-0 left-[3.13%] right-[21.88%] top-1/4" data-name="Cart1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Cart1">
          <path d={svgPaths.p31c17200} id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d={svgPaths.p4fd100} id="Vector_2" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d={svgPaths.p39b9d000} id="Vector_3" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d={svgPaths.p36afedc0} id="Vector_4" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}

function Group4() {
  return (
    <div className="absolute contents inset-[3.13%_3.13%_43.75%_46.88%]">
      <div className="absolute inset-[6.25%_3.13%_43.75%_46.88%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
          <circle cx="8" cy="8" fill="var(--fill-0, #DB4444)" id="Ellipse 1" r="8" />
        </svg>
      </div>
      <p className="absolute font-['Poppins:Regular',sans-serif] inset-[3.13%_15.63%_43.75%_62.5%] leading-[18px] not-italic text-[#fafafa] text-[12px] text-center whitespace-pre-wrap">2</p>
    </div>
  );
}

function Cart1WithBuy() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="Cart1 with buy">
      <Cart />
      <Group4 />
    </div>
  );
}

function User() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="user">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="user">
          <path d={svgPaths.p2941b400} id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d={svgPaths.p7f7ae00} id="Vector_2" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex gap-[16px] items-center justify-center relative shrink-0">
      <Wishlist />
      <Cart1WithBuy />
      <User />
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex gap-[24px] items-center relative shrink-0">
      <SearchComponentSet />
      <Frame4 />
    </div>
  );
}

function Header() {
  return (
    <div className="absolute content-stretch flex gap-[130px] items-center left-[135px] top-[88px]" data-name="Header">
      <Frame8 />
      <Frame5 />
    </div>
  );
}

function Line() {
  return (
    <div className="absolute h-0 left-0 top-[142px] w-[1440px]">
      <div className="absolute inset-[0_0_-0.5px_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1440 0.5">
          <g id="Line 3">
            <line id="Line 3_2" opacity="0.3" stroke="var(--stroke-0, black)" strokeWidth="0.5" x1="1440" y1="0.25" y2="0.25" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Roadmap() {
  return (
    <div className="absolute content-stretch flex gap-[12px] items-center left-[135px] top-[222px]" data-name="Roadmap">
      <p className="font-['Poppins:Regular',sans-serif] leading-[21px] not-italic opacity-50 relative shrink-0 text-[14px] text-black">Account</p>
      <div className="flex h-[11.75px] items-center justify-center relative shrink-0 w-[6px]" style={{ "--transform-inner-width": "1185", "--transform-inner-height": "22" } as React.CSSProperties}>
        <div className="flex-none rotate-[117.05deg]">
          <div className="h-0 relative w-[13.193px]">
            <div className="absolute inset-[-1px_0_0_0]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.1933 1">
                <line id="Line 13" opacity="0.5" stroke="var(--stroke-0, black)" x2="13.1933" y1="0.5" y2="0.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <p className="font-['Poppins:Regular',sans-serif] leading-[21px] not-italic opacity-50 relative shrink-0 text-[14px] text-black">My Account</p>
      <div className="flex h-[11.75px] items-center justify-center relative shrink-0 w-[6px]" style={{ "--transform-inner-width": "1185", "--transform-inner-height": "22" } as React.CSSProperties}>
        <div className="flex-none rotate-[117.05deg]">
          <div className="h-0 relative w-[13.193px]">
            <div className="absolute inset-[-1px_0_0_0]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.1933 1">
                <line id="Line 13" opacity="0.5" stroke="var(--stroke-0, black)" x2="13.1933" y1="0.5" y2="0.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <p className="font-['Poppins:Regular',sans-serif] leading-[21px] not-italic opacity-50 relative shrink-0 text-[14px] text-black">Product</p>
      <div className="flex h-[11.75px] items-center justify-center relative shrink-0 w-[6px]" style={{ "--transform-inner-width": "1185", "--transform-inner-height": "22" } as React.CSSProperties}>
        <div className="flex-none rotate-[117.05deg]">
          <div className="h-0 relative w-[13.193px]">
            <div className="absolute inset-[-1px_0_0_0]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.1933 1">
                <line id="Line 13" opacity="0.5" stroke="var(--stroke-0, black)" x2="13.1933" y1="0.5" y2="0.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <p className="font-['Poppins:Regular',sans-serif] leading-[21px] not-italic opacity-50 relative shrink-0 text-[14px] text-black">View Cart</p>
      <div className="flex h-[11.75px] items-center justify-center relative shrink-0 w-[6px]" style={{ "--transform-inner-width": "1185", "--transform-inner-height": "22" } as React.CSSProperties}>
        <div className="flex-none rotate-[117.05deg]">
          <div className="h-0 relative w-[13.193px]">
            <div className="absolute inset-[-1px_0_0_0]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.1933 1">
                <line id="Line 13" opacity="0.5" stroke="var(--stroke-0, black)" x2="13.1933" y1="0.5" y2="0.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <p className="font-['Poppins:Regular',sans-serif] leading-[21px] not-italic relative shrink-0 text-[14px] text-black">CheckOut</p>
    </div>
  );
}

function Frame27() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[135px] top-[323px]">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[30px] not-italic relative shrink-0 text-[36px] text-black tracking-[1.44px]">Billing Details</p>
    </div>
  );
}

function Frame32() {
  return <div className="bg-[#f5f5f5] h-[50px] rounded-[4px] shrink-0 w-[470px]" />;
}

function Frame50() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0">
      <p className="font-['Poppins:Regular',sans-serif] leading-[0] not-italic opacity-40 relative shrink-0 text-[16px] text-black">
        <span className="leading-[24px]">First Name</span>
        <span className="leading-[24px] text-[#db4444]">*</span>
      </p>
      <Frame32 />
    </div>
  );
}

function Frame33() {
  return <div className="bg-[#f5f5f5] h-[50px] rounded-[4px] shrink-0 w-[470px]" />;
}

function Frame51() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0">
      <p className="font-['Poppins:Regular',sans-serif] leading-[24px] not-italic opacity-40 relative shrink-0 text-[16px] text-black">Company Name</p>
      <Frame33 />
    </div>
  );
}

function Frame34() {
  return <div className="bg-[#f5f5f5] h-[50px] rounded-[4px] shrink-0 w-[470px]" />;
}

function Frame52() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0">
      <p className="font-['Poppins:Regular',sans-serif] leading-[0] not-italic opacity-40 relative shrink-0 text-[16px] text-black">
        <span className="leading-[24px]">Street Address</span>
        <span className="leading-[24px] text-[#db4444]">*</span>
      </p>
      <Frame34 />
    </div>
  );
}

function Frame35() {
  return <div className="bg-[#f5f5f5] h-[50px] rounded-[4px] shrink-0 w-[470px]" />;
}

function Frame53() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0">
      <p className="font-['Poppins:Regular',sans-serif] leading-[24px] not-italic opacity-40 relative shrink-0 text-[16px] text-black">Apartment, floor, etc. (optional)</p>
      <Frame35 />
    </div>
  );
}

function Frame36() {
  return <div className="bg-[#f5f5f5] h-[50px] rounded-[4px] shrink-0 w-[470px]" />;
}

function Frame54() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0">
      <p className="font-['Poppins:Regular',sans-serif] leading-[0] not-italic opacity-40 relative shrink-0 text-[16px] text-black">
        <span className="leading-[24px]">Town/City</span>
        <span className="leading-[24px] text-[#db4444]">*</span>
      </p>
      <Frame36 />
    </div>
  );
}

function Frame37() {
  return <div className="bg-[#f5f5f5] h-[50px] rounded-[4px] shrink-0 w-[470px]" />;
}

function Frame55() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0">
      <p className="font-['Poppins:Regular',sans-serif] leading-[0] not-italic opacity-40 relative shrink-0 text-[16px] text-black">
        <span className="leading-[24px]">Phone Number</span>
        <span className="leading-[24px] text-[#db4444]">*</span>
      </p>
      <Frame37 />
    </div>
  );
}

function Frame38() {
  return <div className="bg-[#f5f5f5] h-[50px] rounded-[4px] shrink-0 w-[470px]" />;
}

function Frame56() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0">
      <p className="font-['Poppins:Regular',sans-serif] leading-[0] not-italic opacity-40 relative shrink-0 text-[16px] text-black">
        <span className="leading-[24px]">Email Address</span>
        <span className="leading-[24px] text-[#db4444]">*</span>
      </p>
      <Frame38 />
    </div>
  );
}

function Frame58() {
  return (
    <div className="content-stretch flex flex-col gap-[32px] items-start relative shrink-0">
      <Frame50 />
      <Frame51 />
      <Frame52 />
      <Frame53 />
      <Frame54 />
      <Frame55 />
      <Frame56 />
    </div>
  );
}

function IconCheckbox() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="icon-checkbox">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="icon-checkbox">
          <rect fill="var(--fill-0, #DB4444)" height="24" rx="4" width="24" />
          <path d="M5 12L10.25 17L19 7" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}

function Frame57() {
  return (
    <div className="content-stretch flex gap-[16px] items-start relative shrink-0">
      <IconCheckbox />
      <p className="font-['Poppins:Regular',sans-serif] leading-[24px] not-italic relative shrink-0 text-[16px] text-black">Save this information for faster check-out next time</p>
    </div>
  );
}

function Frame59() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[24px] items-start left-[135px] top-[401px]">
      <Frame58 />
      <Frame57 />
    </div>
  );
}

function UnderLine() {
  return (
    <div className="h-0 relative shrink-0 w-[1440px]" data-name="UnderLine">
      <div className="absolute inset-[-1px_0_0_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1440 1">
          <g id="UnderLine" opacity="0.5">
            <line id="Line 1" opacity="0.4" stroke="var(--stroke-0, white)" x2="1440" y1="0.5" y2="0.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Group() {
  return (
    <div className="absolute inset-[8.33%]" data-name="Group">
      <div className="absolute inset-[-4.5%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.1667 18.1667">
          <g id="Group">
            <path d={svgPaths.p287d0900} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p352a1800} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function IconCopyright() {
  return (
    <div className="overflow-clip relative shrink-0 size-[20px]" data-name="icon-copyright">
      <Group />
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
      <IconCopyright />
      <p className="font-['Poppins:Regular',sans-serif] leading-[24px] not-italic relative shrink-0 text-[16px] text-white">Copyright Rimel 2022. All right reserved</p>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex items-center opacity-60 relative shrink-0">
      <Frame />
    </div>
  );
}

function Frame9() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[16px] items-center left-0 opacity-40 top-[376px]">
      <UnderLine />
      <Frame1 />
    </div>
  );
}

function Logo1() {
  return (
    <div className="h-[24px] relative shrink-0 w-[118px]" data-name="Logo">
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold inset-0 leading-[24px] not-italic text-[#fafafa] text-[24px] tracking-[0.72px]">Exclusive</p>
    </div>
  );
}

function Frame16() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0">
      <Logo1 />
      <p className="font-['Poppins:Medium',sans-serif] leading-[28px] not-italic relative shrink-0 text-[#fafafa] text-[20px]">Subscribe</p>
    </div>
  );
}

function Frame17() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0">
      <Frame16 />
      <p className="font-['Poppins:Regular',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#fafafa] text-[16px]">Get 10% off your first order</p>
    </div>
  );
}

function IconSend() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="icon-send">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="icon-send">
          <path d={svgPaths.p3140fa80} id="Vector" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}

function SendMail() {
  return (
    <div className="content-stretch flex gap-[32px] items-center pl-[16px] py-[12px] relative rounded-[4px] shrink-0 w-[217px]" data-name="Send Mail">
      <div aria-hidden="true" className="absolute border-[#fafafa] border-[1.5px] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <p className="font-['Poppins:Regular',sans-serif] leading-[24px] not-italic opacity-40 relative shrink-0 text-[#fafafa] text-[16px]">Enter your email</p>
      <IconSend />
    </div>
  );
}

function Frame18() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0">
      <Frame17 />
      <SendMail />
    </div>
  );
}

function Frame14() {
  return (
    <div className="content-stretch flex flex-col font-['Poppins:Regular',sans-serif] gap-[16px] items-start leading-[24px] relative shrink-0 text-[16px]">
      <p className="relative shrink-0 w-[175px] whitespace-pre-wrap">{`4 Sogbon Street, Igbotako,  Ondo State, Nigeria.`}</p>
      <p className="relative shrink-0">exclusive@gmail.com</p>
      <p className="relative shrink-0">+234 913 351 9489</p>
    </div>
  );
}

function Frame15() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start not-italic relative shrink-0 text-[#fafafa]">
      <p className="font-['Poppins:Medium',sans-serif] leading-[28px] relative shrink-0 text-[20px]">Support</p>
      <Frame14 />
    </div>
  );
}

function Frame12() {
  return (
    <div className="content-stretch flex flex-col font-['Poppins:Regular',sans-serif] gap-[16px] items-start leading-[24px] relative shrink-0 text-[16px]">
      <p className="relative shrink-0">My Account</p>
      <p className="relative shrink-0">Login / Register</p>
      <p className="relative shrink-0">Cart</p>
      <p className="relative shrink-0">Wishlist</p>
      <p className="relative shrink-0">Shop</p>
    </div>
  );
}

function Frame13() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start not-italic relative shrink-0 text-[#fafafa]">
      <p className="font-['Poppins:Medium',sans-serif] leading-[28px] relative shrink-0 text-[20px]">Account</p>
      <Frame12 />
    </div>
  );
}

function Frame10() {
  return (
    <div className="content-stretch flex flex-col font-['Poppins:Regular',sans-serif] gap-[16px] items-start leading-[24px] relative shrink-0 text-[16px]">
      <p className="relative shrink-0">Privacy Policy</p>
      <p className="relative shrink-0">Terms Of Use</p>
      <p className="relative shrink-0">FAQ</p>
      <p className="relative shrink-0">Contact</p>
    </div>
  );
}

function Frame11() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start not-italic relative shrink-0 text-[#fafafa]">
      <p className="font-['Poppins:Medium',sans-serif] leading-[28px] relative shrink-0 text-[20px]">Quick Link</p>
      <Frame10 />
    </div>
  );
}

function QrCode() {
  return (
    <div className="bg-black overflow-clip relative shrink-0 size-[80px]" data-name="Qr Code">
      <div className="absolute left-[2px] pointer-events-none size-[76px] top-[2px]" data-name="Qrcode 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover size-full" src={imgQrcode1} />
        <div aria-hidden="true" className="absolute border-[2.5px] border-solid border-white inset-[-2.5px]" />
      </div>
    </div>
  );
}

function GooglePlay() {
  return (
    <div className="bg-[#030406] h-[40px] overflow-clip relative shrink-0 w-[110px]" data-name="GooglePlay">
      <div className="absolute h-[30px] left-[3px] pointer-events-none rounded-[4px] top-[5px] w-[104px]" data-name="png-transparent-google-play-store-logo-google-play-app-store-android-wallets-text-label-logo">
        <div className="absolute inset-0 overflow-hidden rounded-[4px]">
          <img alt="" className="absolute h-[402.19%] left-[-6.75%] max-w-none top-[-151.09%] w-[113.38%]" src={imgPngTransparentGooglePlayStoreLogoGooglePlayAppStoreAndroidWalletsTextLabelLogo} />
        </div>
        <div aria-hidden="true" className="absolute border-[#fafafa] border-[0.6px] border-solid inset-[-0.6px] rounded-[4.6px]" />
      </div>
      <div className="absolute h-[0.952px] left-[99.39px] top-[22.24px] w-[0.56px]">
        <div className="absolute inset-[-52.51%_-89.26%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.56033 1.95248">
            <path d={svgPaths.pec26940} id="Vector 1" stroke="var(--stroke-0, white)" strokeLinecap="round" />
          </svg>
        </div>
      </div>
      <div className="absolute h-[3.922px] left-[98.19px] top-[21.96px] w-[1.262px]">
        <div className="absolute inset-[-12.75%_-39.62%_-12.75%_-39.6%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2.26226 4.92162">
            <path d={svgPaths.p83b0f80} id="Vector 2" stroke="var(--stroke-0, white)" strokeLinecap="round" />
          </svg>
        </div>
      </div>
      <div className="absolute h-[0.064px] left-[94.91px] top-[22.24px] w-[0.308px]">
        <div className="absolute inset-[-779.69%_-162.29%_-779.77%_-162.28%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.30816 1.06416">
            <path d={svgPaths.p2c4b6600} id="Vector 3" stroke="var(--stroke-0, white)" strokeLinecap="round" />
          </svg>
        </div>
      </div>
      <div className="absolute h-[2.205px] left-[98.39px] top-[22.71px] w-[1.165px]">
        <div className="absolute inset-[-22.67%_-42.93%_-22.68%_-42.93%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2.16489 3.20533">
            <path d={svgPaths.p6c6a400} id="Vector 4" stroke="var(--stroke-0, white)" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function AppStore() {
  return (
    <div className="bg-black h-[40px] overflow-clip relative shrink-0 w-[110px]" data-name="AppStore">
      <div className="absolute h-[34px] left-[3px] pointer-events-none rounded-[4px] top-[3px] w-[104px]" data-name="download-appstore">
        <div className="absolute inset-0 overflow-hidden rounded-[4px]">
          <img alt="" className="absolute h-[311.42%] left-[-0.96%] max-w-none top-[-105.71%] w-[101.92%]" src={imgDownloadAppstore} />
        </div>
        <div aria-hidden="true" className="absolute border-[0.6px] border-solid border-white inset-[-0.6px] rounded-[4.6px]" />
      </div>
    </div>
  );
}

function Frame19() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0">
      <GooglePlay />
      <AppStore />
    </div>
  );
}

function Frame20() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <QrCode />
      <Frame19 />
    </div>
  );
}

function Frame21() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0">
      <p className="font-['Poppins:Medium',sans-serif] leading-[18px] not-italic opacity-70 relative shrink-0 text-[#fafafa] text-[12px]">Save $3 with App New User Only</p>
      <Frame20 />
    </div>
  );
}

function Frame22() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0">
      <p className="font-['Poppins:Medium',sans-serif] leading-[28px] not-italic relative shrink-0 text-[#fafafa] text-[20px]">Download App</p>
      <Frame21 />
    </div>
  );
}

function IconFacebook() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Icon-Facebook">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icon-Facebook">
          <path d={svgPaths.p23934070} fill="var(--fill-0, white)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute inset-[0_8.09%_0_-20.83%]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27.059 24">
        <g id="Group">
          <g id="Vector" />
          <path d={svgPaths.p32e73480} fill="var(--fill-0, white)" id="Vector_2" stroke="var(--stroke-0, black)" strokeWidth="0.2" />
        </g>
      </svg>
    </div>
  );
}

function IconTwitter() {
  return (
    <div className="overflow-clip relative shrink-0 size-[24px]" data-name="Icon-Twitter">
      <Group1 />
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute inset-[12.5%]" data-name="Group">
      <div className="absolute inset-[-4.17%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19.5 19.5">
          <g id="Group">
            <path d={svgPaths.p20514000} id="Vector" stroke="var(--stroke-0, white)" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p2d54dc80} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.pd6a3900} fill="var(--fill-0, white)" id="Vector_3" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function IconInstagram() {
  return (
    <div className="overflow-clip relative shrink-0 size-[24px]" data-name="icon-instagram">
      <Group2 />
    </div>
  );
}

function IconLinkedin() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Icon-Linkedin">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icon-Linkedin">
          <path d={svgPaths.p2ab3acc0} fill="var(--fill-0, white)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Frame23() {
  return (
    <div className="content-stretch flex gap-[24px] items-start relative shrink-0">
      <IconFacebook />
      <IconTwitter />
      <IconInstagram />
      <IconLinkedin />
    </div>
  );
}

function Frame24() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0">
      <Frame22 />
      <Frame23 />
    </div>
  );
}

function Frame25() {
  return (
    <div className="absolute content-stretch flex gap-[87px] items-start justify-center left-[135px] top-[80px]">
      <Frame18 />
      <Frame15 />
      <Frame13 />
      <Frame11 />
      <Frame24 />
    </div>
  );
}

function Footer() {
  return (
    <div className="absolute bg-black h-[440px] left-0 overflow-clip top-[1355px] w-[1440px]" data-name="Footer">
      <Frame9 />
      <Frame25 />
    </div>
  );
}

function GamepadCartSmall() {
  return (
    <div className="overflow-clip relative shrink-0 size-[54px]" data-name="Gamepad-Cart-Small">
      <div className="absolute inset-[11.11%_3.92%_10.7%_5.56%]" data-name="g92-2-500x500 1">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[117.44%] left-[-3.09%] max-w-none top-[-17.44%] w-[104.12%]" src={imgG922500X5001} />
        </div>
      </div>
    </div>
  );
}

function Frame39() {
  return (
    <div className="content-stretch flex font-['Poppins:Regular',sans-serif] gap-[210px] items-center leading-[24px] not-italic relative shrink-0 text-[16px] text-black">
      <p className="relative shrink-0">LCD Monitor</p>
      <p className="relative shrink-0">$650</p>
    </div>
  );
}

function Frame41() {
  return (
    <div className="content-stretch flex gap-[24px] items-center relative shrink-0">
      <GamepadCartSmall />
      <Frame39 />
    </div>
  );
}

function MonitorCartSmall() {
  return (
    <div className="overflow-clip relative shrink-0 size-[54px]" data-name="Monitor-Cart-Small">
      <div className="absolute inset-[14.81%_3.7%_12.96%_3.7%]" data-name="g27cq4-500x500 1">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[161.25%] left-[-12.13%] max-w-none top-[-32.07%] w-[124.25%]" src={imgG27Cq4500X5001} />
        </div>
      </div>
    </div>
  );
}

function Frame43() {
  return (
    <div className="content-stretch flex font-['Poppins:Regular',sans-serif] gap-[204px] items-center leading-[24px] not-italic relative shrink-0 text-[16px] text-black">
      <p className="relative shrink-0">H1 Gamepad</p>
      <p className="relative shrink-0">$1100</p>
    </div>
  );
}

function Frame40() {
  return (
    <div className="content-stretch flex gap-[20px] items-center relative shrink-0">
      <MonitorCartSmall />
      <Frame43 />
    </div>
  );
}

function Frame42() {
  return (
    <div className="content-stretch flex flex-col gap-[32px] items-end relative shrink-0">
      <Frame41 />
      <Frame40 />
    </div>
  );
}

function Frame30() {
  return (
    <div className="content-stretch flex font-['Poppins:Regular',sans-serif] gap-[307px] items-start leading-[24px] not-italic relative shrink-0 text-[16px] text-black">
      <p className="relative shrink-0">Subtotal:</p>
      <p className="relative shrink-0">$1750</p>
    </div>
  );
}

function UnderLine1() {
  return (
    <div className="h-0 relative shrink-0 w-[422px]" data-name="UnderLine">
      <div className="absolute inset-[-1px_0_0_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 422 1">
          <g id="UnderLine" opacity="0.4">
            <line id="Line 1" stroke="var(--stroke-0, black)" x2="422" y1="0.5" y2="0.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Frame47() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0">
      <Frame30 />
      <UnderLine1 />
    </div>
  );
}

function Frame29() {
  return (
    <div className="content-stretch flex font-['Poppins:Regular',sans-serif] gap-[314px] items-start leading-[24px] not-italic relative shrink-0 text-[16px] text-black">
      <p className="relative shrink-0">Shipping:</p>
      <p className="relative shrink-0">Free</p>
    </div>
  );
}

function Frame44() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0">
      <Frame47 />
      <Frame29 />
    </div>
  );
}

function UnderLine2() {
  return (
    <div className="h-0 relative shrink-0 w-[422px]" data-name="UnderLine">
      <div className="absolute inset-[-1px_0_0_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 422 1">
          <g id="UnderLine" opacity="0.4">
            <line id="Line 1" stroke="var(--stroke-0, black)" x2="422" y1="0.5" y2="0.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Frame45() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0">
      <Frame44 />
      <UnderLine2 />
    </div>
  );
}

function Frame28() {
  return (
    <div className="content-stretch flex font-['Poppins:Regular',sans-serif] gap-[335px] items-start leading-[24px] not-italic relative shrink-0 text-[16px] text-black">
      <p className="relative shrink-0">Total:</p>
      <p className="relative shrink-0">$1750</p>
    </div>
  );
}

function Frame46() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0">
      <Frame45 />
      <Frame28 />
    </div>
  );
}

function RadioButton() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Radio Button">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Radio Button">
          <circle cx="12" cy="12" id="Ellipse 28" r="11.25" stroke="var(--stroke-0, black)" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}

function Frame48() {
  return (
    <div className="content-stretch flex gap-[16px] items-start relative shrink-0">
      <RadioButton />
      <p className="font-['Poppins:Regular',sans-serif] leading-[24px] not-italic relative shrink-0 text-[16px] text-black">Bank</p>
    </div>
  );
}

function Bkash() {
  return (
    <div className="h-[28px] overflow-clip relative shrink-0 w-[42px]" data-name="Bkash">
      <div className="absolute inset-[20%_5%]" data-name="image 32">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[191.44%] left-[-14.5%] max-w-none top-[-46.4%] w-[129%]" src={imgImage32} />
        </div>
      </div>
    </div>
  );
}

function Visa() {
  return (
    <div className="h-[28px] overflow-clip relative shrink-0 w-[42px]" data-name="Visa">
      <div className="absolute inset-[30%_5%]" data-name="image 30">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage30} />
      </div>
    </div>
  );
}

function Mastercard() {
  return (
    <div className="h-[28px] overflow-clip relative shrink-0 w-[42px]" data-name="Mastercard">
      <div className="absolute inset-[5%_3.33%]" data-name="image 31">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[96.23%] left-0 max-w-none top-[1.34%] w-full" src={imgImage31} />
        </div>
      </div>
    </div>
  );
}

function Nagad() {
  return (
    <div className="h-[28px] overflow-clip relative shrink-0 w-[42px]" data-name="Nagad">
      <div className="absolute inset-[17.5%_3.33%]" data-name="image 33">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[186.57%] left-[-12.23%] max-w-none top-[-44.44%] w-[126.38%]" src={imgImage33} />
        </div>
      </div>
    </div>
  );
}

function Frame60() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0">
      <Bkash />
      <Visa />
      <Mastercard />
      <Nagad />
    </div>
  );
}

function Frame61() {
  return (
    <div className="content-stretch flex gap-[155px] items-center relative shrink-0">
      <Frame48 />
      <Frame60 />
    </div>
  );
}

function RadioButton1() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Radio Button">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Radio Button">
          <circle cx="12" cy="12" id="Ellipse 28" r="11.25" stroke="var(--stroke-0, black)" strokeWidth="1.5" />
          <circle cx="12" cy="12" fill="var(--fill-0, black)" id="Ellipse 29" r="7" />
        </g>
      </svg>
    </div>
  );
}

function Frame49() {
  return (
    <div className="content-stretch flex gap-[16px] items-start relative shrink-0">
      <RadioButton1 />
      <p className="font-['Poppins:Regular',sans-serif] leading-[24px] not-italic relative shrink-0 text-[16px] text-black">Cash on delivery</p>
    </div>
  );
}

function Frame31() {
  return (
    <div className="h-[56px] relative rounded-[4px] shrink-0 w-[300px]">
      <div className="overflow-clip relative rounded-[inherit] size-full">
        <p className="absolute font-['Poppins:Regular',sans-serif] leading-[24px] left-[24px] not-italic opacity-50 text-[16px] text-black top-[calc(50%-12px)]">Coupon Code</p>
      </div>
      <div aria-hidden="true" className="absolute border border-black border-solid inset-0 pointer-events-none rounded-[4px]" />
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[#db4444] content-stretch flex items-center justify-center px-[48px] py-[16px] relative rounded-[4px] shrink-0" data-name="Button">
      <p className="font-['Poppins:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#fafafa] text-[16px]">Apply Coupon</p>
    </div>
  );
}

function CouponCode() {
  return (
    <div className="content-stretch flex gap-[16px] items-end relative shrink-0" data-name="Coupon Code">
      <Frame31 />
      <Button />
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[#db4444] content-stretch flex items-center justify-center px-[48px] py-[16px] relative rounded-[4px] shrink-0" data-name="Button">
      <p className="font-['Poppins:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#fafafa] text-[16px]">Place Order</p>
    </div>
  );
}

function Frame62() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[32px] items-start left-[calc(50%+58px)] top-[433px]">
      <Frame42 />
      <Frame46 />
      <Frame61 />
      <Frame49 />
      <CouponCode />
      <Button1 />
    </div>
  );
}

export default function CheckOut() {
  return (
    <div className="bg-white relative size-full" data-name="CheckOut">
      <TopHeader />
      <Header />
      <Line />
      <Roadmap />
      <Frame27 />
      <Frame59 />
      <Footer />
      <Frame62 />
    </div>
  );
}