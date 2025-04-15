"use client";
import { useEffect } from "react";

export default function MentalHealthLog() {
  // Butterfly movement effect
  useEffect(() => {
    const butterfly = document.querySelector(".butterfly");
    const section2 = document.querySelector("section:nth-of-type(2)");

    const updateButterflyPosition = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const section2Top = section2 ? section2.offsetTop : 0;
      const section2Height = section2 ? section2.offsetHeight : 0;

      let butterflyTop = `calc(50% + ${scrollY * 0.2}px)`;

      if (scrollY + windowHeight > section2Top && scrollY < section2Top + section2Height) {
        butterflyTop = `${section2Top - 100}px`;
      }

      if (butterfly) {
        butterfly.style.top = butterflyTop;
      }
    };

    window.addEventListener("scroll", updateButterflyPosition);
    return () => {
      window.removeEventListener("scroll", updateButterflyPosition);
    };
  }, []);

  // Twinkling stars effect
  useEffect(() => {
    const dots = document.querySelectorAll(".twinkling-stars .dot");

    dots.forEach(dot => {
      const randomX = Math.random() * 100;
      const randomDelay = Math.random() * 3;
      const randomAnimationDuration = Math.random() * 2 + 2;

      dot.style.left = `${randomX}%`;
      dot.style.animationDuration = `${randomAnimationDuration}s`;
      dot.style.animationDelay = `${randomDelay}s`;
    });
  }, []);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* LEFT HALF */}
      <div
  onClick={() => window.location.href = "/mental-health-log"} // or use next/router
  style={{
    width: "50%",
    position: "relative",
    backgroundImage: "url('/images/bg11.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center center",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed",
    color: "#fff",
    fontFamily: "'Love Ya Like A Sister', cursive",
    transition: "transform 0.3s ease-in-out",
    cursor: "pointer",
    transform: "scale(1)",
  }}
  onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
  onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
>

        <div className="twinkling-stars">
        {/* Create multiple dots for twinkling effect */}
        <div className="dot" style={{ top: "10%", left: "15%" }}></div>
        <div className="dot" style={{ top: "30%", left: "25%" }}></div>
        <div className="dot" style={{ top: "50%", left: "40%" }}></div>
        <div className="dot" style={{ top: "70%", left: "44%" }}></div>
        <div className="dot" style={{ top: "80%", left: "47%" }}></div>
        <div className="dot" style={{ top: "20%", left: "32%" }}></div>
        <div className="dot" style={{ top: "60%", left: "48%" }}></div>
        <div className="dot" style={{ top: "40%", left: "10%" }}></div>
        <div className="dot" style={{ top: "90%", left: "35%" }}></div>
        <div className="dot" style={{ top: "13%", left: "3%" }}></div>

        <div className="dot" style={{ top: "50%", left: "37%" }}></div>
        <div className="dot" style={{ top: "100%", left: "4%" }}></div>
        <div className="dot" style={{ top: "90%", left: "6%" }}></div>
        <div className="dot" style={{ top: "110%", left: "7%" }}></div>
        <div className="dot" style={{ top: "120%", left: "8%" }}></div>
        <div className="dot" style={{ top: "60%", left: "9%" }}></div>
        <div className="dot" style={{ top: "100%", left: "8%" }}></div>
        <div className="dot" style={{ top: "80%", left: "12%" }}></div>
        <div className="dot" style={{ top: "130%", left: "24%" }}></div>
        <div className="dot" style={{ top: "55%", left: "6%" }}></div>

        <div className="dot" style={{ top: "5%", left: "37%" }}></div>
        <div className="dot" style={{ top: "10%", left: "4%" }}></div>
        <div className="dot" style={{ top: "15%", left: "6%" }}></div>
        <div className="dot" style={{ top: "20%", left: "22%" }}></div>
        <div className="dot" style={{ top: "25%", left: "8%" }}></div>
        <div className="dot" style={{ top: "30%", left: "19%" }}></div>
        {/* <div className="dot" style={{ top: "35%", left: "98%" }}></div> */}
        {/* <div className="dot" style={{ top: "40%", left: "120%" }}></div> */}
        <div className="dot" style={{ top: "45%", left: "24%" }}></div>
        {/* <div className="dot" style={{ top: "50%", left: "66%" }}></div> */}

        <div className="dot" style={{ top: "-10%", left: "37%" }}></div>
        {/* <div className="dot" style={{ top: "-150%", left: "54%" }}></div> */}
        {/* <div className="dot" style={{ top: "-50%", left: "63%" }}></div> */}
        {/* <div className="dot" style={{ top: "-35%", left: "72%" }}></div> */}
        {/* <div className="dot" style={{ top: "741%", left: "87%" }}></div> */}
        {/* <div className="dot" style={{ top: "600%", left: "79%" }}></div> */}
        {/* <div className="dot" style={{ top: "405%", left: "98%" }}></div> */}
        {/* <div className="dot" style={{ top: "560%", left: "120%" }}></div> */}
        <div className="dot" style={{ top: "880%", left: "24%" }}></div>
        {/* <div className="dot" style={{ top: "750%", left: "66%" }}></div> */}
        
        <div className="dot" style={{ top: "2000%", left: "37%" }}></div>
        {/* <div className="dot" style={{ top: "3000%", left: "54%" }}></div> */}
        {/* <div className="dot" style={{ top: "5000%", left: "63%" }}></div> */}
        {/* <div className="dot" style={{ top: "7000%", left: "72%" }}></div> */}
        {/* <div className="dot" style={{ top: "4200%", left: "87%" }}></div> */}
        {/* <div className="dot" style={{ top: "600%", left: "79%" }}></div> */}
        {/* <div className="dot" style={{ top: "405%", left: "98%" }}></div> */}
        {/* <div className="dot" style={{ top: "560%", left: "120%" }}></div> */}
        <div className="dot" style={{ top: "880%", left: "24%" }}></div>
        {/* <div className="dot" style={{ top: "750%", left: "66%" }}></div> */}

        
      </div>
        {/* Twinkling Stars */}
        {/* <div className="twinkling-stars" style={{ position: "absolute", width: "100%", height: "100%", zIndex: 0 }}>
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="dot"
              style={{
                position: "absolute",
                top: `${Math.random() * 100}%`,
                width: "4px",
                height: "4px",
                borderRadius: "50%",
                backgroundColor: "white",
                opacity: 0.8,
                animation: "twinkle 2s infinite ease-in-out",
              }}
            />
          ))}
        </div> */}

        {/* Butterfly */}
        <div className="butterfly" style={{ position: "absolute", top: "50%", left: "10%", zIndex: 1 }}>
          <img
            src="/images/b.png"
            alt="Butterfly"
            className="butterfly-image"
            style={{
              width: "50px",
              height: "50px",
              position: "absolute",
              top: "50%",
              left: "0",
              transform: "translateY(-50%)",
            }}
          />
        </div>

        {/* Hero Section */}
        <section
          style={{
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            padding: "2rem",
            zIndex: 1,
            position: "relative",
            letterSpacing: "2rem",
          }}
        >
          <h1
            style={{
              fontSize: "15rem",
              lineHeight: "1.2",
              fontWeight: "normal",
              textShadow: "2px 2px 4px rgba(0,0,0,1)",
            }}
          >
            M  O<br />O D
          </h1>
        </section>
      </div>

      {/* RIGHT HALF */}
      <div
        onClick={() => window.location.href = "/progress-log"}
        style={{
          width: "50%",
          height: "100vh",
          backgroundImage: "url('/images/bg1.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          padding: "2rem",
          textAlign: "center",
          flexDirection: "column",
          position: "relative",
          transition: "transform 0.3s ease-in-out",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
      >
        {/* Running Girl Image */}
        <img
          src="/images/run.png"
          alt="Running Girl"
          style={{
            position: "absolute",
            top: "200px",
            left: "15%",
            width: "500px",
            height: "auto",
            zIndex: 1,
          }}
        />

        {/* M O V E text */}
        <section
          style={{
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            padding: "2rem",
            zIndex: 1,
            position: "relative",
            letterSpacing: "4rem",
          }}
        >
          <h1
            style={{
              fontSize: "15rem",
              lineHeight: "1.2",
              fontWeight: "normal",
              textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
              fontFamily: "'Staatliches', sans-serif",
            }}
          >
            M  O<br />V  E
          </h1>
        </section>
      </div>


    </div>
  );
}
