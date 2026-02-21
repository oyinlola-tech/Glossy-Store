import svgPaths from "./svg-usnw0jiset";
import imgDlBeatsnoop1 from "figma:asset/75f394c0a1c7dc5b68a42239311e510f54d8cd59.png";
import imgQrcode1 from "figma:asset/991387c05dd6d44594e01b675513068803e2426d.png";
import imgPngTransparentGooglePlayStoreLogoGooglePlayAppStoreAndroidWalletsTextLabelLogo from "figma:asset/a61d4c7110b18ab55a1e1a07ebf54a46ebb07284.png";
import imgDownloadAppstore from "figma:asset/38932d5accb54c528f9bcf326ca48ea29bd6d890.png";

function Frame6() {
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

function Frame25() {
  return (
    <div className="absolute content-stretch flex gap-[231px] items-start right-[136px] top-[12px]">
      <Frame6 />
      <Frame2 />
    </div>
  );
}

function TopHeader() {
  return (
    <div className="absolute bg-black h-[48px] left-0 overflow-clip top-0 w-[1440px]" data-name="Top Header">
      <Frame25 />
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

function UnderLine() {
  return (
    <div className="h-0 relative shrink-0 w-[61px]" data-name="UnderLine">
      <div className="absolute inset-[-1px_0_0_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 61 1">
          <g id="UnderLine" opacity="0.5">
            <line id="Line 1" stroke="var(--stroke-0, black)" x2="61" y1="0.5" y2="0.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Header4() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Header">
      <p className="font-['Poppins:Regular',sans-serif] leading-[24px] not-italic relative shrink-0 text-[16px] text-black text-center">Sign Up</p>
      <UnderLine />
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex gap-[48px] items-start relative shrink-0">
      <Header1 />
      <Header2 />
      <Header3 />
      <Header4 />
    </div>
  );
}

function Frame7() {
  return (
    <div className="content-stretch flex gap-[232px] items-start relative shrink-0">
      <Logo />
      <Frame5 />
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

function Frame4() {
  return (
    <div className="content-stretch flex gap-[24px] items-center relative shrink-0">
      <SearchComponentSet />
    </div>
  );
}

function Header() {
  return (
    <div className="absolute content-stretch flex gap-[210px] items-center left-[135px] top-[86px]" data-name="Header">
      <Frame7 />
      <Frame4 />
    </div>
  );
}

function Line() {
  return (
    <div className="absolute h-0 left-0 top-[140px] w-[1440px]">
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

function SideImage() {
  return (
    <div className="bg-[#cbe4e8] h-[781px] overflow-clip relative rounded-br-[4px] rounded-tr-[4px] shrink-0 w-[805px]" data-name="Side Image">
      <div className="absolute h-[706px] left-[-8px] top-[75px] w-[919px]" data-name="dl.beatsnoop 1">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-full left-[-10.08%] max-w-none top-0 w-[115.26%]" src={imgDlBeatsnoop1} />
        </div>
      </div>
    </div>
  );
}

function Frame31() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start not-italic relative shrink-0 text-black">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[30px] relative shrink-0 text-[36px] tracking-[1.44px]">Create an account</p>
      <p className="font-['Poppins:Regular',sans-serif] leading-[24px] relative shrink-0 text-[16px]">Enter your details below</p>
    </div>
  );
}

function UnderLine1() {
  return (
    <div className="h-0 relative shrink-0 w-[370px]" data-name="UnderLine">
      <div className="absolute inset-[-1px_0_0_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 370 1">
          <g id="UnderLine" opacity="0.5">
            <line id="Line 1" stroke="var(--stroke-0, black)" x2="370" y1="0.5" y2="0.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Frame32() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0">
      <p className="font-['Poppins:Regular',sans-serif] leading-[24px] not-italic opacity-40 relative shrink-0 text-[16px] text-black">Name</p>
      <UnderLine1 />
    </div>
  );
}

function UnderLine2() {
  return (
    <div className="h-0 relative shrink-0 w-[370px]" data-name="UnderLine">
      <div className="absolute inset-[-1px_0_0_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 370 1">
          <g id="UnderLine" opacity="0.5">
            <line id="Line 1" stroke="var(--stroke-0, black)" x2="370" y1="0.5" y2="0.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Frame33() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0">
      <p className="font-['Poppins:Regular',sans-serif] leading-[24px] not-italic opacity-40 relative shrink-0 text-[16px] text-black">Email or Phone Number</p>
      <UnderLine2 />
    </div>
  );
}

function UnderLine3() {
  return (
    <div className="h-0 relative shrink-0 w-[370px]" data-name="UnderLine">
      <div className="absolute inset-[-1px_0_0_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 370 1">
          <g id="UnderLine" opacity="0.5">
            <line id="Line 1" stroke="var(--stroke-0, black)" x2="370" y1="0.5" y2="0.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Frame34() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0">
      <p className="font-['Poppins:Regular',sans-serif] leading-[24px] not-italic opacity-40 relative shrink-0 text-[16px] text-black">Password</p>
      <UnderLine3 />
    </div>
  );
}

function Frame35() {
  return (
    <div className="content-stretch flex flex-col gap-[40px] items-start relative shrink-0">
      <Frame32 />
      <Frame33 />
      <Frame34 />
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[#db4444] content-stretch flex items-center justify-center px-[122px] py-[16px] relative rounded-[4px] shrink-0" data-name="Button">
      <p className="font-['Poppins:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#fafafa] text-[16px]">Create Account</p>
    </div>
  );
}

function IconGoogle() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Icon-Google">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g clipPath="url(#clip0_1_12840)" id="Icon-Google">
          <path d={svgPaths.p35723800} fill="var(--fill-0, #4285F4)" id="Vector" />
          <path d={svgPaths.p20170e80} fill="var(--fill-0, #34A853)" id="Vector_2" />
          <path d={svgPaths.p32da4e80} fill="var(--fill-0, #FBBC04)" id="Vector_3" />
          <path d={svgPaths.p2545ec80} fill="var(--fill-0, #EA4335)" id="Vector_4" />
        </g>
        <defs>
          <clipPath id="clip0_1_12840">
            <rect fill="white" height="24" width="24" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Frame26() {
  return (
    <div className="content-stretch flex gap-[16px] items-start relative shrink-0">
      <IconGoogle />
      <p className="font-['Poppins:Regular',sans-serif] leading-[24px] not-italic relative shrink-0 text-[16px] text-black">Sign up with Google</p>
    </div>
  );
}

function GoogleSIgnUp() {
  return (
    <div className="content-stretch flex flex-col items-start px-[86px] py-[16px] relative rounded-[4px] shrink-0" data-name="Google SIgn up">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.4)] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <Frame26 />
    </div>
  );
}

function UnderLine4() {
  return (
    <div className="h-0 relative shrink-0 w-[47px]" data-name="UnderLine">
      <div className="absolute inset-[-1px_0_0_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 47 1">
          <g id="UnderLine" opacity="0.5">
            <line id="Line 1" stroke="var(--stroke-0, black)" x2="47" y1="0.5" y2="0.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Frame27() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0">
      <p className="font-['Poppins:Medium',sans-serif] leading-[24px] not-italic opacity-70 relative shrink-0 text-[16px] text-black">Log in</p>
      <UnderLine4 />
    </div>
  );
}

function Frame28() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0">
      <p className="font-['Poppins:Regular',sans-serif] leading-[24px] not-italic opacity-70 relative shrink-0 text-[16px] text-black">Already have account?</p>
      <Frame27 />
    </div>
  );
}

function Frame29() {
  return (
    <div className="content-stretch flex flex-col gap-[32px] items-center relative shrink-0">
      <GoogleSIgnUp />
      <Frame28 />
    </div>
  );
}

function Frame30() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0">
      <Button />
      <Frame29 />
    </div>
  );
}

function Frame36() {
  return (
    <div className="content-stretch flex flex-col gap-[40px] items-center relative shrink-0">
      <Frame35 />
      <Frame30 />
    </div>
  );
}

function Frame37() {
  return (
    <div className="content-stretch flex flex-col gap-[48px] items-start relative shrink-0">
      <Frame31 />
      <Frame36 />
    </div>
  );
}

function Frame38() {
  return (
    <div className="absolute content-stretch flex gap-[129px] items-center left-0 top-[200px]">
      <SideImage />
      <Frame37 />
    </div>
  );
}

function UnderLine5() {
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

function Frame8() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[16px] items-center left-0 opacity-40 top-[376px]">
      <UnderLine5 />
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

function Frame15() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0">
      <Logo1 />
      <p className="font-['Poppins:Medium',sans-serif] leading-[28px] not-italic relative shrink-0 text-[#fafafa] text-[20px]">Subscribe</p>
    </div>
  );
}

function Frame16() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0">
      <Frame15 />
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

function Frame17() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0">
      <Frame16 />
      <SendMail />
    </div>
  );
}

function Frame13() {
  return (
    <div className="content-stretch flex flex-col font-['Poppins:Regular',sans-serif] gap-[16px] items-start leading-[24px] relative shrink-0 text-[16px]">
      <p className="relative shrink-0 w-[175px] whitespace-pre-wrap">{`4 Sogbon Street, Igbotako,  Ondo State, Nigeria.`}</p>
      <p className="relative shrink-0">exclusive@gmail.com</p>
      <p className="relative shrink-0">+234 913 351 9489</p>
    </div>
  );
}

function Frame14() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start not-italic relative shrink-0 text-[#fafafa]">
      <p className="font-['Poppins:Medium',sans-serif] leading-[28px] relative shrink-0 text-[20px]">Support</p>
      <Frame13 />
    </div>
  );
}

function Frame11() {
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

function Frame12() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start not-italic relative shrink-0 text-[#fafafa]">
      <p className="font-['Poppins:Medium',sans-serif] leading-[28px] relative shrink-0 text-[20px]">Account</p>
      <Frame11 />
    </div>
  );
}

function Frame9() {
  return (
    <div className="content-stretch flex flex-col font-['Poppins:Regular',sans-serif] gap-[16px] items-start leading-[24px] relative shrink-0 text-[16px]">
      <p className="relative shrink-0">Privacy Policy</p>
      <p className="relative shrink-0">Terms Of Use</p>
      <p className="relative shrink-0">FAQ</p>
      <p className="relative shrink-0">Contact</p>
    </div>
  );
}

function Frame10() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start not-italic relative shrink-0 text-[#fafafa]">
      <p className="font-['Poppins:Medium',sans-serif] leading-[28px] relative shrink-0 text-[20px]">Quick Link</p>
      <Frame9 />
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

function Frame18() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0">
      <GooglePlay />
      <AppStore />
    </div>
  );
}

function Frame19() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <QrCode />
      <Frame18 />
    </div>
  );
}

function Frame20() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0">
      <p className="font-['Poppins:Medium',sans-serif] leading-[18px] not-italic opacity-70 relative shrink-0 text-[#fafafa] text-[12px]">Save $3 with App New User Only</p>
      <Frame19 />
    </div>
  );
}

function Frame21() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0">
      <p className="font-['Poppins:Medium',sans-serif] leading-[28px] not-italic relative shrink-0 text-[#fafafa] text-[20px]">Download App</p>
      <Frame20 />
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

function Frame22() {
  return (
    <div className="content-stretch flex gap-[24px] items-start relative shrink-0">
      <IconFacebook />
      <IconTwitter />
      <IconInstagram />
      <IconLinkedin />
    </div>
  );
}

function Frame23() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0">
      <Frame21 />
      <Frame22 />
    </div>
  );
}

function Frame24() {
  return (
    <div className="absolute content-stretch flex gap-[87px] items-start justify-center left-[135px] top-[80px]">
      <Frame17 />
      <Frame14 />
      <Frame12 />
      <Frame10 />
      <Frame23 />
    </div>
  );
}

function Footer() {
  return (
    <div className="absolute bg-black h-[440px] left-0 overflow-clip top-[1121px] w-[1440px]" data-name="Footer">
      <Frame8 />
      <Frame24 />
    </div>
  );
}

export default function SignUp() {
  return (
    <div className="bg-white relative size-full" data-name="Sign Up">
      <TopHeader />
      <Header />
      <Line />
      <Frame38 />
      <Footer />
    </div>
  );
}