import { redirect, RedirectType } from 'next/navigation';

export default function Home() {
  redirect('/upload', RedirectType.replace);
}
