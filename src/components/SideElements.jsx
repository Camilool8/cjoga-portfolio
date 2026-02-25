import { FaGithub, FaLinkedinIn, FaEnvelope } from "react-icons/fa";

function SideElements() {
  const sideStyle = {
    position: "fixed",
    bottom: 0,
    gap: "20px",
    zIndex: 100,
    animation: "hReveal 0.8s 2s var(--ease-out-expo) forwards",
    opacity: 0,
  };

  const linkStyle = {
    color: "var(--text-tertiary)",
    transition: "all 0.25s",
    textDecoration: "none",
    fontSize: "1.1rem",
  };

  const lineStyle = {
    width: "1px",
    height: "80px",
    background: "var(--text-tertiary)",
  };

  return (
    <>
      <div
        className="hidden xl:flex flex-col items-center"
        style={{ ...sideStyle, left: "28px" }}
      >
        <a
          href="https://github.com/Camilool8"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          style={linkStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--accent)";
            e.currentTarget.style.transform = "translateY(-3px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-tertiary)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <FaGithub />
        </a>
        <a
          href="https://www.linkedin.com/in/cjoga"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          style={linkStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--accent)";
            e.currentTarget.style.transform = "translateY(-3px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-tertiary)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <FaLinkedinIn />
        </a>
        <a
          href="mailto:josejoga.opx@gmail.com"
          aria-label="Email"
          style={linkStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--accent)";
            e.currentTarget.style.transform = "translateY(-3px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-tertiary)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <FaEnvelope />
        </a>
        <div style={lineStyle} />
      </div>

      <div
        className="hidden xl:flex flex-col items-center"
        style={{ ...sideStyle, right: "28px" }}
      >
        <a
          href="mailto:josejoga.opx@gmail.com"
          style={{
            ...linkStyle,
            fontFamily: "var(--font-mono)",
            fontSize: "0.72rem",
            writingMode: "vertical-rl",
            letterSpacing: "0.1em",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--accent)";
            e.currentTarget.style.transform = "translateY(-3px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-tertiary)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          josejoga.opx@gmail.com
        </a>
        <div style={lineStyle} />
      </div>
    </>
  );
}

export default SideElements;
