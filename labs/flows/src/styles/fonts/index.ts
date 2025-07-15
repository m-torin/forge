import localFont from 'next/font/local';
import { Inter, Lora, Noto_Sans, Work_Sans } from 'next/font/google';

export const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const cal = localFont({
  src: './CalSans-SemiBold.otf',
  variable: '--font-cal',
  weight: '600',
  display: 'swap',
});

export const calTitle = localFont({
  src: './CalSans-SemiBold.otf',
  variable: '--font-title',
  weight: '600',
  display: 'swap',
});

export const lora = Lora({
  variable: '--font-title',
  subsets: ['latin'],
  weight: '600',
  display: 'swap',
});

export const work = Work_Sans({
  variable: '--font-title',
  subsets: ['latin'],
  weight: '600',
  display: 'swap',
});

export const notoSans = Noto_Sans({
  subsets: ['latin'],
  variable: '--font-noto-sans',
  display: 'swap',
});

export const fontMapper = {
  'font-cal': calTitle.variable,
  'font-lora': lora.variable,
  'font-work': work.variable,
  'font-noto-sans': notoSans.variable,
} as Record<string, string>;
