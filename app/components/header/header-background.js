import classes from './header-background.module.css'

export default function HeaderBackground () {
    return (
        <div className={classes["header-background"]}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop
                  offset="0%"
                  style={{ stopColor: '#8A9E1A', stopOpacity: '1' }}
                />
                <stop
                  offset="40%"
                  style={{ stopColor: '#5F7103', stopOpacity: '1' }}
                />
                <stop
                  offset="100%"
                  style={{ stopColor: '#3a4a02', stopOpacity: '1' }}
                />
              </linearGradient>
            </defs>
            <path
              fill="url(#gradient)"
              d="M0,295 Q720,320 1440,295 L1440,0 L0,0 Z"
            ></path>
          </svg>
        </div>
    )
}