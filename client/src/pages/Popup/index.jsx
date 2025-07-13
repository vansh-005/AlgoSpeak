import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

const API = "http://localhost:5000/api/auth";

const Popup = () => {
  const [status, setStatus] = useState("loading");
  const [view, setView] = useState("login");
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [formErr, setFormErr] = useState("");
  const [username, setUsername] = useState(""); // for showing in signed-in UI

  // JWT utils
  const setToken = (token) => chrome.storage.local.set({ token });
  const getToken = () => new Promise(res => chrome.storage.local.get('token', v => res(v.token)));

  // On mount, check login status
  useEffect(() => {
    getToken().then(token => {
      if (!token) return setStatus("signedout");
      fetch(`${API}/check`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => {
          setStatus("signedin");
          setUsername(data?.username || "User"); // Set username if provided by API
        })
        .catch(() => setStatus("signedout"));
    });
  }, []);

  const handleInput = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setFormErr("");
    try {
      const res = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      setView("login");
      setFormErr("Registered! Please sign in.");
    } catch (err) {
      setFormErr(err.message);
    }
  };

  // Signin
  const handleSignin = async (e) => {
    e.preventDefault();
    setFormErr("");
    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: form.username, password: form.password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      await setToken(data.accessToken);
      setStatus("signedin");
      setUsername(form.username);
      setForm({ username: "", email: "", password: "" });
      setFormErr("");
    } catch (err) {
      setFormErr(err.message);
    }
  };

  // Logout
  const handleLogout = async () => {
    await chrome.storage.local.remove('token');
    setStatus("signedout");
    setView("login");
  };

  // Placeholder: Implement mic logic
  const handleMicClick = () => {
    alert("Mic feature coming soon!");
  };

  // --- UI ---
  return (
    <div style={{ padding: 18, width: 320, minHeight: 260, fontFamily: 'Arial, sans-serif', background: '#fff' }}>
      {status === "loading" && <div>Loading...</div>}

      {status === "signedin" && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
          <div style={{
            background: '#e6f4ea',
            borderRadius: '50%',
            width: 64,
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16
          }}>
            <svg height="36" width="36" viewBox="0 0 24 24" fill="none" stroke="#38b34a" strokeWidth="3.2"
              strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 10.8 17 4 11" />
            </svg>
          </div>
          <div style={{ fontWeight: 700, color: '#388e3c', fontSize: 20, marginBottom: 6 }}>
            Welcome, <span style={{ color: "#222" }}>{username}</span>!
          </div>
          <div style={{ color: "#333", fontSize: 15, marginBottom: 12, textAlign: 'center' }}>
            You're signed in.<br />
            Go to a LeetCode problem and use AlgoSpeak features!
          </div>
          <button
            onClick={handleMicClick}
            style={{
              background: '#4285f4',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              marginBottom: 10,
              width: "100%",
              fontSize: 15
            }}
          >
            Enable Microphone
          </button>
          <button
            onClick={handleLogout}
            style={{
              background: '#f5f5f5',
              color: '#4285f4',
              border: '1px solid #4285f4',
              padding: '7px 12px',
              borderRadius: '4px',
              width: "100%",
              fontSize: 15
            }}
          >
            Log Out
          </button>
          {formErr && (
            <div style={{ color: '#d32f2f', marginTop: '12px', fontSize: '14px', lineHeight: '1.5' }}>
              {formErr}
            </div>
          )}
        </div>
      )}

      {status === "signedout" && (
        <>
          {view === "login" ? (
            <form onSubmit={handleSignin} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ marginBottom: 5, fontWeight: 600 }}>Sign In to use AlgoSpeak:</div>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={form.username}
                onChange={handleInput}
                required
                style={{ padding: '7px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleInput}
                required
                style={{ padding: '7px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
              <button type="submit" style={{ background: '#4285f4', color: 'white', border: 'none', padding: '7px 12px', borderRadius: '4px' }}>
                Sign In
              </button>
              <span style={{ fontSize: 13, color: '#888', cursor: 'pointer' }} onClick={() => setView("signup")}>
                New user? Sign Up
              </span>
              {formErr && <div style={{ color: '#d32f2f', fontSize: 13 }}>{formErr}</div>}
            </form>
          ) : (
            <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ marginBottom: 5, fontWeight: 600 }}>Sign Up for AlgoSpeak:</div>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={form.username}
                onChange={handleInput}
                required
                style={{ padding: '7px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleInput}
                required
                style={{ padding: '7px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleInput}
                required
                style={{ padding: '7px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
              <button type="submit" style={{ background: '#4285f4', color: 'white', border: 'none', padding: '7px 12px', borderRadius: '4px' }}>
                Sign Up
              </button>
              <span style={{ fontSize: 13, color: '#888', cursor: 'pointer' }} onClick={() => setView("login")}>
                Already have an account? Sign In
              </span>
              {formErr && <div style={{ color: '#d32f2f', fontSize: 13 }}>{formErr}</div>}
            </form>
          )}
        </>
      )}
    </div>
  );
};

ReactDOM.render(<Popup />, document.getElementById('root'));
