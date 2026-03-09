import React, { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";
import logo from "./assets/logo.png";
import imgAI from "./assets/ai.png";
import imgBackend from "./assets/backend.png";
import imgFrontend from "./assets/fronted.png";
import imgMobil from "./assets/mobil.png";
import imgSiber from "./assets/siber.png";

const API = import.meta.env.VITE_API_URL;

// ============================================================
// ÖĞRENCİ ANKET
// ============================================================
function Survey() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [studentInfo, setStudentInfo] = useState({
    firstName: "",
    lastName: "",
    schoolName: "",
    studentNumber: ""
  });
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [isLampOn, setIsLampOn] = useState(false);
  const [onay1, setOnay1] = useState(false);
  const [onay2, setOnay2] = useState(false);
  const [showModal1, setShowModal1] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const [studentId, setStudentId] = useState(null);

  useEffect(() => {
    document.title = "Rotam Ünides";
    axios.get(`${API}/api/questions/active`)
      .then(res => setQuestions(res.data))
      .catch(err => console.error("Sorular yüklenemedi:", err));
  }, []);

  const handleInputChange = (e) => {
    setStudentInfo({ ...studentInfo, [e.target.name]: e.target.value });
  };

  const startSurvey = async () => {
    if (!studentInfo.firstName || !studentInfo.lastName || !studentInfo.schoolName || !studentInfo.studentNumber) {
      alert("Lütfen tüm alanları doldurun!");
      return;
    }
    if (!onay1 || !onay2) {
      alert("Devam edebilmek için her iki onayı da vermeniz gerekmektedir!");
      return;
    }
    try {
      const res = await axios.post(`${API}/api/students/register`, {
        firstName: studentInfo.firstName,
        lastName: studentInfo.lastName,
        schoolName: studentInfo.schoolName,
        schoolNumber: studentInfo.studentNumber,
        consentGiven: true,
        parentalConsentConfirmed: true
      });
      setStudentId(res.data.id);
      setStep(2);
    } catch (err) {
      const msg = err.response?.data || "Kayıt sırasında bir hata oluştu!";
      alert(msg);
    }
  };

  const handleOptionSelect = async (option) => {
    try {
      await axios.post(`${API}/api/responses/save`, {
        studentId,
        questionId: questions[currentQuestionIndex].id,
        optionId: option.id
      });

      if (currentQuestionIndex + 1 === questions.length) {
        const resultRes = await axios.get(`${API}/api/responses/result/${studentId}`);
        setResult(resultRes.data);
        setStep(3);
      } else {
        setCurrentQuestionIndex(i => i + 1);
      }
    } catch {
      alert("Bir hata oluştu!");
      window.location.reload();
    }
  };

  return (
    <div className="survey-container">
      {/* AŞAMA 1: LAMBALI GİRİŞ EKRANI */}
      {step === 1 && (
        <div className={`lamp-page-wrapper ${isLampOn ? "lamp-on" : "lamp-off"}`}>
          <div className="lamp-container">
            <div className="lampshade"></div>
            <div className="lamp-stand"></div>
            <div className="lamp-base"></div>
            <div className="light-glow"></div>
            <div className="pull-string-container" onClick={() => setIsLampOn(!isLampOn)}>
              <div className="pull-string"></div>
              <div className="pull-knob"></div>
            </div>
          </div>

          <div className="student-form-container">
            <div className="card dark-card">
              <img src={logo} alt="Think and Thank Kulübü" className="club-logo" />
              <h1 className="title dark-title">IAU Think&Thank Kulübü</h1>
              <p className="subtitle dark-subtitle">Hadi seni en iyi yansıtan yazılım uzmanlık alanını belirlemek için başlayalım</p>

              <div className="input-group">
                <input name="firstName" placeholder="Ad" onChange={handleInputChange} />
                <input name="lastName" placeholder="Soyad" onChange={handleInputChange} />
                <input name="schoolName" placeholder="Okul" onChange={handleInputChange} />
                <input
                  name="studentNumber"
                  placeholder="Öğrenci No"
                  inputMode="numeric"
                  onKeyDown={e => {
                    if (!/[0-9]/.test(e.key) && !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)) {
                      e.preventDefault();
                      alert("Öğrenci No alanına sadece rakam girebilirsiniz!");
                    }
                  }}
                  onChange={handleInputChange}
                />
              </div>

              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input type="checkbox" checked={onay1} onChange={e => setOnay1(e.target.checked)} />
                  <span>
                    <button className="link-btn" onClick={() => setShowModal1(true)}>Aydınlatma Metni</button>'ni okudum ve onaylıyorum.
                  </span>
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" checked={onay2} onChange={e => setOnay2(e.target.checked)} />
                  <span>
                    <button className="link-btn" onClick={() => setShowModal2(true)}>Beyana Dayalı Veli/Açık Rıza Onayı</button>'nı okudum ve onaylıyorum.
                  </span>
                </label>
              </div>

              <button className="btn primary-btn" onClick={startSurvey}>TESTE BAŞLA</button>
              <button className="btn admin-btn" onClick={() => navigate("/admin")}>⚙️ YÖNETİCİ PANELİ</button>
            </div>
          </div>

          {/* MODAL 1 - AYDINLATMA METNİ */}
          {showModal1 && (
            <div className="modal-overlay" onClick={() => setShowModal1(false)}>
              <div className="modal-box" onClick={e => e.stopPropagation()}>
                <h2 className="modal-title">Rotam Projesi Kişisel Verilerin İşlenmesine İlişkin Aydınlatma Metni</h2>
                <div className="modal-scroll">
                  <p className="modal-section-title">1. Veri Sorumlusu</p>
                  <p className="modal-text">Bu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) uyarınca, "Rotam" projesi kapsamında kişisel verilerinizin toplanması, işlenmesi, saklanması ve aktarılmasına ilişkin süreçler hakkında kullanıcıları ve yasal velilerini/vasilerini bilgilendirmek amacıyla hazırlanmıştır.</p>
                  <p className="modal-section-title">2. İşlenen Kişisel Verileriniz</p>
                  <ul className="modal-list">
                    <li><strong>Kimlik ve Eğitim Verileri:</strong> Ad, Soyad, Okul Adı, Okul Numarası.</li>
                    <li><strong>İşlem Güvenliği Verileri:</strong> IP adresi, tarih ve saat bilgisi (log kayıtları).</li>
                    <li><strong>Anket Verileri:</strong> Bilişim alanındaki yatkınlık ve ilgi alanlarına yönelik yanıtlar ve sonuçlar.</li>
                  </ul>
                  <p className="modal-section-title">3. Kişisel Verilerin İşlenme Amacı</p>
                  <ul className="modal-list">
                    <li>Öğrencilerin bilişim sektörüne yatkınlıklarının analizi ve kariyer yönlendirme sonuçlarının oluşturulması,</li>
                    <li>Projenin istatistiksel ve bilimsel değerlendirmelerinin yapılması,</li>
                    <li>5651 sayılı Kanun uyarınca yasal log tutma yükümlülüklerinin yerine getirilmesi,</li>
                    <li>Sistem güvenliğinin sağlanması ve hukuki uyuşmazlıklarda delil olarak kullanılması.</li>
                  </ul>
                  <p className="modal-section-title">4. Toplanma Yöntemi ve Hukuki Sebebi</p>
                  <p className="modal-text">Kişisel verileriniz form aracılığıyla dijital yollarla toplanmaktadır. Hukuki sebepler; Açık Rıza beyanı ve yasal yükümlülüklerimizin yerine getirilmesidir.</p>
                  <p className="modal-section-title">5. Kişisel Verilerin Aktarılması</p>
                  <p className="modal-text">Verileriniz ticari amaçla kullanılmaz ve üçüncü şahıslara satılmaz. Yasal zorunluluk halinde yetkili kamu kurum ve adli makamlara paylaşım yapılabilir.</p>
                  <p className="modal-section-title">6. Haklarınız</p>
                  <p className="modal-text">KVKK 11. madde uyarınca verilerinizin işlenip işlenmediğini öğrenme, bilgi talep etme, düzeltilmesini ve silinmesini talep etme haklarına sahipsiniz. İletişim: <strong>rotamyazilimprojesi@gmail.com</strong> — Talepler en geç 30 gün içinde sonuçlandırılır.</p>
                </div>
                <button className="btn primary-btn" onClick={() => { setOnay1(true); setShowModal1(false); }}>Okudum, Onaylıyorum</button>
                <button className="btn admin-btn" style={{ marginTop: "8px" }} onClick={() => setShowModal1(false)}>Kapat</button>
              </div>
            </div>
          )}

          {/* MODAL 2 - RIZA BEYANI */}
          {showModal2 && (
            <div className="modal-overlay" onClick={() => setShowModal2(false)}>
              <div className="modal-box" onClick={e => e.stopPropagation()}>
                <h2 className="modal-title">Beyana Dayalı Veli / Açık Rıza Onayı</h2>
                <div className="modal-scroll">
                  <p className="modal-text">Kişisel verilerimin işlenmesini kabul ediyorum. 18 yaşından büyük olduğumu veya 18 yaşından küçük olduğum için bu bilgileri paylaşmak ve anketi doldurmak amacıyla velimden/yasal vasimden izin aldığımı beyan ederim.</p>
                </div>
                <button className="btn primary-btn" onClick={() => { setOnay2(true); setShowModal2(false); }}>Okudum, Onaylıyorum</button>
                <button className="btn admin-btn" style={{ marginTop: "8px" }} onClick={() => setShowModal2(false)}>Kapat</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* AŞAMA 2 ve 3: ANKET / SONUÇ */}
      {(step === 2 || step === 3) && (
        <div className="card">
          {step === 2 && questions.length > 0 && (
            <div>
              <div className="progress-container">
                <div className="progress-bar" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }} />
              </div>
              <p className="q-count">Soru {currentQuestionIndex + 1} / {questions.length}</p>
              <h2 className="q-text">{questions[currentQuestionIndex].questionText}</h2>
              <div className="options-list">
                {questions[currentQuestionIndex].options.map(opt => (
                  <button key={opt.id} className="opt-btn" onClick={() => handleOptionSelect(opt)}>
                    {opt.optionText}
                  </button>
                ))}
              </div>
            </div>
          )}

{step === 3 && result && (() => {
            const alan = result.primaryArea ?? result.result ?? result;
            const alanStr = String(alan || "").toLowerCase();

            const simgelerMap = {
              "backend": imgBackend,
              "frontend": imgFrontend,
              "fronted": imgFrontend, // Eski ihtimale karşı bıraktık
              "mobil": imgMobil,
              "mobile": imgMobil,
              "siber": imgSiber,
              "cyber": imgSiber,
              "cybersecurity": imgSiber,
              "ai": imgAI,
              "yapay zeka": imgAI,
            };

            // Gelen metnin içinde eşleşen tüm alanların simgelerini bul
            const eslesenSimgeler = [];
            Object.keys(simgelerMap).forEach(key => {
              if (alanStr.includes(key)) {
                // Aynı resmi (örneğin cyber ve siber geçerse) iki kez eklememek için kontrol
                if (!eslesenSimgeler.includes(simgelerMap[key])) {
                  eslesenSimgeler.push(simgelerMap[key]);
                }
              }
            });

            return (
              <div>
                <h1 className="res-title">ANALİZ TAMAMLANDI</h1>
                {/* Simgeleri yan yana göstermek için flex yapısı eklendi */}
                <div className="res-icon" style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap", margin: "10px 0" }}>
                  {eslesenSimgeler.length > 0
                    ? eslesenSimgeler.map((simge, index) => (
                        <img key={index} src={simge} alt="Alan Simgesi" className="res-icon-img" style={{ width: "90px", height: "90px" }} />
                      ))
                    : "💡"
                  }
                </div>
                <div className="res-highlight">{alan}</div>
                <div className="res-detail-box">
                  {result.detailedMessage && <p>{result.detailedMessage}</p>}
                  {result.suggestedFrameworks && <p><strong>Teknolojiler:</strong> {result.suggestedFrameworks}</p>}
                </div>
                <button className="btn primary-btn" onClick={() => window.location.reload()}>YENİDEN BAŞLAT</button>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

// ============================================================
// ADMİN
// ============================================================
function Admin() {
  const navigate = useNavigate();
  const [creds, setCreds] = useState({ user: "", pass: "" });
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [schoolName, setSchoolName] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");

  // Öğrenci listesi
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [schoolFilter, setSchoolFilter] = useState("");

  // İstatistikler
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Sorular
  const [questions, setQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionModal, setQuestionModal] = useState(null);
  const [qForm, setQForm] = useState({ questionText: "", options: ["", "", "", ""] });
  const [qSaving, setQSaving] = useState(false);

  // Excel
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [downloading, setDownloading] = useState(false);

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  /* ---- GİRİŞ ---- */
  const handleLogin = async () => {
    if (!creds.user || !creds.pass) {
      alert("Lütfen kullanıcı adı ve şifre alanlarını doldurun!");
      return;
    }
    try {
      const res = await axios.post(`${API}/api/auth/login`, {
        username: creds.user,
        password: creds.pass,
      });
      const jwt = res.data.token;
      setToken(jwt);
      const adminRes = await axios.get(`${API}/api/admin/me`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setRole(adminRes.data.role);
      setSchoolName(adminRes.data.schoolName ?? "");
    } catch {
      alert("Giriş başarısız! Kullanıcı adı veya şifre hatalı.");
    }
  };

  /* ---- VERİ YÜKLEME ---- */
  useEffect(() => {
    if (!token || role !== "SUPER_ADMIN") return;
    if (activeTab === "students") loadStudents();
    if (activeTab === "statistics") loadStats();
    if (activeTab === "questions") loadQuestions();
    if (activeTab === "excel") loadStudentsForSchools();
    // eslint-disable-next-line
  }, [activeTab, token, role]);

const loadStudents = async () => {
    setStudentsLoading(true);
    try {
      const res = await axios.get(`${API}/api/admin/students`, authHeader);
      setStudents(res.data);
    } catch { alert("Öğrenciler yüklenemedi!"); }
    finally { setStudentsLoading(false); }
  };
  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const res = await axios.get(`${API}/api/admin/statistics`, authHeader);
      setStats(res.data);
    } catch { alert("İstatistikler yüklenemedi!"); }
    finally { setStatsLoading(false); }
  };

  const loadQuestions = async () => {
    setQuestionsLoading(true);
    try {
      // Admin paneli için tüm soruları çek (aktif + pasif)
      // Önce admin endpoint'ini dene, çalışmazsa public active endpoint'i kullan
      let res;
      try {
        res = await axios.get(`${API}/api/admin/questions`, authHeader);
      } catch {
        res = await axios.get(`${API}/api/questions/active`, authHeader);
      }
      setQuestions(Array.isArray(res.data) ? res.data : []);
    } catch { alert("Sorular yüklenemedi!"); }
    finally { setQuestionsLoading(false); }
  };

  const loadStudentsForSchools = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/students`, authHeader);
      const uniqueSchools = [...new Set(res.data.map(s => s.schoolName).filter(Boolean))];
      setSchools(uniqueSchools);
    } catch {}
  };

  /* ---- SORULAR CRUD ---- */
  const openAddQuestion = () => {
    setQForm({ questionText: "", options: ["", "", "", ""] });
    setQuestionModal("add");
  };

  const openEditQuestion = (q) => {
    setQForm({
      questionText: q.questionText,
      options: q.options?.map(o => o.optionText) ?? ["", "", "", ""],
      _id: q.id,
    });
    setQuestionModal(q);
  };

  const saveQuestion = async () => {
    if (!qForm.questionText.trim()) { alert("Soru metni boş olamaz!"); return; }
    if (qForm.options.some(o => !o.trim())) { alert("Tüm seçenekleri doldurun!"); return; }
    setQSaving(true);
    try {
      const payload = {
        questionText: qForm.questionText,
        options: qForm.options.map(o => ({ optionText: o })),
      };
      if (questionModal === "add") {
        await axios.post(`${API}/api/admin/questions`, payload, authHeader);
      } else {
        await axios.put(`${API}/api/admin/questions/${qForm._id}`, payload, authHeader);
      }
      setQuestionModal(null);
      loadQuestions();
    } catch { alert("Soru kaydedilemedi!"); }
    finally { setQSaving(false); }
  };

  const deleteQuestion = async (id) => {
    if (!window.confirm("Bu soruyu silmek istediğinizden emin misiniz?")) return;
    try {
      await axios.delete(`${API}/api/admin/questions/${id}`, authHeader);
      loadQuestions();
    } catch { alert("Soru silinemedi!"); }
  };

  /* ---- EXCEL İNDİR ---- */
  const handleDownload = async (schoolOverride) => {
    const target = schoolOverride !== undefined ? schoolOverride : selectedSchool;
    const url = !target
      ? `${API}/api/admin/report/excel`
      : `${API}/api/admin/report/excel/${target}`;
    setDownloading(true);
    try {
      const res = await axios.get(url, { ...authHeader, responseType: "blob" });
      const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = target ? `${target}_rapor.xlsx` : "tum_rapor.xlsx";
      a.click();
    } catch { alert("Veri indirilemedi!"); }
    finally { setDownloading(false); }
  };

  /* ---- SCHOOL_ADMIN basit panel ---- */
  const SchoolAdminPanel = () => (
    <>
      <div className="role-badge school-badge">🏫 Okul Admini</div>
      <p className="subtitle dark-subtitle">
        <strong style={{ color: "#14b8a6" }}>{schoolName}</strong> okuluna ait veriler indirilecek
      </p>
      <button
        className="btn primary-btn"
        onClick={() => handleDownload(schoolName)}
        disabled={downloading}
      >
        {downloading ? "⏳ İndiriliyor..." : "⬇️ OKUL VERİSİNİ İNDİR"}
      </button>
    </>
  );

  /* ---- SUPER ADMIN sekme tanımları ---- */
  const TABS = [
    { id: "dashboard",   label: "🏠 Ana Sayfa"    },
    { id: "students",    label: "👥 Öğrenciler"   },
    { id: "statistics",  label: "📊 İstatistikler" },
    { id: "questions",   label: "❓ Sorular"       },
    { id: "excel",       label: "📥 Excel"         },
  ];

  const filteredStudents = students.filter(s => {
    const q = studentSearch.toLowerCase();
    const matchSearch = !q || `${s.firstName} ${s.lastName} ${s.schoolNumber}`.toLowerCase().includes(q);
    const matchSchool = !schoolFilter || s.schoolName === schoolFilter;
    return matchSearch && matchSchool;
  });

  const uniqueStudentSchools = [...new Set(students.map(s => s.schoolName).filter(Boolean))];

  /* ---- RENDER ---- */
  return (
    <div className="admin-page-wrapper">

      {/* GİRİŞ FORMU */}
      {!token && (
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
      )}

      {/* SCHOOL ADMIN */}
      {token && role === "SCHOOL_ADMIN" && (
        <div className="card dark-card admin-card">
          <h1 className="title dark-title">🛠️ Yönetici Paneli</h1>
          <SchoolAdminPanel />
          <button className="btn admin-btn" onClick={() => navigate("/")}>← Geri Dön</button>
        </div>
      )}

      {/* SUPER ADMIN */}
      {token && role === "SUPER_ADMIN" && (
        <div className="super-admin-wrapper">

          {/* Sidebar */}
          <aside className="sa-sidebar">
            <div className="sa-sidebar-header">
              <span className="sa-logo">⚙️</span>
              <span className="sa-sidebar-title">Süper Admin</span>
            </div>
            <nav className="sa-nav">
              {TABS.map(t => (
                <button
                  key={t.id}
                  className={`sa-nav-btn ${activeTab === t.id ? "sa-nav-active" : ""}`}
                  onClick={() => setActiveTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </nav>
            <button className="btn admin-btn sa-back-btn" onClick={() => navigate("/")}>← Geri Dön</button>
          </aside>

          {/* İçerik */}
          <main className="sa-content">

            {/* ANA SAYFA */}
            {activeTab === "dashboard" && (
              <div className="sa-section">
                <h2 className="sa-section-title">Hoş Geldiniz 👋</h2>
                <p className="sa-section-sub">Rotam Süper Admin Paneli — sol menüden işlem seçin.</p>
                <div className="sa-dashboard-grid">
                  {TABS.slice(1).map(t => (
                    <button key={t.id} className="sa-dash-card" onClick={() => setActiveTab(t.id)}>
                      <span className="sa-dash-icon">{t.label.split(" ")[0]}</span>
                      <span className="sa-dash-label">{t.label.split(" ").slice(1).join(" ")}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ÖĞRENCİLER */}
            {activeTab === "students" && (
              <div className="sa-section sa-section-full">
                <h2 className="sa-section-title">Öğrenci Listesi</h2>
                <div className="sa-filter-row">
                  <input
                    className="sa-search"
                    placeholder="🔍 Ad, soyad veya numara ara..."
                    value={studentSearch}
                    onChange={e => setStudentSearch(e.target.value)}
                  />
                  <select
                    className="sa-select"
                    value={schoolFilter}
                    onChange={e => setSchoolFilter(e.target.value)}
                  >
                    <option value="">Tüm Okullar</option>
                    {uniqueStudentSchools.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                {studentsLoading ? (
                  <p className="sa-loading">Yükleniyor...</p>
                ) : (
                  <div className="sa-table-wrap">
                    <table className="sa-table">
                      <thead>
                        <tr>
                          <th style={{width:"40px"}}>#</th>
                          <th>Ad Soyad</th>
                          <th>Okul</th>
                          <th>Numara</th>
                          <th>Sonuç</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.length === 0 ? (
                          <tr>
                            <td colSpan={5} style={{ textAlign: "center", color: "#94a3b8", padding: "20px" }}>
                              Kayıt bulunamadı.
                            </td>
                          </tr>
                        ) : filteredStudents.map((s, i) => {
                          // Backend farklı field adları döndürebilir — hepsini dene
                          const resultVal = s.resultRole ?? s.result ?? s.primaryArea ?? "—";
                          return (
                            <tr key={s.id ?? i}>
                              <td>{i + 1}</td>
                              <td style={{whiteSpace:"nowrap"}}>{s.firstName} {s.lastName}</td>
                              <td>{s.schoolName}</td>
                              <td>{s.schoolNumber ?? s.studentNumber}</td>
                              <td>
                                <span className="sa-result-badge">{resultVal}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
                <p className="sa-count">Toplam: {filteredStudents.length} öğrenci</p>
              </div>
            )}

            {/* İSTATİSTİKLER */}
            {activeTab === "statistics" && (
              <div className="sa-section">
                <h2 className="sa-section-title">İstatistikler</h2>
                {statsLoading ? (
                  <p className="sa-loading">Yükleniyor...</p>
                ) : stats ? (
                  <>
                    {/* Sayısal değerler — küçük kart grid */}
                    <div className="sa-stats-grid">
                      {Object.entries(stats)
                        .filter(([, val]) => typeof val !== "object")
                        .map(([key, val]) => (
                          <div key={key} className="sa-stat-card">
                            <div className="sa-stat-val">{String(val)}</div>
                            <div className="sa-stat-key">{key}</div>
                          </div>
                        ))}
                    </div>

                    {/* Obje değerler — dağılım tabloları */}
                    {Object.entries(stats)
                      .filter(([, val]) => typeof val === "object" && val !== null)
                      .map(([key, val]) => {
                        const entries = Object.entries(val).sort((a, b) => b[1] - a[1]);
                        const total = entries.reduce((s, [, n]) => s + n, 0);
                        return (
                          <div key={key} className="sa-dist-block">
                            <h3 className="sa-dist-title">{key}</h3>
                            <div className="sa-dist-list">
                              {entries.map(([label, count]) => {
                                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                                return (
                                  <div key={label} className="sa-dist-row">
                                    <span className="sa-dist-label">{label}</span>
                                    <div className="sa-dist-bar-wrap">
                                      <div className="sa-dist-bar" style={{ width: `${pct}%` }} />
                                    </div>
                                    <span className="sa-dist-count">{count} <span className="sa-dist-pct">({pct}%)</span></span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                  </>
                ) : (
                  <p className="sa-loading">Veri yok.</p>
                )}
              </div>
            )}

            {/* SORULAR */}
            {activeTab === "questions" && (
              <div className="sa-section">
                <div className="sa-section-header">
                  <h2 className="sa-section-title">Sorular</h2>
                  <button className="btn primary-btn sa-add-btn" onClick={openAddQuestion}>+ Soru Ekle</button>
                </div>
                {questionsLoading ? (
                  <p className="sa-loading">Yükleniyor...</p>
                ) : (
                  <div className="sa-q-list">
                    {questions.length === 0 && <p className="sa-loading">Soru bulunamadı.</p>}
                    {questions.map((q, i) => (
                      <div key={q.id} className="sa-q-card">
                        <div className="sa-q-top">
                          <span className="sa-q-num">{i + 1}</span>
                          <span className="sa-q-text">{q.questionText}</span>
                          <div className="sa-q-actions">
                            <button className="sa-btn-edit" onClick={() => openEditQuestion(q)}>✏️ Düzenle</button>
                            <button className="sa-btn-delete" onClick={() => deleteQuestion(q.id)}>🗑️ Sil</button>
                          </div>
                        </div>
                        <div className="sa-q-opts">
                          {q.options?.map((o, oi) => (
                            <span key={oi} className="sa-q-opt">{o.optionText}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Soru Modal */}
                {questionModal && (
                  <div className="modal-overlay" onClick={() => setQuestionModal(null)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                      <h2 className="modal-title">
                        {questionModal === "add" ? "Yeni Soru Ekle" : "Soruyu Düzenle"}
                      </h2>
                      <input
                        className="sa-modal-input"
                        placeholder="Soru metni"
                        value={qForm.questionText}
                        onChange={e => setQForm({ ...qForm, questionText: e.target.value })}
                      />
                      <p className="modal-section-title">Seçenekler</p>
                      {qForm.options.map((opt, i) => (
                        <input
                          key={i}
                          className="sa-modal-input"
                          placeholder={`Seçenek ${i + 1}`}
                          value={opt}
                          onChange={e => {
                            const opts = [...qForm.options];
                            opts[i] = e.target.value;
                            setQForm({ ...qForm, options: opts });
                          }}
                        />
                      ))}
                      <button className="btn primary-btn" onClick={saveQuestion} disabled={qSaving}>
                        {qSaving ? "Kaydediliyor..." : "💾 Kaydet"}
                      </button>
                      <button className="btn admin-btn" style={{ marginTop: "8px" }} onClick={() => setQuestionModal(null)}>
                        İptal
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* EXCEL */}
            {activeTab === "excel" && (
              <div className="sa-section">
                <h2 className="sa-section-title">Excel Raporu İndir</h2>

                <div className="sa-excel-card">
                  <h3 className="sa-excel-card-title">🌐 Tüm Okullar</h3>
                  <p className="sa-excel-desc">Sistemdeki tüm okullara ait verileri tek dosyada indir.</p>
                  <button
                    className="btn primary-btn"
                    onClick={() => handleDownload("")}
                    disabled={downloading}
                  >
                    {downloading ? "⏳ İndiriliyor..." : "⬇️ TÜM VERİYİ İNDİR"}
                  </button>
                </div>

                <div className="sa-excel-card">
                  <h3 className="sa-excel-card-title">🏫 Okul Bazlı</h3>
                  <p className="sa-excel-desc">Belirli bir okula ait verileri indir.</p>
                  <select
                    className="sa-select sa-select-full"
                    value={selectedSchool}
                    onChange={e => setSelectedSchool(e.target.value)}
                  >
                    <option value="">— Okul Seçin —</option>
                    {schools.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button
                    className="btn primary-btn"
                    onClick={() => handleDownload(selectedSchool)}
                    disabled={!selectedSchool || downloading}
                    style={{ marginTop: "10px" }}
                  >
                    {downloading ? "⏳ İndiriliyor..." : `⬇️ ${selectedSchool || "Okul"} Verisini İndir`}
                  </button>
                </div>
              </div>
            )}

          </main>
        </div>
      )}
    </div>
  );
}

// ============================================================
// APP
// ============================================================
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Survey />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}