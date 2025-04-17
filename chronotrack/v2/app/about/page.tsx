import LuciferHeader from "@/components/lucifer-header"
import LuciferFooter from "@/components/lucifer-footer"
import LuciferImage from "@/components/lucifer-image"

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <LuciferHeader activePage="dashboard" />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="card lucifer-border chiaroscuro p-8">
            <div className="mb-6 text-center">
              <h2 className="text-3xl font-bold text-[#d4af37] mb-2">About Infernal Chronos</h2>
              <p className="text-lg opacity-70 italic">Time tracking inspired by the Lord of Hell</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="mb-4">
                  Infernal Chronos is a time tracking application inspired by Lucifer Morningstar from the Vertigo
                  comics. It combines elegant design with powerful functionality to help you track your working hours
                  and earnings.
                </p>

                <p className="mb-4">
                  The application features a duocolor theme of red and black, with gold accents, creating a dramatic
                  chiaroscuro effect reminiscent of Lucifer's aesthetic in the comics.
                </p>

                <p className="mb-4">
                  Throughout the interface, you'll find subtle references to Lucifer's character - from feather
                  animations symbolizing his fallen angel status to piano keys representing his love for music at Lux
                  nightclub.
                </p>

                <p className="mb-4">
                  Hidden messages and pentagram motifs are scattered throughout the application, rewarding the observant
                  user with easter eggs that enhance the thematic experience.
                </p>

                <div className="infernal-divider"></div>

                <p className="text-center text-[#d4af37] font-serif text-lg italic mt-6">
                  "Time is the only true currency in the mortal realm."
                </p>
              </div>

              <LuciferImage />
            </div>
          </div>
        </div>
      </main>

      <LuciferFooter />
    </div>
  )
}
