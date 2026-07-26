import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/client";

export default function GoogleLoginButton() {
  const buttonRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!window.google || !buttonRef.current) return;

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: async (response) => {
        try {
          const { data } = await apiClient.post("/auth/google", {
            id_token: response.credential,
          });
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          window.location.href = "/";
        } catch (err) {
          console.error("Erreur connexion Google", err);
        }
      },
    });

    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: "filled_black",
      size: "large",
      width: 280,
    });
  }, [navigate]);

  return <div ref={buttonRef} style={{ marginTop: 16, display: "flex", justifyContent: "center" }} />;
}