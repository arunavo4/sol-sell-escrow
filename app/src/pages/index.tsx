import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Layout } from "../components/Layout";
import { Main } from "../components/Main";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, query, orderByValue, limitToLast } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID + ".firebaseapp.com",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DB_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID + ".appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const Home: NextPage = () => {
  const [rpc, setRpc] = useState<string | null>(null);
  const { connection } = useConnection();
  const wallet = useWallet();
  useEffect(() => {
    const toastConnected = async () => {
      if (wallet.connected) {
        const cluster = await connection.getClusterNodes();
        if (rpc !== cluster[0].rpc) {
          toast(`Connected to ${cluster[0].rpc}`);
          setRpc(cluster[0].rpc);
        }
      }
    };
    toastConnected();
  }, [wallet, connection, rpc]);

  const formatRpc = rpc !== null ? `Network: ${rpc}` : "";
  return (
    <Layout formatRpc={formatRpc}>
      <div className="container mx-auto justify-center">
        <Main database={database}/>
      </div>
    </Layout>
  );
};

export default Home;
