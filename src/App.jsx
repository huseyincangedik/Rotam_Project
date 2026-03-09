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

// --- ÖĞRENCİ ANKET ---
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
      // Öğrenciyi kaydet — consentGiven ve parentalConsentConfirmed backend'in beklediği alanlar
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
      // Her cevap için ayrı ayrı kaydet: studentId + questionId + optionId
      await axios.post(`${API}/api/responses/save`, {
        studentId,
        questionId: questions[currentQuestionIndex].id,
        optionId: option.id
      });

      if (currentQuestionIndex + 1 === questions.length) {
        // Tüm cevaplar bitti, sonucu hesaplat ve göster
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
            const alan = result.primaryArea ?? result;
            const simgeler = {
              "Backend":  imgBackend,
              "Frontend": imgFrontend,
              "Mobil":    imgMobil,
              "Siber":    imgSiber,
              "AI":       imgAI
            };
            const simge = simgeler[alan] ?? "💡";
            return (
              <div>
                <h1 className="res-title">ANALİZ TAMAMLANDI</h1>
                <div className="res-icon">{simge}</div>
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

// --- ADMİN ---
function Admin() {
  const navigate = useNavigate();
  const [creds, setCreds] = useState({ user: "", pass: "" });
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);     // "SUPER_ADMIN" | "SCHOOL_ADMIN"
  const [schoolName, setSchoolName] = useState("");

  const handleLogin = () => {
    if (!creds.user || !creds.pass) {
      alert("Lütfen kullanıcı adı ve şifre alanlarını doldurun!");
      return;
    }
    axios.post(`${API}/api/auth/login`, {
      username: creds.user,
      password: creds.pass
    }).then(async res => {
      const jwt = res.data.token;
      setToken(jwt);

      // Token'dan sonra admin bilgisini çek (rol ve okul adı için)
      const adminRes = await axios.get(`${API}/api/admin/me`, {
        headers: { Authorization: `Bearer ${jwt}` }
      });
      setRole(adminRes.data.role);           // "SUPER_ADMIN" veya "SCHOOL_ADMIN"
      setSchoolName(adminRes.data.schoolName ?? "");
    }).catch(() => {
      alert("Giriş başarısız! Kullanıcı adı veya şifre hatalı.");
    });
  };

  const handleDownload = () => {
    // SUPER_ADMIN → tüm okullara ait Excel
    // SCHOOL_ADMIN → kendi okul adına ait Excel
    const url = role === "SCHOOL_ADMIN"
      ? `${API}/api/admin/report/excel/${schoolName}`
      : `${API}/api/admin/report/excel`;

    axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: "blob"
    }).then(res => {
      const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = role === "SCHOOL_ADMIN" ? `${schoolName}_rapor.xlsx` : "tum_rapor.xlsx";
      a.click();
    }).catch(() => {
      alert("Veri indirilemedi!");
    });
  };

  return (
    <div className="admin-page-wrapper">
      <div className="card dark-card admin-card">
        <h1 className="title dark-title">🛠️ Yönetici Paneli</h1>

        {!token && (
          <>
            <p className="subtitle dark-subtitle">Giriş yapın</p>
            <div className="input-group admin-input-group">
              <input placeholder="Kullanıcı Adı" onChange={e => setCreds({ ...creds, user: e.target.value })} />
              <input type="password" placeholder="Şifre" onChange={e => setCreds({ ...creds, pass: e.target.value })} />
            </div>
            <button className="btn primary-btn" onClick={handleLogin}>GİRİŞ YAP</button>
          </>
        )}

        {token && role === "SUPER_ADMIN" && (
          <>
            <div className="role-badge developer-badge">🧑‍💻 Yazılımcı Admini</div>
            <p className="subtitle dark-subtitle">Tüm okullara ait veriler indirilecek</p>
            <button className="btn primary-btn" onClick={handleDownload}>⬇️ TÜM VERİYİ İNDİR</button>
          </>
        )}

        {token && role === "SCHOOL_ADMIN" && (
          <>
            <div className="role-badge school-badge">🏫 Okul Admini</div>
            <p className="subtitle dark-subtitle">
              <strong style={{ color: "#14b8a6" }}>{schoolName}</strong> okuluna ait veriler indirilecek
            </p>
            <button className="btn primary-btn" onClick={handleDownload}>⬇️ OKUL VERİSİNİ İNDİR</button>
          </>
        )}

        <button className="btn admin-btn" onClick={() => navigate("/")}>← Geri Dön</button>
      </div>
    </div>
  );
}

// --- APP ---
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