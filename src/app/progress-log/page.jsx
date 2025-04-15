"use client";
import { supabase } from '../../supabaseClient';
import { useEffect, useState } from "react";
// import './globals.css';  // or wherever your global CSS file is


export default function ProgressLog() {
  // const [prevScrollPos, setPrevScrollPos] = useState(0);

  useEffect(() => {
    const girl = document.querySelector(".running-girl");
    if (!girl) return;
  
    const maxTranslateX = 600; // how far she can go max
    const scrollRange = 2000;
     // pixels of scroll that maps to full move
  
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const translateX = Math.min(scrollY / scrollRange * maxTranslateX, maxTranslateX);
      girl.style.transform = `translate(${translateX}px, -50%)`;
    };
  
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  
  return (
    
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: "url('/images/bg1.jpg')",  // Fixed background for the entire page
        backgroundSize: "cover",
        backgroundPosition: "center center",  // Keep background centered
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",  // Keep background fixed
        overflowX: "hidden",  // Prevent horizontal scroll
        fontFamily: "'Staatliches', sans-serif",
        color: "#fff",
      }}
    >
      

    
      {/* Hero Section with Fixed Background */}
      
      <section
        style={{
          minHeight: "50vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: "1rem",
        }}
      > 
      <img
  src="/images/run.png"  // update this path as needed
  alt="Running Girl"
  className="running-girl"
/>

        <h1
          style={{
            fontSize: "15rem",
            lineHeight: "1.2",
            fontWeight: "normal",
            textShadow: "2px 2px 4px rgba(0,0,0,1)",
          }}
        >
          YOU <br/> <span style={{ color: "yellow" }}>MOVED</span> <br /> TODAY
        </h1>
        
      </section>

      {/* Scrollable Content Section */}
      <section
        style={{
          padding: "3rem",
          backgroundColor: "rgba(0, 0, 0, 0)",  // Semi-transparent dark background for content
          minHeight: "100vh",  // Ensure it covers full viewport height for scrolling
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(254, 248, 224, 0.9)", // reduced opacity
            backdropFilter: "blur(15px)",
            padding: "1.5rem",
            borderRadius: "0.8rem",
            maxWidth: "1000px",
            maxHeight: "1000px",
            margin: "0 auto",
            marginTop: "5rem",
            boxShadow: "0 0 200px 20px rgba(0, 0, 0, 1)", 
          }}
          
        >
          
          
          
          <label htmlFor="weight" style={labelStyle}>
  Weight (kg):
</label>
<input id="weight" name="weight" type="number" step="0.1" style={inputStyle} />

<label htmlFor="bmi" style={labelStyle}>
  BMI:
</label>
<input id="bmi" name="bmi" type="number" step="0.1" style={inputStyle} />

<label htmlFor="calories_consumed" style={labelStyle}>
  Calories Consumed:
</label>
<input id="calories_consumed" name="calories_consumed" type="number" style={inputStyle} />

<label htmlFor="calories_burned" style={labelStyle}>
  Calories Burned:
</label>
<input id="calories_burned" name="calories_burned" type="number" style={inputStyle} />

<label htmlFor="water_intake" style={labelStyle}>
  Water Intake (ml):
</label>
<input id="water_intake" name="water_intake" type="number" style={inputStyle} />

<label htmlFor="sleep_hours" style={labelStyle}>
  Sleep Hours:
</label>
<input id="sleep_hours" name="sleep_hours" type="number" step="0.1" style={inputStyle} />

          

        </div>
        <div
  onClick={handleLogSubmit} // 🟢 Add this line
  style={{
    marginTop: "5rem",
    backgroundColor: "#E3E2DE",
    padding: ".5rem .5rem",
    borderRadius: "1rem",
    maxWidth: "200px",
    marginLeft: "auto",
    marginRight: "auto",
    textAlign: "center",
    fontFamily: "'Staatlitches', sans-serif",
    fontSize: "2rem",
    color: "#000",
    cursor: "pointer",
    fontWeight: "800",
    boxShadow: "0 0 15px 5px rgba(0, 0, 0, 1)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "scale(1.05)";
    e.currentTarget.style.boxShadow = "0 0 20px 6px rgba(0, 0, 0, 1.5)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "scale(1)";
    e.currentTarget.style.boxShadow = "0 0 15px 3px rgba(0, 0, 0, 1)";
  }}
>
  LOG IT
</div>
      </section>
    </div>
  );
}


const inputStyle = {
  display: "block",
  width: "100%",
  padding: "0.75rem",
  margin: "0.5rem 0 1.5rem",
  borderRadius: "0.75rem",
  border: "2px solid #ccc",
  backgroundColor: "#fffceb",          // Soft yellow background
  color: "#1a1a1a",                     // Dark text for readability
  fontSize: "1.5rem",
  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)",
  outline: "none",
};
const sleepQualityMap = {
  "Great": 3,
  "Okay": 2,
  "Poor": 1,
};
async function handleLogSubmit() {
  const wt = parseFloat(document.getElementById("weight").value);
  const bmii = parseFloat(document.getElementById("bmi").value);
  const caloriesConsumed = parseInt(document.getElementById("calories_consumed").value);
  const caloriesBurned = parseInt(document.getElementById("calories_burned").value);
  const waterIntake = parseInt(document.getElementById("water_intake").value);
  const sleepHours = parseFloat(document.getElementById("sleep_hours").value);

  const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
  const userId = userData.user_id;

  if (!userId) {
    alert("User not logged in. Please log in again.");
    return;
  }

  const logEntry = {
    user_id: userId,
    weight: wt,
    bmi:bmii,
    calories_consumed: caloriesConsumed,
    calories_burned: caloriesBurned,
    water_intake: waterIntake,
    sleep_hours: sleepHours,
    log_date: new Date().toISOString().split("T")[0] + "T00:00:00"
, 
  };

  console.log("📦 Submitting progress log:", logEntry);

  try {
    const { data, error } = await supabase
      .from("progresslog")
      .insert([logEntry]);

    if (error) {
      console.error("❌ Supabase error:", error);
      alert("Failed to save. Try again.");
    } else {
      console.log("✅ Progress log saved:", data);
      alert("Log saved!");
    }
  } catch (err) {
    console.error("🔥 Exception during Supabase insert:", err);
    alert("Something went wrong. Please try again.");
  }
}

const labelStyle = {
  fontSize: "2rem",
  textTransform: "uppercase",
  color: "#000",
  fontWeight: "600",
  marginBottom: "0.5rem",
  display: "block",
};











