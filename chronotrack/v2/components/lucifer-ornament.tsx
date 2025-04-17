interface OrnamentProps {
    type: "pentagram" | "feather" | "wing" | "flame" | "piano"
    className?: string
  }
  
  export default function LuciferOrnament({ type, className = "" }: OrnamentProps) {
    const renderOrnament = () => {
      switch (type) {
        case "pentagram":
          return (
            <svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={className}
            >
              <path
                d="M20,0 L24,16 L40,16 L28,26 L32,40 L20,32 L8,40 L12,26 L0,16 L16,16 Z"
                fill="var(--gold)"
                fillOpacity="0.2"
              />
            </svg>
          )
        case "feather":
          return (
            <svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={className}
            >
              <path
                d="M20,0 C20,0 25,13.333 40,20 C25,26.667 20,40 20,40 C20,40 15,26.667 0,20 C15,13.333 20,0 20,0 Z"
                fill="var(--gold)"
                fillOpacity="0.2"
              />
            </svg>
          )
        case "wing":
          return (
            <svg
              width="60"
              height="40"
              viewBox="0 0 60 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={className}
            >
              <path
                d="M0,20 C10,10 20,5 30,0 C40,5 50,10 60,20 C50,30 40,35 30,40 C20,35 10,30 0,20 Z"
                fill="var(--gold)"
                fillOpacity="0.2"
              />
            </svg>
          )
        case "flame":
          return (
            <svg
              width="30"
              height="40"
              viewBox="0 0 30 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={className}
            >
              <path
                d="M15,0 C15,0 0,15 0,25 C0,35 10,40 15,40 C20,40 30,35 30,25 C30,15 15,0 15,0 Z"
                fill="var(--primary)"
                fillOpacity="0.2"
              />
            </svg>
          )
        case "piano":
          return (
            <svg
              width="60"
              height="20"
              viewBox="0 0 60 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={className}
            >
              <rect x="0" y="0" width="10" height="20" fill="var(--foreground)" fillOpacity="0.2" />
              <rect x="10" y="0" width="10" height="20" fill="var(--foreground)" fillOpacity="0.2" />
              <rect x="20" y="0" width="10" height="20" fill="var(--foreground)" fillOpacity="0.2" />
              <rect x="30" y="0" width="10" height="20" fill="var(--foreground)" fillOpacity="0.2" />
              <rect x="40" y="0" width="10" height="20" fill="var(--foreground)" fillOpacity="0.2" />
              <rect x="50" y="0" width="10" height="20" fill="var(--foreground)" fillOpacity="0.2" />
              <rect x="5" y="0" width="6" height="12" fill="var(--background)" fillOpacity="0.5" />
              <rect x="15" y="0" width="6" height="12" fill="var(--background)" fillOpacity="0.5" />
              <rect x="35" y="0" width="6" height="12" fill="var(--background)" fillOpacity="0.5" />
              <rect x="45" y="0" width="6" height="12" fill="var(--background)" fillOpacity="0.5" />
              <rect x="55" y="0" width="6" height="12" fill="var(--background)" fillOpacity="0.5" />
            </svg>
          )
        default:
          return null
      }
    }
  
    return renderOrnament()
  }
  