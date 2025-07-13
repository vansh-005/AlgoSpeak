  import React, { useState, useEffect } from 'react';
  import ReactDOM from 'react-dom';

  const API = "http://localhost:5000/api/auth";

const Popup = () => {
  const [status, setStatus] = useState("loading");
  const [view, setView] = useState("login");
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [formErr, setFormErr] = useState("");

  // Utility to set/get JWT from storagei
  const setToken = (token) => chrome.storage.local.set({ token });
  const getToken = () => new Promise(res => chrome.storage.local.get('token', v => res(v.token)));

  // On mount, check login
  useEffect(() => {
    getToken().then(token => {
      if (!token) return setStatus("signedout");
      fetch(`${API}/check`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.ok ? setStatus("signedin") : setStatus("signedout"))
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
      await setToken(data.accessToken); // <== Store the token!
      setStatus("signedin");
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


    // UI
    return (
      <div style={{ padding: '16px', width: '300px', fontFamily: 'Arial' }}>
        {status === "loading" && <div>Loading...</div>}

        {status === "signedin" && (
          <>
            <div style={{ marginBottom: 12, fontWeight: 600, color: '#4caf50' }}>
              Signed in
            </div>
            <button
              onClick={handleMicClick}
              style={{background: '#4285f4', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', marginBottom: '10px'}}
            >
              Enable Microphone
            </button>
            <button
              onClick={handleLogout}
              style={{background: '#f5f5f5', color: '#4285f4', border: '1px solid #4285f4', padding: '7px 12px', borderRadius: '4px', marginLeft: 10}}
            >
              Log Out
            </button>
            {error && (
              <div style={{ color: '#d32f2f', marginTop: '12px', fontSize: '14px', lineHeight: '1.5' }}>
                {error}
              </div>
            )}
          </>
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
                <button type="submit" style={{background: '#4285f4', color: 'white', border: 'none', padding: '7px 12px', borderRadius: '4px'}}>
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
                <button type="submit" style={{background: '#4285f4', color: 'white', border: 'none', padding: '7px 12px', borderRadius: '4px'}}>
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

