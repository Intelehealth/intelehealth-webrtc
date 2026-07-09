import type { SVGProps } from 'react';

export const AcceptCallIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M25.6667 19.7408V23.2408C25.668 23.5657 25.6014 23.8873 25.4713 24.185C25.3411 24.4827 25.1502 24.7499 24.9108 24.9696C24.6713 25.1893 24.3887 25.3565 24.0809 25.4606C23.7731 25.5647 23.4469 25.6033 23.1233 25.5741C19.5333 25.184 16.0848 23.9573 13.055 21.9924C10.2361 20.2012 7.84623 17.8113 6.055 14.9924C4.08331 11.9488 2.85629 8.48359 2.47334 4.87743C2.44418 4.55481 2.48252 4.22965 2.58592 3.92266C2.68932 3.61567 2.8555 3.33357 3.0739 3.09432C3.29229 2.85508 3.55811 2.66393 3.85443 2.53304C4.15074 2.40215 4.47107 2.3344 4.795 2.3341H8.295C8.86119 2.32852 9.41009 2.52902 9.83939 2.89822C10.2687 3.26742 10.5491 3.78012 10.6283 4.34076C10.7761 5.46084 11.05 6.56061 11.445 7.6191C11.602 8.03668 11.6359 8.4905 11.5429 8.92679C11.4498 9.36308 11.2337 9.76356 10.92 10.0808L9.43834 11.5624C11.0992 14.4832 13.5175 16.9016 16.4383 18.5624L17.92 17.0808C18.2372 16.7671 18.6377 16.5509 19.074 16.4579C19.5103 16.3648 19.9641 16.3988 20.3817 16.5558C21.4402 16.9507 22.5399 17.2247 23.66 17.3724C24.2267 17.4524 24.7443 17.7378 25.1143 18.1745C25.4843 18.6112 25.6809 19.1686 25.6667 19.7408Z"
      stroke="currentColor"
      strokeWidth="2.33333"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const DeclineCallIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M10.6799 13.3101C11.6948 14.3258 12.8418 15.2004 14.0899 15.9101L15.3599 14.6401C15.6318 14.3712 15.9751 14.1859 16.3491 14.1062C16.723 14.0264 17.112 14.0556 17.4699 14.1901C18.3772 14.5286 19.3199 14.7635 20.2799 14.8901C20.7605 14.958 21.1999 15.1984 21.5164 15.5663C21.8329 15.9343 22.0047 16.4048 21.9999 16.8901V19.8901C22.0011 20.1686 21.944 20.4443 21.8324 20.6994C21.7209 20.9546 21.5572 21.1837 21.352 21.372C21.1468 21.5602 20.9045 21.7036 20.6407 21.7928C20.3769 21.882 20.0973 21.9152 19.8199 21.8901C16.7428 21.5557 13.7869 20.5042 11.1899 18.8201C9.9852 18.0552 8.86846 17.1597 7.85993 16.1501M5.18993 12.8101C3.50579 10.2131 2.45429 7.25726 2.11993 4.1801C2.09494 3.90356 2.12781 3.62486 2.21643 3.36172C2.30506 3.09859 2.4475 2.85679 2.6347 2.65172C2.82189 2.44665 3.04974 2.28281 3.30372 2.17062C3.55771 2.05843 3.83227 2.00036 4.10993 2.0001H7.10993C7.59524 1.99532 8.06572 2.16718 8.43369 2.48363C8.80166 2.80008 9.04201 3.23954 9.10993 3.7201C9.23656 4.68016 9.47138 5.62282 9.80993 6.5301C9.94448 6.88802 9.9736 7.27701 9.89384 7.65098C9.81408 8.02494 9.6288 8.36821 9.35993 8.6401L8.08993 9.9101" />
    <path d="M22 2L2 22" />
  </svg>
);

export const EndCallIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M21.4724 13.7769C21.719 12.7518 21.4152 11.6619 20.6797 10.9319C18.8243 9.09159 15.7379 8.17629 11.5062 8.21283C7.28034 8.24927 4.1801 9.21504 2.29252 11.0824C1.53853 11.8284 1.21547 12.9299 1.45048 13.9559L1.72404 15.1531C1.94724 16.1295 2.86344 16.7826 3.85591 16.6726L6.03599 16.4295C6.88755 16.3346 7.59376 15.7054 7.79293 14.8614L8.28411 12.7877C8.41569 12.2488 8.99595 12.0497 9.21465 11.9739C9.74442 11.7914 10.506 11.6953 11.4776 11.6864C13.5624 11.6684 14.1081 12.0723 14.2874 12.2047C14.4791 12.3466 14.6134 12.554 14.6649 12.7899L15.1073 14.7976C15.2925 15.6377 15.9884 16.2554 16.8385 16.3351L19.0252 16.5405C20.0191 16.634 20.9476 15.9599 21.1842 14.9771L21.4724 13.7769Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeMiterlimit="10"
    />
  </svg>
);

export const MaximizeIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M9 4H4V9M15 4H20V9M9 20H4V15M15 20H20V15"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const MicIcon = ({ on }: { on: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2" width="6" height="11" rx="3" />
    <path d="M5 10v1a7 7 0 0 0 14 0v-1" />
    <line x1="12" y1="19" x2="12" y2="22" />
    {!on && <line x1="3" y1="3" x2="21" y2="21" />}
  </svg>
);

export const VideoIcon = ({ on }: { on: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="14" height="12" rx="2" />
    <path d="m22 8-6 4 6 4V8Z" />
    {!on && <line x1="3" y1="3" x2="21" y2="21" />}
  </svg>
);

export const CheckIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const SwitchCameraIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M11 19H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5l2-3h2l2 3h5a2 2 0 0 1 2 2v6" />
    <path d="M15.5 15.5 18 18l2.5-2.5" />
    <path d="M18 13a4 4 0 0 0-4 4" />
  </svg>
);

export const MinimizeIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="4 14 10 14 10 20" />
    <polyline points="20 10 14 10 14 4" />
    <line x1="14" y1="10" x2="21" y2="3" />
    <line x1="3" y1="21" x2="10" y2="14" />
  </svg>
);
