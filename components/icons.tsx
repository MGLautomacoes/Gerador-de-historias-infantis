import React from 'react';

export const ZapIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
  </svg>
);

export const WandSparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (
  // FIX: Corrected the viewBox attribute from '0 0 24" 24"' to '0 0 24 24' to fix SVG syntax error.
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m22 12-3-3-3 3-3-3-3 3-3-3-3 3 3 3-3 3"></path>
    <path d="M11 12a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1v0a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1z"></path>
    <path d="M3.5 2.5a2.5 2.5 0 0 1 3 3L5 7l-4 4 4-4 1.5 1.5a2.5 2.5 0 0 1-3-3Z"></path>
  </svg>
);

export const KidsStoriesLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="kidsStoriesGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#f89b4a' }} />
        <stop offset="100%" style={{ stopColor: '#e53653' }} />
      </linearGradient>
      <linearGradient id="mglGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#7a5fff' }} />
        <stop offset="100%" style={{ stopColor: '#3d37c8' }} />
      </linearGradient>
    </defs>
    
    <g transform="translate(10, 10)">
      {/* Film Reel */}
      <g transform="translate(15, 30) rotate(-15)">
        <circle cx="25" cy="25" r="25" fill="#a0a0a0" />
        <circle cx="25" cy="25" r="22" fill="#333" />
        <circle cx="25" cy="25" r="8" fill="#a0a0a0" />
        <path d="M25,3 A22,22 0 0,1 47,25 L41,25 A16,16 0 0,0 25,9 Z" fill="#a0a0a0" />
        <path d="M3,25 A22,22 0 0,1 25,47 L25,41 A16,16 0 0,0 9,25 Z" fill="#a0a0a0" />
        <path d="M25,3 A22,22 0 0,0 3,25 L9,25 A16,16 0 0,1 25,9 Z" transform="rotate(90 25 25)" fill="#a0a0a0" />
        <path d="M3,25 A22,22 0 0,0 25,47 L25,41 A16,16 0 0,1 9,25 Z" transform="rotate(90 25 25)" fill="#a0a0a0" />
      </g>
      
      {/* Clapperboard */}
      <g transform="translate(120, 10) rotate(15)">
        <rect x="0" y="5" width="60" height="40" fill="#333" />
        <rect x="5" y="10" width="50" height="4" fill="#fff" />
        <rect x="5" y="19" width="50" height="4" fill="#fff" />
        <g transform="rotate(-15, 0, 0)">
          <path d="M0,0 L60,0 L55,-10 L-5,-10 Z" fill="#333" />
          <path d="M2,-8 L12,-8 L10,-2 L0,-2 Z" fill="#fff" />
          <path d="M18,-8 L28,-8 L26,-2 L16,-2 Z" fill="#fff" />
          <path d="M34,-8 L44,-8 L42,-2 L32,-2 Z" fill="#fff" />
          <path d="M50,-8 L60,-8 L58,-2 L48,-2 Z" fill="#fff" />
        </g>
      </g>
      
      {/* Film Strip */}
      <path d="M0 80 Q 90 40, 180 80" stroke="#f0f0f0" strokeWidth="30" fill="none" />
      <path d="M0 80 Q 90 40, 180 80" stroke="#333" strokeWidth="26" fill="none" />
      <g fill="#f0f0f0">
        <rect x="5" y="66" width="3" height="3" />
        <rect x="15" y="66" width="3" height="3" />
        <rect x="25" y="66" width="3" height="3" />
        <rect x="35" y="65" width="3" height="3" />
        <rect x="45" y="63" width="3" height="3" />
        <rect x="55" y="61" width="3" height="3" />
        <rect x="65" y="60" width="3" height="3" />
        <rect x="75" y="60" width="3" height="3" />
        <rect x="85" y="60" width="3" height="3" />
        <rect x="95" y="61" width="3" height="3" />
        <rect x="105" y="62" width="3" height="3" />
        <rect x="115" y="64" width="3" height="3" />
        <rect x="125" y="66" width="3" height="3" />
        <rect x="135" y="68" width="3" height="3" />
        <rect x="145" y="71" width="3" height="3" />
        <rect x="155" y="74" width="3" height="3" />
        <rect x="165" y="77" width="3" height="3" />
        
        <rect x="5" y="91" width="3" height="3" />
        <rect x="15" y="91" width="3" height="3" />
        <rect x="25" y="91" width="3" height="3" />
        <rect x="35" y="92" width="3" height="3" />
        <rect x="45" y="94" width="3" height="3" />
        <rect x="55" y="96" width="3" height="3" />
        <rect x="65" y="97" width="3" height="3" />
        <rect x="75" y="97" width="3" height="3" />
        <rect x="85" y="97" width="3" height="3" />
        <rect x="95" y="96" width="3" height="3" />
        <rect x="105" y="95" width="3" height="3" />
        <rect x="115" y="93" width="3" height="3" />
        <rect x="125" y="91" width="3" height="3" />
        <rect x="135" y="89" width="3" height="3" />
        <rect x="145" y="86" width="3" height="3" />
        <rect x="155" y="83" width="3" height="3" />
        <rect x="165" y="80" width="3" height="3" />
      </g>
      
      {/* Kids Stories Text */}
      <g transform="rotate(-5, 90, 55)">
        <text x="90" y="60" style={{ fontFamily: 'Pacifico, cursive', fontSize: '32px' }} fill="#4a2511" textAnchor="middle" transform="translate(2, 2)">Kids Stories</text>
        <text x="90" y="60" style={{ fontFamily: 'Pacifico, cursive', fontSize: '32px' }} fill="url(#kidsStoriesGradient)" textAnchor="middle">Kids Stories</text>
      </g>
      
      {/* MGL Text */}
       <g transform="rotate(-5, 90, 55)">
        <text x="90" y="100" style={{ fontFamily: "'Lilita One', sans-serif", fontSize: '38px' }} fill="#1e1a64" textAnchor="middle" transform="translate(2, 2)">MGL</text>
        <text x="90" y="100" style={{ fontFamily: "'Lilita One', sans-serif", fontSize: '38px' }} fill="url(#mglGradient)" textAnchor="middle">MGL</text>
      </g>

      {/* Estd 2025 Text */}
      <text x="90" y="125" style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px' }} fill="#f0f0f0" textAnchor="middle">Estd 2025</text>
    </g>
  </svg>
);


export const OpenAIIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
        <path d="M21.12,8.88a9,9,0,1,1-9-6.36" strokeLinecap="round" strokeLinejoin="round"></path>
        <path d="M2.88,15.12a9,9,0,1,1,9,6.36" strokeLinecap="round" strokeLinejoin="round"></path>
        <path d="M8.88,2.88a9,9,0,1,1-6.36,9" strokeLinecap="round" strokeLinejoin="round"></path>
        <path d="M15.12,21.12a9,9,0,1,1,6.36-9" strokeLinecap="round" strokeLinejoin="round"></path>
        <path d="M12,12l-2.88-2.88" strokeLinecap="round" strokeLinejoin="round"></path>
        <path d="M9.12,15.12l2.88-2.88" strokeLinecap="round" strokeLinejoin="round"></path>
        <path d="M12,12l2.88,2.88" strokeLinecap="round" strokeLinejoin="round"></path>
        <path d="M15.12,9.12l-2.88,2.88" strokeLinecap="round" strokeLinejoin="round"></path>
    </svg>
);

export const UserPlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" x2="19" y1="8" y2="14"></line><line x1="22" x2="16" y1="11" y2="11"></line></svg>
);

export const PlusCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="8" y2="16"></line><line x1="8" x2="16" y1="12" y2="12"></line></svg>
);

export const PlusSquareIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="12" y1="8" x2="12" y2="16"></line>
        <line x1="8" y1="12" x2="16" y2="12"></line>
    </svg>
);


export const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);

export const FilmIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><line x1="7" x2="7" y1="3" y2="21"></line><line x1="17" x2="17" y1="3" y2="21"></line><line x1="3" x2="21" y1="8" y2="8"></line><line x1="3" x2="21" y1="16" y2="16"></line></svg>
);

export const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>
);

export const LanguagesIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m5 8 6 6"></path><path d="m4 14 6-6 2-3"></path><path d="M2 5h12"></path><path d="M7 2h1"></path><path d="m22 22-5-10-5 10"></path><path d="M14 18h6"></path></svg>
);

export const VideoCameraIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m22 8-6 4 6 4V8Z"></path><rect width="14" height="12" x="2" y="6" rx="2" ry="2"></rect></svg>
);

export const PlayCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>
);


export const CameraIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>
);

export const DialogueIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
);

export const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);

export const PhotoIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>
);

export const PencilIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></svg>
);

export const RefreshCwIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M3 21v-5h5"></path></svg>
);

export const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

export const Trash2Icon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
);

export const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
);

export const DownloadIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
);

export const TargetIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
);

export const StarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
);

export const MailIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
);

export const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m6 9 6 6 6-6"></path></svg>
);

export const LinkIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path></svg>
);

export const ClipboardIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path></svg>
);
