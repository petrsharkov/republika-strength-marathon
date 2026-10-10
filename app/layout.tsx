import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Кубок Репаблики Фитнес',description:'Кубок Репаблики Фитнес в Новогорске: 17, 19, 20 и 21 октября 2026. Жим лёжа, подтягивания для мужчин, отжимания от пола для женщин 50 м вольным стилем и кистевой динамометр.',icons:{icon:{url:'/republika-icon-brown.png',type:'image/png'},apple:{url:'/republika-icon-brown.png',type:'image/png'}},manifest:'/manifest.webmanifest',appleWebApp:{capable:true,title:'Репаблика',statusBarStyle:'default'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ru"><body>{children}</body></html>;}
