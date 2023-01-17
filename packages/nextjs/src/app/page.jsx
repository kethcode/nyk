import Image from "next/image";
import Link from "next/link";
import { Inter } from "@next/font/google";
import styles from "./page.module.css";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <>
      <Image src="/landing_25pc_b.png" alt="landing background" layout="fill" />

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
