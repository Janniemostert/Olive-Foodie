import classes from './footer.module.css';

export default function Footer() {
    return (
        <footer className={classes.footer}>
            <div className={classes.inner}>
                <p className={classes.brand}>olive_foodie</p>
                <p className={classes.tagline}>frugal foods &amp; finds</p>
                <p className={classes.copy}>&copy; {new Date().getFullYear()} olive_foodie. All rights reserved.</p>
            </div>
        </footer>
    );
}
