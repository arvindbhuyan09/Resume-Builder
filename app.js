import React, { useState } from "react";
import jsPDF from "jspdf";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Replace with your actual Gemini API key here
const GEMINI_API_KEY = "YOUR API KEY";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

function ResumeBuilder() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    summary: "",
    experience: "",
    education: "",
    skills: "",
  });
  const [preview, setPreview] = useState(null);
  const [atsScore, setAtsScore] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePreview = () => {
    setPreview({ ...form });
  };

  const handleDownload = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(form.name, 10, 20);
    doc.setFontSize(12);
    doc.text(`Email: ${form.email}`, 10, 30);
    doc.text(`Phone: ${form.phone}`, 10, 40);
    doc.text("Summary:", 10, 50);
    doc.text(form.summary, 10, 60, { maxWidth: 180 });
    doc.text("Experience:", 10, 80);
    doc.text(form.experience, 10, 90, { maxWidth: 180 });
    doc.text("Education:", 10, 110);
    doc.text(form.education, 10, 120, { maxWidth: 180 });
    doc.text("Skills:", 10, 140);
    doc.text(form.skills, 10, 150, { maxWidth: 180 });
    doc.save("resume.pdf");
  };

  const handleGeminiSuggest = async () => {
    setLoading(true);
    try {
      const model = genAI.getGenerativeModel({
        model: "models/text-bison-001",
      });
      const prompt = `
        Given the following resume details, suggest improvements and rewrite the summary in a more professional way:
        Name: ${form.name}
        Email: ${form.email}
        Phone: ${form.phone}
        Summary: ${form.summary}
        Experience: ${form.experience}
        Education: ${form.education}
        Skills: ${form.skills}
      `;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = await response.text();
      alert("Gemini Suggestion:\n\n" + text);
    } catch (err) {
      alert("Error with Gemini API: " + err.message);
    }
    setLoading(false);
  };

  const handleAtsScore = async () => {
    setLoading(true);
    try {
      const model = genAI.getGenerativeModel({
        model: "models/text-bison-001",
      });
      const prompt = `
        You are an ATS (Applicant Tracking System) simulator. Given the following resume, score it from 0 to 100 for ATS compatibility and explain the score briefly.
        Resume:
        Name: ${form.name}
        Email: ${form.email}
        Phone: ${form.phone}
        Summary: ${form.summary}
        Experience: ${form.experience}
        Education: ${form.education}
        Skills: ${form.skills}
        Output format: {"score": number, "explanation": string}
      `;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = await response.text();
      let ats;
      try {
        ats = JSON.parse(text.match(/\{[\s\S]*\}/)[0]);
      } catch {
        ats = { score: "N/A", explanation: text };
      }
      setAtsScore(ats);
    } catch (err) {
      setAtsScore({ score: "N/A", explanation: "Error: " + err.message });
    }
    setLoading(false);
  };

  const handleListModels = async () => {
    setLoading(true);
    try {
      const models = await genAI.listModels();
      alert("Available models:\n" + models.map((m) => m.name).join("\n"));
    } catch (err) {
      alert("Error listing models: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Resume Builder</h1>

      <div style={styles.formSection}>
        <Input
          label="Name"
          name="name"
          value={form.name}
          onChange={handleChange}
        />
        <Input
          label="Email"
          name="email"
          value={form.email}
          onChange={handleChange}
          type="email"
        />
        <Input
          label="Phone"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          type="tel"
        />
        <Textarea
          label="Summary"
          name="summary"
          value={form.summary}
          onChange={handleChange}
        />
        <Textarea
          label="Experience"
          name="experience"
          value={form.experience}
          onChange={handleChange}
        />
        <Textarea
          label="Education"
          name="education"
          value={form.education}
          onChange={handleChange}
        />
        <Textarea
          label="Skills"
          name="skills"
          value={form.skills}
          onChange={handleChange}
        />
      </div>

      <div style={styles.buttons}>
        <Button onClick={handlePreview} disabled={loading}>
          Preview
        </Button>
        <Button onClick={handleDownload} disabled={loading}>
          Download PDF
        </Button>
        <Button onClick={handleGeminiSuggest} disabled={loading}>
          Gemini Suggest
        </Button>
        <Button onClick={handleAtsScore} disabled={loading}>
          Get ATS Score
        </Button>
        <Button onClick={handleListModels} disabled={loading}>
          List Models
        </Button>
      </div>

      {loading && <p style={styles.loading}>Loading…</p>}

      {preview && (
        <div style={styles.preview}>
          <h2>Resume Preview</h2>
          <Field label="Name" value={preview.name} />
          <Field label="Email" value={preview.email} />
          <Field label="Phone" value={preview.phone} />
          <Field label="Summary" value={preview.summary} />
          <Field label="Experience" value={preview.experience} />
          <Field label="Education" value={preview.education} />
          <Field label="Skills" value={preview.skills} />
        </div>
      )}

      {atsScore && (
        <div style={styles.atsScore}>
          <h3>ATS Score: {atsScore.score}</h3>
          <p>{atsScore.explanation}</p>
        </div>
      )}
    </div>
  );
}

// Reusable styled input component
function Input({ label, name, value, onChange, type = "text" }) {
  return (
    <label style={styles.label}>
      {label}:
      <input
        style={styles.input}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={`Enter ${label.toLowerCase()}`}
      />
    </label>
  );
}

// Reusable styled textarea component
function Textarea({ label, name, value, onChange }) {
  return (
    <label style={styles.label}>
      {label}:
      <textarea
        style={styles.textarea}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={`Enter ${label.toLowerCase()}`}
        rows={4}
      />
    </label>
  );
}

// Reusable field display for preview
function Field({ label, value }) {
  return (
    <p>
      <strong>{label}:</strong> {value || <em>Not provided</em>}
    </p>
  );
}

// Reusable button
function Button({ children, onClick, disabled }) {
  return (
    <button
      style={{
        ...styles.button,
        ...(disabled ? styles.buttonDisabled : {}),
      }}
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      {children}
    </button>
  );
}

const styles = {
  container: {
    maxWidth: 720,
    margin: "40px auto",
    padding: 20,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  title: {
    textAlign: "center",
    marginBottom: 30,
    color: "#222",
  },
  formSection: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
    marginBottom: 30,
  },
  label: {
    display: "flex",
    flexDirection: "column",
    fontWeight: "600",
    color: "#444",
    fontSize: 14,
  },
  input: {
    marginTop: 6,
    padding: "10px 12px",
    fontSize: 14,
    borderRadius: 5,
    border: "1.5px solid #ccc",
    outlineColor: "#007bff",
    transition: "border-color 0.3s",
  },
  textarea: {
    marginTop: 6,
    padding: "10px 12px",
    fontSize: 14,
    borderRadius: 5,
    border: "1.5px solid #ccc",
    outlineColor: "#007bff",
    resize: "vertical",
    transition: "border-color 0.3s",
  },
  buttons: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#007bff",
    border: "none",
    borderRadius: 6,
    color: "white",
    fontWeight: "600",
    padding: "10px 18px",
    cursor: "pointer",
    fontSize: 14,
    flexGrow: 1,
    minWidth: 140,
    transition: "background-color 0.3s",
  },
  buttonDisabled: {
    backgroundColor: "#7aa7e9",
    cursor: "not-allowed",
  },
  loading: {
    textAlign: "center",
    fontStyle: "italic",
    color: "#555",
    marginBottom: 20,
  },
  preview: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 8,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    maxHeight: 350,
    overflowY: "auto",
    marginBottom: 30,
  },
  atsScore: {
    backgroundColor: "#d4edda",
    border: "1px solid #c3e6cb",
    padding: 20,
    borderRadius: 8,
    color: "#155724",
  },
};

export default ResumeBuilder;
