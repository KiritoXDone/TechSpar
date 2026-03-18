import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopicCard from "../components/TopicCard";
import { getTopics, startInterview, getResumeStatus, uploadResume } from "../api/interview";

const styles = {
  page: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "60px 24px",
  },
  hero: {
    textAlign: "center",
    marginBottom: 48,
  },
  h1: {
    fontSize: 40,
    fontWeight: 700,
    marginBottom: 12,
    background: "linear-gradient(135deg, var(--accent-light), var(--accent))",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    fontSize: 16,
    color: "var(--text-dim)",
    maxWidth: 500,
  },
  modeSection: {
    display: "flex",
    gap: 24,
    marginBottom: 48,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  modeCard: {
    width: 320,
    padding: "28px 24px",
    background: "var(--bg-card)",
    border: "2px solid var(--border)",
    borderRadius: 16,
    cursor: "pointer",
    transition: "all 0.2s",
    textAlign: "left",
  },
  modeTitle: {
    fontSize: 20,
    fontWeight: 600,
    marginBottom: 8,
  },
  modeDesc: {
    fontSize: 14,
    color: "var(--text-dim)",
    lineHeight: 1.6,
  },
  modeTag: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 500,
    marginBottom: 12,
  },
  topicSection: {
    width: "100%",
    maxWidth: 700,
  },
  topicTitle: {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 16,
    textAlign: "left",
  },
  topicGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: 12,
    marginBottom: 32,
  },
  startBtn: {
    width: "100%",
    padding: "14px",
    borderRadius: "var(--radius)",
    background: "linear-gradient(135deg, var(--accent), var(--accent-light))",
    color: "#fff",
    fontSize: 16,
    fontWeight: 600,
    border: "none",
    transition: "opacity 0.2s",
  },
  startBtnDisabled: {
    opacity: 0.4,
    cursor: "not-allowed",
  },
  loading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 20,
    color: "var(--text-dim)",
  },
  resumeSection: {
    width: "100%",
    maxWidth: 700,
    marginBottom: 32,
  },
  resumeBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: 12,
  },
  resumeInfo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 14,
    color: "var(--text)",
  },
  resumeFileName: {
    fontWeight: 500,
  },
  resumeSize: {
    fontSize: 12,
    color: "var(--text-dim)",
  },
  uploadBtn: {
    padding: "8px 16px",
    borderRadius: 8,
    background: "rgba(108,92,231,0.12)",
    color: "var(--accent-light)",
    fontSize: 13,
    fontWeight: 500,
    border: "none",
    cursor: "pointer",
    transition: "opacity 0.2s",
  },
  uploadLabel: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    padding: "28px 20px",
    background: "var(--bg-card)",
    border: "2px dashed var(--border)",
    borderRadius: 12,
    cursor: "pointer",
    transition: "border-color 0.2s",
    fontSize: 14,
    color: "var(--text-dim)",
  },
};

export default function Home() {
  const navigate = useNavigate();
  const [mode, setMode] = useState(null); // "resume" | "topic_drill"
  const [topics, setTopics] = useState({});
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState(null); // {filename, size} or null
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    getTopics().then(setTopics).catch(() => {});
    getResumeStatus().then((s) => {
      if (s.has_resume) setResumeFile({ filename: s.filename, size: s.size });
    }).catch(() => {});
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const data = await uploadResume(file);
      setResumeFile({ filename: data.filename, size: data.size });
    } catch (err) {
      alert("上传失败: " + err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleStart = async () => {
    if (!mode) return;
    if (mode === "topic_drill" && !selectedTopic) return;

    setLoading(true);
    try {
      const data = await startInterview(mode, selectedTopic);
      navigate(`/interview/${data.session_id}`, { state: data });
    } catch (err) {
      alert("启动失败: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const canStart = (mode === "resume" && resumeFile) || (mode === "topic_drill" && selectedTopic);

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <h1 style={styles.h1}>TechSpar</h1>
        <p style={styles.subtitle}>
          越练越懂你的 AI 面试教练——追踪你的成长轨迹，精准命中薄弱点
        </p>
      </div>

      <div style={styles.modeSection}>
        <div
          style={{
            ...styles.modeCard,
            borderColor: mode === "resume" ? "var(--accent)" : "var(--border)",
            background: mode === "resume" ? "var(--bg-hover)" : "var(--bg-card)",
          }}
          onClick={() => { setMode("resume"); setSelectedTopic(null); }}
        >
          <div style={{ ...styles.modeTag, background: "rgba(108,92,231,0.15)", color: "var(--accent-light)" }}>
            全流程模拟
          </div>
          <div style={styles.modeTitle}>简历模拟面试</div>
          <div style={styles.modeDesc}>
            AI 读取你的简历，模拟真实面试官。
            从自我介绍到项目深挖，完整走一遍面试流程。
          </div>
        </div>

        <div
          style={{
            ...styles.modeCard,
            borderColor: mode === "topic_drill" ? "var(--green)" : "var(--border)",
            background: mode === "topic_drill" ? "var(--bg-hover)" : "var(--bg-card)",
          }}
          onClick={() => setMode("topic_drill")}
        >
          <div style={{ ...styles.modeTag, background: "rgba(0,184,148,0.15)", color: "var(--green)" }}>
            针对强化
          </div>
          <div style={styles.modeTitle}>专项强化训练</div>
          <div style={styles.modeDesc}>
            选一个领域集中刷题，AI 根据你的回答动态调整难度，精准定位薄弱点。
          </div>
        </div>
      </div>

      {mode === "resume" && (
        <div style={styles.resumeSection}>
          {resumeFile ? (
            <div style={styles.resumeBox}>
              <div style={styles.resumeInfo}>
                <span>📄</span>
                <span style={styles.resumeFileName}>{resumeFile.filename}</span>
                <span style={styles.resumeSize}>
                  ({(resumeFile.size / 1024).toFixed(0)} KB)
                </span>
              </div>
              <label style={{ ...styles.uploadBtn, opacity: uploading ? 0.4 : 1 }}>
                {uploading ? "上传中..." : "重新上传"}
                <input
                  type="file"
                  accept=".pdf"
                  style={{ display: "none" }}
                  onChange={handleUpload}
                  disabled={uploading}
                />
              </label>
            </div>
          ) : (
            <label style={{ ...styles.uploadLabel, opacity: uploading ? 0.5 : 1 }}>
              <span style={{ fontSize: 28 }}>📄</span>
              <span>{uploading ? "正在上传..." : "点击上传简历（PDF）"}</span>
              <input
                type="file"
                accept=".pdf"
                style={{ display: "none" }}
                onChange={handleUpload}
                disabled={uploading}
              />
            </label>
          )}
        </div>
      )}

      {mode === "topic_drill" && (
        <div style={styles.topicSection}>
          <div style={styles.topicTitle}>选择训练领域</div>
          <div style={styles.topicGrid}>
            {Object.entries(topics).map(([key, info]) => (
              <TopicCard
                key={key}
                topicKey={key}
                name={info.name || key}
                icon={info.icon}
                selected={selectedTopic === key}
                onClick={() => setSelectedTopic(key)}
              />
            ))}
          </div>
        </div>
      )}

      {mode && (
        <div style={{ width: "100%", maxWidth: 700 }}>
          <button
            style={{
              ...styles.startBtn,
              ...(!canStart || loading ? styles.startBtnDisabled : {}),
            }}
            disabled={!canStart || loading}
            onClick={handleStart}
          >
            {loading ? "正在初始化面试..." : "开始面试"}
          </button>
        </div>
      )}
    </div>
  );
}
