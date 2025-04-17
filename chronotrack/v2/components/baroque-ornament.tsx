interface OrnamentProps {
    type: "corner-tl" | "corner-tr" | "corner-bl" | "corner-br" | "divider" | "flourish"
    className?: string
  }
  
  export default function BaroqueOrnament({ type, className = "" }: OrnamentProps) {
    const renderOrnament = () => {
      switch (type) {
        case "corner-tl":
          return (
            <svg
              width="60"
              height="60"
              viewBox="0 0 60 60"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={`absolute top-0 left-0 ${className}`}
            >
              <path
                d="M60 0C60 33.1371 33.1371 60 0 60V50C27.6142 50 50 27.6142 50 0H60Z"
                fill="var(--gold)"
                fillOpacity="0.1"
              />
              <path d="M0 60C0 26.8629 26.8629 0 60 0" stroke="var(--gold)" strokeOpacity="0.3" strokeWidth="1" />
              <path d="M10 60C10 32.3858 32.3858 10 60 10" stroke="var(--gold)" strokeOpacity="0.3" strokeWidth="1" />
            </svg>
          )
        case "corner-tr":
          return (
            <svg
              width="60"
              height="60"
              viewBox="0 0 60 60"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={`absolute top-0 right-0 rotate-90 ${className}`}
            >
              <path
                d="M60 0C60 33.1371 33.1371 60 0 60V50C27.6142 50 50 27.6142 50 0H60Z"
                fill="var(--gold)"
                fillOpacity="0.1"
              />
              <path d="M0 60C0 26.8629 26.8629 0 60 0" stroke="var(--gold)" strokeOpacity="0.3" strokeWidth="1" />
              <path d="M10 60C10 32.3858 32.3858 10 60 10" stroke="var(--gold)" strokeOpacity="0.3" strokeWidth="1" />
            </svg>
          )
        case "corner-bl":
          return (
            <svg
              width="60"
              height="60"
              viewBox="0 0 60 60"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={`absolute bottom-0 left-0 -rotate-90 ${className}`}
            >
              <path
                d="M60 0C60 33.1371 33.1371 60 0 60V50C27.6142 50 50 27.6142 50 0H60Z"
                fill="var(--gold)"
                fillOpacity="0.1"
              />
              <path d="M0 60C0 26.8629 26.8629 0 60 0" stroke="var(--gold)" strokeOpacity="0.3" strokeWidth="1" />
              <path d="M10 60C10 32.3858 32.3858 10 60 10" stroke="var(--gold)" strokeOpacity="0.3" strokeWidth="1" />
            </svg>
          )
        case "corner-br":
          return (
            <svg
              width="60"
              height="60"
              viewBox="0 0 60 60"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={`absolute bottom-0 right-0 rotate-180 ${className}`}
            >
              <path
                d="M60 0C60 33.1371 33.1371 60 0 60V50C27.6142 50 50 27.6142 50 0H60Z"
                fill="var(--gold)"
                fillOpacity="0.1"
              />
              <path d="M0 60C0 26.8629 26.8629 0 60 0" stroke="var(--gold)" strokeOpacity="0.3" strokeWidth="1" />
              <path d="M10 60C10 32.3858 32.3858 10 60 10" stroke="var(--gold)" strokeOpacity="0.3" strokeWidth="1" />
            </svg>
          )
        case "divider":
          return (
            <div className={`baroque-divider ${className}`}>
              <svg
                width="40"
                height="20"
                viewBox="0 0 40 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-4"
              >
                <path d="M20 0C20 0 16 10 8 10C0 10 0 20 0 20" stroke="var(--gold)" strokeOpacity="0.5" strokeWidth="1" />
                <path
                  d="M20 0C20 0 24 10 32 10C40 10 40 20 40 20"
                  stroke="var(--gold)"
                  strokeOpacity="0.5"
                  strokeWidth="1"
                />
                <circle cx="20" cy="10" r="4" fill="var(--gold)" fillOpacity="0.2" />
                <circle cx="20" cy="10" r="2" fill="var(--gold)" fillOpacity="0.4" />
              </svg>
            </div>
          )
        case "flourish":
          return (
            <svg
              width="100"
              height="30"
              viewBox="0 0 100 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={className}
            >
              <path
                d="M0 15C0 15 20 0 50 0C80 0 100 15 100 15C100 15 80 30 50 30C20 30 0 15 0 15Z"
                fill="var(--gold)"
                fillOpacity="0.05"
              />
              <path
                d="M0 15C0 15 20 5 50 5C80 5 100 15 100 15C100 15 80 25 50 25C20 25 0 15 0 15Z"
                stroke="var(--gold)"
                strokeOpacity="0.3"
                strokeWidth="1"
              />
              <circle cx="50" cy="15" r="5" fill="var(--gold)" fillOpacity="0.1" />
              <circle cx="50" cy="15" r="3" stroke="var(--gold)" strokeOpacity="0.3" strokeWidth="1" />
            </svg>
          )
        default:
          return null
      }
    }
  
    return renderOrnament()
  }
  