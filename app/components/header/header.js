import Link from 'next/link'
import Image from 'next/image'
import LogoImg from '@/assets/olive_foodie_logo.png'
import classes from './header.module.css'
import HeaderBackground from './header-background'
import NavLink from './nav-link'
import AuthNav from './auth-nav'
import MobileMenu from './mobile-menu'


export default function Header () {
    return (
        <div className={classes.headerWrap}>
            <HeaderBackground/>
            <div className={classes.authBar}>
                <AuthNav />
            </div>
            <header className={classes.header}>
                <Link href="/" className={classes.logo}>
                    <div className={classes.logoImg}>
                        <Image src={LogoImg} alt="Olive Foodie" priority fill style={{ objectFit: 'contain' }} />
                    </div>
                </Link>
                <nav className={classes.nav}>
                    <ul>
                        <li><NavLink href="/meals">Browse Recipes</NavLink></li>
                        <li><NavLink href="/posts">Tips, Tricks &amp; News</NavLink></li>
                    </ul>
                </nav>
                <div className={classes.mobileMenuWrap}>
                    <MobileMenu />
                </div>
            </header>
        </div>
    )
}