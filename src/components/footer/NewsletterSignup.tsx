"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export default function NewsletterSignup() {
    const [email, setEmail] = useState("");

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const value = email.trim();
        if (!value) return;
        
        setEmail("");
    };

    return (
        <form onSubmit={onSubmit} className="mt-3 flex gap-2">
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ایمیل شما"
                className="flex-1 h-11 rounded-2xl bg-gray-100 border border-gray-200 px-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            />
            <button
                type="submit"
                className="h-11 px-4 rounded-2xl bg-gray-900 text-white text-sm font-extrabold hover:bg-black transition inline-flex items-center gap-2"
            >
                <Send className="w-4 h-4" />
                ثبت
            </button>
        </form>
    );
}
