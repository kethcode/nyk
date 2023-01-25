import Image from "next/image";
import Link from "next/link";
import { Inter } from "@next/font/google";
import styles from "./page.module.css";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <>
      <Image
        src="/landing_25pc_d.png"
        alt="landing background"
        fill
		objectFit="cover"
        sizes="	(max-width: 640px) 640px,
					(max-width: 768px) 768px,
					(max-width: 1080px) 1080px,
					(max-width: 1280px) 1280px,
					(max-width: 1536px) 1536px,
					(max-width: 1920px) 1920px,
					(max-width: 2560px) 2560px,
					(max-width: 3840px) 3840px"
      />

      <main className={styles.main}>
        <div className={styles.description}>
          {/* <p>☰</p>
          <p>Wallet</p> */}
        </div>

        <div className={styles.center}>
          <div className={styles.thirteen}>
            Solve puzzles, exploit smart contracts, and protect your winnings
            from other players.
          </div>
        </div>

        <div className={styles.card}>
          <Link href="\" rel="noopener noreferrer">
            <h2>Forge your Identity</h2>
          </Link>
        </div>
      </main>
    </>
  );
}
