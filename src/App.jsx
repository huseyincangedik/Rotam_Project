// --- ADMİN --- (Mevcut App.jsx'teki Admin fonksiyonunu bununla değiştir)
function Admin() {
  const navigate = useNavigate();
  const [creds, setCreds] = useState({ user: "", pass: "" });
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [schoolName, setSchoolName] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");

  // Data states
  const [statistics, setStatistics] = useState(null);
  const [students, setStudents] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [filteredSchool, setFilteredSchool] = useState("");
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Soru yönetimi
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [newQuestion, setNewQuestion] = useState({
    questionText: "",
    options: [
      { optionText: "", areaTag: "" },
      { optionText: "", areaTag: "" },
      { optionText: "", areaTag: "" },
      { optionText: "", areaTag: "" }
    ]
  });

  const authHeaders = { Authorization: `Bearer ${token}` };

  const handleLogin = async () => {
    if (!creds.user || !creds.pass) {
      alert("Kullanıcı adı ve şifre gerekli!");
      return;
    }
    try {
      const res = await axios.post(`${API}/api/auth/login`, {
        username: creds.user,
        password: creds.pass
      });
      const jwt = res.data.token;
      setToken(jwt);
      const adminRes = await axios.get(`${API}/api/admin/me`, {
        headers: { Authorization: `Bearer ${jwt}` }
      });
      setRole(adminRes.data.role);
      setSchoolName(adminRes.data.schoolName ?? "");
    } catch {
      alert("Giriş başarısız! Kullanıcı adı veya şifre hatalı.");
    }
  };

  // İstatistikleri yükle
  const loadStatistics = async () => {
    setLoadingStats(true);
    try {
      const res = await axios.get(`${API}/api/admin/statistics`, { headers: authHeaders });
      setStatistics(res.data);
    } catch {
      alert("İstatistikler yüklenemedi!");
    }
    setLoadingStats(false);
  };

  // Öğrencileri yükle
  const loadStudents = async (school = "") => {
    setLoadingStudents(true);
    try {
      let res;
      if (role === "SCHOOL_ADMIN") {
        res = await axios.get(`${API}/api/admin/students/${schoolName}`, { headers: authHeaders });
      } else if (school) {
        res = await axios.get(`${API}/api/admin/students/${school}`, { headers: authHeaders });
      } else {
        res = await axios.get(`${API}/api/admin/students`, { headers: authHeaders });
      }
      setStudents(res.data);
    } catch {
      alert("Öğrenciler yüklenemedi!");
    }
    setLoadingStudents(false);
  };

  // Soruları yükle
  const loadQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const res = await axios.get(`${API}/api/questions/active`, { headers: authHeaders });
      setQuestions(res.data);
    } catch {
      alert("Sorular yüklenemedi!");
    }
    setLoadingQuestions(false);
  };

  // Tab değişince veri yükle
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "dashboard" && !statistics) loadStatistics();
    if (tab === "students" && students.length === 0) loadStudents();
    if (tab === "questions" && questions.length === 0) loadQuestions();
  };

  // İlk giriş sonrası dashboard yükle
  useEffect(() => {
    if (token && role === "SUPER_ADMIN") loadStatistics();
  }, [token, role]);

  // Excel indir
  const handleDownload = () => {
    const url = role === "SCHOOL_ADMIN"
      ? `${API}/api/admin/report/excel/${schoolName}`
      : `${API}/api/admin/report/excel`;
    axios.get(url, { headers: authHeaders, responseType: "blob" })
      .then(res => {
        const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = role === "SCHOOL_ADMIN" ? `${schoolName}_rapor.xlsx` : "tum_rapor.xlsx";
        a.click();
      }).catch(() => alert("Veri indirilemedi!"));
  };

  // Soru sil
  const handleDeleteQuestion = async (id) => {
    if (!window.confirm("Bu soruyu silmek istediğinizden emin misiniz?")) return;
    try {
      await axios.delete(`${API}/api/admin/questions/${id}`, { headers: authHeaders });
      setQuestions(questions.filter(q => q.id !== id));
    } catch {
      alert("Soru silinemedi!");
    }
  };

  // Soru ekle
  const handleAddQuestion = async () => {
    if (!newQuestion.questionText.trim()) {
      alert("Soru metni boş olamaz!");
      return;
    }
    try {
      const res = await axios.post(`${API}/api/admin/questions`, newQuestion, { headers: authHeaders });
      setQuestions([...questions, res.data]);
      setShowAddQuestion(false);
      setNewQuestion({
        questionText: "",
        options: [
          { optionText: "", areaTag: "" },
          { optionText: "", areaTag: "" },
          { optionText: "", areaTag: "" },
          { optionText: "", areaTag: "" }
        ]
      });
    } catch {
      alert("Soru eklenemedi!");
    }
  };

  // Soru güncelle
  const handleUpdateQuestion = async () => {
    try {
      const res = await axios.put(`${API}/api/admin/questions/${editingQuestion.id}`, editingQuestion, { headers: authHeaders });
      setQuestions(questions.map(q => q.id === editingQuestion.id ? res.data : q));
      setEditingQuestion(null);
    } catch {
      alert("Soru güncellenemedi!");
    }
  };

  // Okul listesi (öğrencilerden unique)
  const uniqueSchools = [...new Set(students.map(s => s.schoolName).filter(Boolean))];

  const filteredStudents = filteredSchool
    ? students.filter(s => s.schoolName === filteredSchool)
    : students;

  // Alan renkleri
  const areaColors = {
    "Backend": "#0ea5e9",
    "Frontend": "#14b8a6",
    "Mobil": "#8b5cf6",
    "Siber": "#ef4444",
    "AI": "#f59e0b",
  };

  // --- GİRİŞ EKRANI ---
  if (!token) {
    return (
      <div className="admin-page-wrapper">
        <div className="card dark-card admin-card">
          <h1 className="title dark-title">🛠️ Yönetici Paneli</h1>
          <p className="subtitle dark-subtitle">Giriş yapın</p>
          <div className="input-group admin-input-group">
            <input placeholder="Kullanıcı Adı" onChange={e => setCreds({ ...creds, user: e.target.value })} />
            <input type="password" placeholder="Şifre" onChange={e => setCreds({ ...creds, pass: e.target.value })} />
          </div>
          <button className="btn primary-btn" onClick={handleLogin}>GİRİŞ YAP</button>
          <button className="btn admin-btn" onClick={() => navigate("/")}>← Geri Dön</button>
        </div>
      </div>
    );
  }

  // --- SCHOOL ADMIN (sadece indirme) ---
  if (role === "SCHOOL_ADMIN") {
    return (
      <div className="admin-page-wrapper">
        <div className="card dark-card admin-card">
          <h1 className="title dark-title">🛠️ Yönetici Paneli</h1>
          <div className="role-badge school-badge">🏫 Okul Admini</div>
          <p className="subtitle dark-subtitle">
            <strong style={{ color: "#14b8a6" }}>{schoolName}</strong> okuluna ait veriler
          </p>
          <button className="btn primary-btn" onClick={handleDownload}>⬇️ OKUL VERİSİNİ İNDİR</button>

          {/* Okul öğrenci listesi */}
          <button className="btn admin-btn" style={{ marginTop: 8 }}
            onClick={() => { handleTabChange("students"); setActiveTab("school-students"); loadStudents(); }}>
            📋 Öğrenci Listesini Gör
          </button>

          {activeTab === "school-students" && (
            <div style={{ marginTop: 16 }}>
              {loadingStudents ? (
                <p style={{ color: "#94a3b8", textAlign: "center" }}>Yükleniyor...</p>
              ) : (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Ad Soyad</th>
                        <th>No</th>
                        <th>Sonuç</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map(s => (
                        <tr key={s.id}>
                          <td>{s.firstName} {s.lastName}</td>
                          <td>{s.schoolNumber}</td>
                          <td>
                            <span className="area-badge" style={{ background: areaColors[s.result] + "22", color: areaColors[s.result] || "#94a3b8", border: `1px solid ${areaColors[s.result] || "#94a3b8"}` }}>
                              {s.result || "—"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          <button className="btn admin-btn" style={{ marginTop: 8 }} onClick={() => navigate("/")}>← Geri Dön</button>
        </div>
      </div>
    );
  }

  // --- SUPER ADMIN ---
  return (
    <div className="admin-page-wrapper" style={{ alignItems: "flex-start", paddingTop: 20 }}>
      <div style={{ width: "95%", maxWidth: 900, margin: "0 auto" }}>

        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, padding: "0 4px" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 900, color: "white" }}>🛠️ Yönetici Paneli</h1>
            <div className="role-badge developer-badge" style={{ marginTop: 4 }}>🧑‍💻 Yazılımcı Admini</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn primary-btn" style={{ width: "auto", padding: "8px 16px", marginTop: 0 }} onClick={handleDownload}>⬇️ Excel</button>
            <button className="btn admin-btn" style={{ width: "auto", padding: "8px 16px", marginTop: 0 }} onClick={() => navigate("/")}>← Çıkış</button>
          </div>
        </div>

        {/* TAB NAVİGASYON */}
        <div className="admin-tabs">
          {[
            { key: "dashboard", label: "📊 İstatistikler" },
            { key: "students", label: "📋 Öğrenciler" },
            { key: "questions", label: "❓ Sorular" },
          ].map(tab => (
            <button
              key={tab.key}
              className={`admin-tab-btn ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => handleTabChange(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── DASHBOARD TAB ── */}
        {activeTab === "dashboard" && (
          <div className="card dark-card" style={{ marginTop: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
            {loadingStats ? (
              <p style={{ color: "#94a3b8", textAlign: "center", padding: 40 }}>Yükleniyor...</p>
            ) : statistics ? (
              <div>
                {/* Özet kartlar */}
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-number">{statistics.totalStudents ?? 0}</div>
                    <div className="stat-label">Toplam Öğrenci</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">{statistics.totalSchools ?? 0}</div>
                    <div className="stat-label">Okul Sayısı</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">{statistics.totalResponses ?? 0}</div>
                    <div className="stat-label">Toplam Yanıt</div>
                  </div>
                </div>

                {/* Alan dağılımı */}
                {statistics.areaCounts && (
                  <div style={{ marginTop: 24 }}>
                    <h3 style={{ color: "#14b8a6", marginBottom: 12, fontSize: "1rem" }}>Alan Dağılımı</h3>
                    {Object.entries(statistics.areaCounts).map(([area, count]) => {
                      const total = Object.values(statistics.areaCounts).reduce((a, b) => a + b, 0);
                      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                      return (
                        <div key={area} style={{ marginBottom: 12 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{ color: areaColors[area] || "#e2e8f0", fontWeight: 700 }}>{area}</span>
                            <span style={{ color: "#94a3b8" }}>{count} öğrenci ({pct}%)</span>
                          </div>
                          <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 20, height: 10 }}>
                            <div style={{
                              height: "100%", borderRadius: 20,
                              background: areaColors[area] || "#14b8a6",
                              width: `${pct}%`, transition: "width 0.6s ease"
                            }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Okul bazlı dağılım */}
                {statistics.schoolCounts && (
                  <div style={{ marginTop: 24 }}>
                    <h3 style={{ color: "#14b8a6", marginBottom: 12, fontSize: "1rem" }}>Okul Bazlı Katılım</h3>
                    <div className="admin-table-wrapper">
                      <table className="admin-table">
                        <thead>
                          <tr><th>Okul</th><th>Öğrenci Sayısı</th></tr>
                        </thead>
                        <tbody>
                          {Object.entries(statistics.schoolCounts).map(([school, count]) => (
                            <tr key={school}>
                              <td>{school}</td>
                              <td><span style={{ color: "#14b8a6", fontWeight: 700 }}>{count}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: 40 }}>
                <p style={{ color: "#94a3b8" }}>İstatistikler yüklenemedi.</p>
                <button className="btn primary-btn" style={{ width: "auto", padding: "8px 20px" }} onClick={loadStatistics}>Yeniden Dene</button>
              </div>
            )}
          </div>
        )}

        {/* ── ÖĞRENCİLER TAB ── */}
        {activeTab === "students" && (
          <div className="card dark-card" style={{ marginTop: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
            {/* Filtre */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
              <select
                className="admin-select"
                value={filteredSchool}
                onChange={e => setFilteredSchool(e.target.value)}
              >
                <option value="">🏫 Tüm Okullar</option>
                {uniqueSchools.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                {filteredStudents.length} öğrenci gösteriliyor
              </span>
            </div>

            {loadingStudents ? (
              <p style={{ color: "#94a3b8", textAlign: "center", padding: 40 }}>Yükleniyor...</p>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Ad Soyad</th>
                      <th>Okul</th>
                      <th>Öğrenci No</th>
                      <th>Sonuç</th>
                      <th>Tarih</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length === 0 ? (
                      <tr><td colSpan={6} style={{ textAlign: "center", color: "#94a3b8", padding: 20 }}>Öğrenci bulunamadı</td></tr>
                    ) : filteredStudents.map((s, i) => (
                      <tr key={s.id}>
                        <td style={{ color: "#64748b" }}>{i + 1}</td>
                        <td>{s.firstName} {s.lastName}</td>
                        <td style={{ color: "#94a3b8" }}>{s.schoolName}</td>
                        <td style={{ color: "#94a3b8" }}>{s.schoolNumber}</td>
                        <td>
                          <span className="area-badge" style={{
                            background: (areaColors[s.result] || "#94a3b8") + "22",
                            color: areaColors[s.result] || "#94a3b8",
                            border: `1px solid ${areaColors[s.result] || "#94a3b8"}`
                          }}>
                            {s.result || "—"}
                          </span>
                        </td>
                        <td style={{ color: "#64748b", fontSize: "0.75rem" }}>
                          {s.createdAt ? new Date(s.createdAt).toLocaleDateString("tr-TR") : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── SORULAR TAB ── */}
        {activeTab === "questions" && (
          <div className="card dark-card" style={{ marginTop: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ color: "#14b8a6", margin: 0 }}>Aktif Sorular ({questions.length})</h3>
              <button className="btn primary-btn" style={{ width: "auto", padding: "8px 16px", marginTop: 0 }}
                onClick={() => setShowAddQuestion(true)}>
                + Soru Ekle
              </button>
            </div>

            {loadingQuestions ? (
              <p style={{ color: "#94a3b8", textAlign: "center", padding: 40 }}>Yükleniyor...</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {questions.map((q, idx) => (
                  <div key={q.id} className="question-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <span style={{ color: "#64748b", fontSize: "0.75rem" }}>Soru {idx + 1}</span>
                        <p style={{ color: "#e2e8f0", fontWeight: 700, margin: "4px 0 8px", fontSize: "0.95rem" }}>{q.questionText}</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {q.options?.map(opt => (
                            <span key={opt.id} className="option-chip">
                              {opt.optionText}
                              {opt.areaTag && <span style={{ color: areaColors[opt.areaTag] || "#14b8a6", marginLeft: 4 }}>({opt.areaTag})</span>}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                        <button className="icon-btn edit-btn" onClick={() => setEditingQuestion({ ...q })}>✏️</button>
                        <button className="icon-btn delete-btn" onClick={() => handleDeleteQuestion(q.id)}>🗑️</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* SORU EKLEME MODALI */}
            {showAddQuestion && (
              <div className="modal-overlay" onClick={() => setShowAddQuestion(false)}>
                <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
                  <h2 className="modal-title">Yeni Soru Ekle</h2>
                  <input
                    placeholder="Soru metni"
                    value={newQuestion.questionText}
                    onChange={e => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
                    style={{ width: "100%", marginBottom: 12, boxSizing: "border-box" }}
                  />
                  <p style={{ color: "#94a3b8", fontSize: "0.8rem", marginBottom: 8 }}>Seçenekler:</p>
                  {newQuestion.options.map((opt, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, marginBottom: 8 }}>
                      <input
                        placeholder={`Seçenek ${i + 1} metni`}
                        value={opt.optionText}
                        onChange={e => {
                          const opts = [...newQuestion.options];
                          opts[i] = { ...opts[i], optionText: e.target.value };
                          setNewQuestion({ ...newQuestion, options: opts });
                        }}
                      />
                      <select
                        className="admin-select"
                        value={opt.areaTag}
                        onChange={e => {
                          const opts = [...newQuestion.options];
                          opts[i] = { ...opts[i], areaTag: e.target.value };
                          setNewQuestion({ ...newQuestion, options: opts });
                        }}
                      >
                        <option value="">Alan</option>
                        {["Backend", "Frontend", "Mobil", "Siber", "AI"].map(a => (
                          <option key={a} value={a}>{a}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                  <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                    <button className="btn primary-btn" style={{ flex: 1 }} onClick={handleAddQuestion}>Kaydet</button>
                    <button className="btn admin-btn" style={{ flex: 1 }} onClick={() => setShowAddQuestion(false)}>İptal</button>
                  </div>
                </div>
              </div>
            )}

            {/* SORU DÜZENLEME MODALI */}
            {editingQuestion && (
              <div className="modal-overlay" onClick={() => setEditingQuestion(null)}>
                <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
                  <h2 className="modal-title">Soruyu Düzenle</h2>
                  <input
                    placeholder="Soru metni"
                    value={editingQuestion.questionText}
                    onChange={e => setEditingQuestion({ ...editingQuestion, questionText: e.target.value })}
                    style={{ width: "100%", marginBottom: 12, boxSizing: "border-box" }}
                  />
                  <p style={{ color: "#94a3b8", fontSize: "0.8rem", marginBottom: 8 }}>Seçenekler:</p>
                  {editingQuestion.options?.map((opt, i) => (
                    <div key={opt.id || i} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, marginBottom: 8 }}>
                      <input
                        value={opt.optionText}
                        onChange={e => {
                          const opts = [...editingQuestion.options];
                          opts[i] = { ...opts[i], optionText: e.target.value };
                          setEditingQuestion({ ...editingQuestion, options: opts });
                        }}
                      />
                      <select
                        className="admin-select"
                        value={opt.areaTag || ""}
                        onChange={e => {
                          const opts = [...editingQuestion.options];
                          opts[i] = { ...opts[i], areaTag: e.target.value };
                          setEditingQuestion({ ...editingQuestion, options: opts });
                        }}
                      >
                        <option value="">Alan</option>
                        {["Backend", "Frontend", "Mobil", "Siber", "AI"].map(a => (
                          <option key={a} value={a}>{a}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                  <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                    <button className="btn primary-btn" style={{ flex: 1 }} onClick={handleUpdateQuestion}>Güncelle</button>
                    <button className="btn admin-btn" style={{ flex: 1 }} onClick={() => setEditingQuestion(null)}>İptal</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}