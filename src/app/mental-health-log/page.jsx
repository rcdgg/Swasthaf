"use client";
import { supabase } from '../../supabaseClient';
import { useEffect, useState } from "react";
// import './globals.css';  // or wherever your global CSS file is


export default function MentalHealthLog() {
  const [previousLogs, setPreviousLogs] = useState([]);
  
  useEffect(() => {
    const butterfly = document.querySelector(".butterfly");

    // Update the butterfly's position based on the scroll
    const updateButterflyPosition = () => {
      const scrollY = window.scrollY; // Get the current scroll position
      const windowHeight = window.innerHeight; // Get the height of the viewport

      // Calculate butterfly's position based on scroll
      let butterflyTop = `${50 + scrollY * 0.2}px`; // Move butterfly down with scroll

      // Get the top position of Section 2
      const section2 = document.querySelector("section:nth-of-type(2)");
      const section2Top = section2 ? section2.offsetTop : 0;
      const section2Height = section2 ? section2.offsetHeight : 0;

      // Adjust the butterfly's position to avoid Section 2
      if (scrollY + windowHeight > section2Top && scrollY < section2Top + section2Height) {
        butterflyTop = `${section2Top - 50}px`; // Position it just above Section 2
      }

      // Set the butterfly position dynamically
      if (butterfly) {
        butterfly.style.top = butterflyTop;
      }
    };

    // Listen to the scroll event
    window.addEventListener("scroll", updateButterflyPosition);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("scroll", updateButterflyPosition);
    };
  }, []);
  useEffect(() => {
    const dots = document.querySelectorAll(".twinkling-stars .dot");

    // Position the dots randomly across the screen
    dots.forEach(dot => {
      const randomX = Math.random() * 100;
      // const randomY = Math.random() * 100 ;  // Random X position in percentage (0% to 100%)
      const randomDelay = Math.random() * 3;  // Random delay for animation
      const randomAnimationDuration = Math.random() * 2 + 2;  // Random duration between 2s and 4s

      // Apply the random styles
      dot.style.left = `${randomX}%`;
      // dot.style.right = `${randomY}%`;
      dot.style.animationDuration = `${randomAnimationDuration}s`;
      dot.style.animationDelay = `${randomDelay}s`;
    });

    // Fetch previous logs
    fetchPreviousLogs();
  }, []);
  
  const fetchPreviousLogs = async () => {
    const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
    const userId = userData.user_id;

    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("mentalhealthlog")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPreviousLogs(data || []);
    } catch (err) {
      console.error("Error fetching previous logs:", err);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: "url('/images/bg11.jpg')",  // Fixed background for the entire page
        backgroundSize: "cover",
        backgroundPosition: "center center",  // Keep background centered
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",  // Keep background fixed
        overflowX: "hidden",  // Prevent horizontal scroll
        fontFamily: "'Love Ya Like A Sister', cursive",
        color: "#000",  // Changed from #fff to #000
      }}
    >
      {/* Twinkling Stars */}
      <div className="twinkling-stars">
        {/* Create multiple dots for twinkling effect */}
        <div className="dot" style={{ top: "10%", left: "15%" }}></div>
        <div className="dot" style={{ top: "30%", left: "25%" }}></div>
        <div className="dot" style={{ top: "50%", left: "40%" }}></div>
        <div className="dot" style={{ top: "70%", left: "60%" }}></div>
        <div className="dot" style={{ top: "80%", left: "80%" }}></div>
        <div className="dot" style={{ top: "20%", left: "72%" }}></div>
        <div className="dot" style={{ top: "60%", left: "89%" }}></div>
        <div className="dot" style={{ top: "40%", left: "10%" }}></div>
        <div className="dot" style={{ top: "90%", left: "35%" }}></div>
        <div className="dot" style={{ top: "13%", left: "85%" }}></div>

        <div className="dot" style={{ top: "50%", left: "37%" }}></div>
        <div className="dot" style={{ top: "100%", left: "54%" }}></div>
        <div className="dot" style={{ top: "90%", left: "63%" }}></div>
        <div className="dot" style={{ top: "110%", left: "72%" }}></div>
        <div className="dot" style={{ top: "120%", left: "87%" }}></div>
        <div className="dot" style={{ top: "60%", left: "79%" }}></div>
        <div className="dot" style={{ top: "100%", left: "98%" }}></div>
        <div className="dot" style={{ top: "80%", left: "120%" }}></div>
        <div className="dot" style={{ top: "130%", left: "24%" }}></div>
        <div className="dot" style={{ top: "55%", left: "66%" }}></div>

        <div className="dot" style={{ top: "5%", left: "37%" }}></div>
        <div className="dot" style={{ top: "10%", left: "54%" }}></div>
        <div className="dot" style={{ top: "15%", left: "63%" }}></div>
        <div className="dot" style={{ top: "20%", left: "72%" }}></div>
        <div className="dot" style={{ top: "25%", left: "87%" }}></div>
        <div className="dot" style={{ top: "30%", left: "79%" }}></div>
        <div className="dot" style={{ top: "35%", left: "98%" }}></div>
        <div className="dot" style={{ top: "40%", left: "120%" }}></div>
        <div className="dot" style={{ top: "45%", left: "24%" }}></div>
        <div className="dot" style={{ top: "50%", left: "66%" }}></div>

        <div className="dot" style={{ top: "-10%", left: "37%" }}></div>
        <div className="dot" style={{ top: "-150%", left: "54%" }}></div>
        <div className="dot" style={{ top: "-50%", left: "63%" }}></div>
        <div className="dot" style={{ top: "-35%", left: "72%" }}></div>
        <div className="dot" style={{ top: "741%", left: "87%" }}></div>
        <div className="dot" style={{ top: "600%", left: "79%" }}></div>
        <div className="dot" style={{ top: "405%", left: "98%" }}></div>
        <div className="dot" style={{ top: "560%", left: "120%" }}></div>
        <div className="dot" style={{ top: "880%", left: "24%" }}></div>
        <div className="dot" style={{ top: "750%", left: "66%" }}></div>
        
        <div className="dot" style={{ top: "2000%", left: "37%" }}></div>
        <div className="dot" style={{ top: "3000%", left: "54%" }}></div>
        <div className="dot" style={{ top: "5000%", left: "63%" }}></div>
        <div className="dot" style={{ top: "7000%", left: "72%" }}></div>
        <div className="dot" style={{ top: "4200%", left: "87%" }}></div>
        <div className="dot" style={{ top: "600%", left: "79%" }}></div>
        <div className="dot" style={{ top: "405%", left: "98%" }}></div>
        <div className="dot" style={{ top: "560%", left: "120%" }}></div>
        <div className="dot" style={{ top: "880%", left: "24%" }}></div>
        <div className="dot" style={{ top: "750%", left: "66%" }}></div>

        
      </div>
      {/* <div className="twinkling-stars fixed top-0 left-0 w-full h-full overflow-hidden z-[-1] pointer-events-none">
  {[...Array(60)].map((_, i) => (
    <div
      key={i}
      className="dot"
      style={{
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
      }}
    />
  ))}
</div> */}

      <div className="butterfly">
        <img
          src="/images/b.png" // Add the path to your butterfly image
          alt="Butterfly"
          className="butterfly-image"
        />
      </div>
      {/* Hero Section with Fixed Background */}
      
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <h1
          style={{
            fontSize: "15rem",
            lineHeight: "1.4",
            fontWeight: "normal",
            textShadow: "2px 2px 4px rgba(0,0,0,1)",
            color: "#fff",  // Changed back to white
          }}
        >
          HOW ARE<br />      YOU FEELING
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
            borderRadius: "1.5rem",
            maxWidth: "1000px",
            maxHeight: "1000px",
            margin: "0 auto",
            marginTop: "10rem",
            boxShadow: "0 0 25px 10px rgba(254, 248, 224, 0.5)", // subtle glowing effect
          }}
          
        >
          
          <div className="twinkling-stars">
        {/* Create multiple dots for twinkling effect */}
        <div className="dot" style={{ top: "10%", left: "15%" }}></div>
        <div className="dot" style={{ top: "30%", left: "25%" }}></div>
        <div className="dot" style={{ top: "50%", left: "40%" }}></div>
        <div className="dot" style={{ top: "70%", left: "60%" }}></div>
        <div className="dot" style={{ top: "80%", left: "80%" }}></div>
        <div className="dot" style={{ top: "20%", left: "72%" }}></div>
        <div className="dot" style={{ top: "60%", left: "89%" }}></div>
        <div className="dot" style={{ top: "40%", left: "10%" }}></div>
        <div className="dot" style={{ top: "90%", left: "35%" }}></div>
        <div className="dot" style={{ top: "13%", left: "85%" }}></div>

        <div className="dot" style={{ top: "50%", left: "37%" }}></div>
        <div className="dot" style={{ top: "100%", left: "54%" }}></div>
        <div className="dot" style={{ top: "90%", left: "63%" }}></div>
        <div className="dot" style={{ top: "110%", left: "72%" }}></div>
        <div className="dot" style={{ top: "120%", left: "87%" }}></div>
        <div className="dot" style={{ top: "60%", left: "79%" }}></div>
        <div className="dot" style={{ top: "100%", left: "98%" }}></div>
        <div className="dot" style={{ top: "80%", left: "120%" }}></div>
        <div className="dot" style={{ top: "130%", left: "24%" }}></div>
        <div className="dot" style={{ top: "55%", left: "66%" }}></div>

        <div className="dot" style={{ top: "150%", left: "37%" }}></div>
        <div className="dot" style={{ top: "200%", left: "54%" }}></div>
        <div className="dot" style={{ top: "190%", left: "63%" }}></div>
        <div className="dot" style={{ top: "210%", left: "72%" }}></div>
        <div className="dot" style={{ top: "220%", left: "87%" }}></div>
        <div className="dot" style={{ top: "120%", left: "79%" }}></div>
        <div className="dot" style={{ top: "200%", left: "98%" }}></div>
        <div className="dot" style={{ top: "160%", left: "120%" }}></div>
        <div className="dot" style={{ top: "190%", left: "24%" }}></div>
        <div className="dot" style={{ top: "255%", left: "66%" }}></div>

        <div className="dot" style={{ top: "550%", left: "37%" }}></div>
        <div className="dot" style={{ top: "750%", left: "54%" }}></div>
        <div className="dot" style={{ top: "590%", left: "63%" }}></div>
        <div className="dot" style={{ top: "712%", left: "72%" }}></div>
        <div className="dot" style={{ top: "741%", left: "87%" }}></div>
        <div className="dot" style={{ top: "600%", left: "79%" }}></div>
        <div className="dot" style={{ top: "405%", left: "98%" }}></div>
        <div className="dot" style={{ top: "560%", left: "120%" }}></div>
        <div className="dot" style={{ top: "880%", left: "24%" }}></div>
        <div className="dot" style={{ top: "750%", left: "66%" }}></div>
        
        <div className="dot" style={{ top: "2000%", left: "37%" }}></div>
        <div className="dot" style={{ top: "3000%", left: "54%" }}></div>
        <div className="dot" style={{ top: "5000%", left: "63%" }}></div>
        <div className="dot" style={{ top: "7000%", left: "72%" }}></div>
        <div className="dot" style={{ top: "4200%", left: "87%" }}></div>
        <div className="dot" style={{ top: "600%", left: "79%" }}></div>
        <div className="dot" style={{ top: "405%", left: "98%" }}></div>
        <div className="dot" style={{ top: "560%", left: "120%" }}></div>
        <div className="dot" style={{ top: "880%", left: "24%" }}></div>
        <div className="dot" style={{ top: "750%", left: "66%" }}></div>
        
      </div>
          
          <label htmlFor="mood" style={{ fontSize: "2rem", textTransform: "uppercase", color: "#000", fontWeight: "600", marginBottom: "0.5rem", display: "block" }}>
            Mood:
          </label>
          <input id="mood" name="mood" type="text" placeholder="Happy, sad, etc." style={inputStyle} />

          <label htmlFor="stress" style={{ fontSize: "2rem", textTransform: "uppercase", color: "#000", fontWeight: "600", marginBottom: "0.5rem", display: "block" }}>
            Stress Level (1–10):
          </label>
          <input id="stress" name="stress" type="number" min="1" max="10" style={inputStyle} />

          <label htmlFor="sleep" style={{ fontSize: "2rem", textTransform: "uppercase", color: "#000", fontWeight: "600", marginBottom: "0.5rem", display: "block" }}>
            Sleep Quality:
          </label>
          <select id="sleep" name="sleep" style={inputStyle}>
            <option>Great</option>
            <option>Okay</option>
            <option>Poor</option>
          </select>

          <label htmlFor="thoughts" style={{ fontSize: "2rem", textTransform: "uppercase", color: "#000", fontWeight: "600", marginBottom: "0.5rem", display: "block" }}>
            Thoughts:
          </label>
          <textarea
            id="thoughts"
            name="thoughts"
            placeholder="Anything on your mind..."
            style={{ ...inputStyle, height: "100px" }}
          />
          

        </div>
        <div
  onClick={handleLogSubmit} // 🟢 Add this line
  style={{
    marginTop: "3rem",
    backgroundColor: "#FEF8E0",
    padding: "1rem 2rem",
    borderRadius: "1rem",
    maxWidth: "200px",
    marginLeft: "auto",
    marginRight: "auto",
    textAlign: "center",
    fontFamily: "'Love Ya Like A Sister', cursive",
    fontSize: "1.8rem",
    color: "#000",
    cursor: "pointer",
    fontWeight: "600",
    boxShadow: "0 0 15px 5px rgba(144, 238, 144, 0.7)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "scale(1.05)";
    e.currentTarget.style.boxShadow = "0 0 20px 6px rgba(144, 238, 144, 0.85)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "scale(1)";
    e.currentTarget.style.boxShadow = "0 0 15px 3px rgba(144, 238, 144, 0.7)";
  }}
>
  LOG IT
</div>

        {/* Previous Logs Section */}
        <div
          style={{
            backgroundColor: "rgba(254, 248, 224, 0.9)",
            backdropFilter: "blur(15px)",
            padding: "1.5rem",
            borderRadius: "1.5rem",
            maxWidth: "1000px",
            margin: "2rem auto",
            boxShadow: "0 0 25px 10px rgba(254, 248, 224, 0.5)",
          }}
        >
          <h2
            style={{
              fontSize: "2.5rem",
              textTransform: "uppercase",
              color: "#000",
              fontWeight: "600",
              marginBottom: "1.5rem",
              textAlign: "center",
              fontFamily: "'Love Ya Like A Sister', cursive",
            }}
          >
            Previous Logs
          </h2>
          
          {previousLogs.length === 0 ? (
            <p style={{ textAlign: "center", fontSize: "1.5rem", color: "#666" }}>
              No previous logs found
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {previousLogs.map((log, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: "#fffceb",
                    padding: "1.5rem",
                    borderRadius: "1rem",
                    border: "2px solid #ccc",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "1.2rem", color: "#666" }}>
                      {new Date(log.created_at).toLocaleDateString()}
                    </span>
                    <span style={{ fontSize: "1.2rem", color: "#666" }}>
                      {new Date(log.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
                    <div>
                      <strong style={{ color: "#000" }}>Mood:</strong> {log.mood}
                    </div>
                    <div>
                      <strong style={{ color: "#000" }}>Stress Level:</strong> {log.stress_level}/10
                    </div>
                    <div>
                      <strong style={{ color: "#000" }}>Sleep Quality:</strong>{" "}
                      {log.sleep_quality === 3 ? "Great" : log.sleep_quality === 2 ? "Okay" : "Poor"}
                    </div>
                    <div>
                      <strong style={{ color: "#000" }}>Thoughts:</strong> {log.entry_state}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
  const stress = document.getElementById("stress").value;
  const sleep = document.getElementById("sleep").value;
  const thoughts = document.getElementById("thoughts").value;
  const moood = document.getElementById("mood").value;

  const mappedSleep = sleepQualityMap[sleep];
  const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
  const userId = userData.user_id;

  if (!userId) {
    alert("User not logged in. Please log in again.");
    return;
  }

  const logEntry = {
    user_id: userId,
    mood: moood,  // Default mood for testing
    stress_level: stress,
    sleep_quality: mappedSleep,
    entry_state: thoughts,
    // log_date: new Date().toISOString().split("T")[0] + "T00:00:00",
  };

  console.log("📦 Submitting logEntry:", logEntry);

  try {
    const { data, error } = await supabase
      .from("mentalhealthlog")
      .insert([logEntry]);

    if (error) {
      console.error("❌ Supabase error:", error);
      alert("Failed to save. Try again.");
    } else {
      console.log("✅ Log saved:", data);
      alert("Log saved!");
      // Refresh the logs after successful submission
      fetchPreviousLogs();
    }
  } catch (err) {
    console.error("🔥 Exception during Supabase insert:", err);
    alert("Something went wrong. Please try again.");
  }
}
const updateButterflyPosition = () => {
  const scrollY = window.scrollY;
  const windowHeight = window.innerHeight;
  const section2Top = document.querySelector('section:nth-of-type(2)').offsetTop;
  const section2Height = document.querySelector('section:nth-of-type(2)').offsetHeight;

  let butterflyTop = `calc(50% + ${scrollY * 0.2}px)`;  // Adjust speed

  // If the butterfly is about to overlap with section 2, adjust its position
  if (scrollY + windowHeight > section2Top) {
    butterflyTop = `${section2Top - 100}px`;  // Position it just above Section 2
  }

  if (butterfly) {
    butterfly.style.top = butterflyTop;
  }
};

  // console.log("Data from Supabase:", data);








