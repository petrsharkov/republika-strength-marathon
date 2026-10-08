import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Республика фитнес · Силовой марафон',description:'Силовой марафон в Новогорске: 17, 19, 20 и 21 октября 2026. Жим лёжа, подтягивания для мужчин, отжимания от пола для женщин и 50 м вольным стилем.',icons:{icon:{url:'/republika-icon-brown.png',type:'image/png'},apple:{url:'/republika-icon-brown.png',type:'image/png'}},manifest:'/manifest.webmanifest',appleWebApp:{capable:true,title:'Республика',statusBarStyle:'default'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ru"><body>{children}</body></html>;}
