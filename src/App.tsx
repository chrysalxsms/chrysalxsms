import { useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"

type IconName = "file" | "code" | "copy" | "download" | "arrow" | "check" | "close" | "book" | "branch" | "mail" | "info" | "settings"
function Icon({ name, size = 16 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    file: (
      <>
        <path d="M14 2H6v20h14V8z" />
        <path d="M14 2v6h6M9 13h8M9 17h6" />
      </>
    ),
    code: (
      <>
        <path d="m8 7-5 5 5 5m8-10 5 5-5 5M14 4l-4 16" />
      </>
    ),
    copy: (
      <>
        <rect x="8" y="8" width="13" height="13" rx="2" />
        <path d="M16 8V3H3v13h5" />
      </>
    ),
    download: <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" />,
    arrow: <path d="M5 19 19 5M5 5h14v14" />,
    check: <path d="m5 12 4 4L19 6" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    book: (
      <>
        <path d="M4 3h15v18H4zM8 3v18M12 7h4" />
      </>
    ),
    branch: (
      <>
        <circle cx="6" cy="5" r="2" />
        <circle cx="6" cy="19" r="2" />
        <circle cx="18" cy="5" r="2" />
        <path d="M6 7v10m0-4h5a7 7 0 0 0 7-6" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 6 9 7 9-7" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v6m0-10v1" />
      </>
    ),
    settings: (
      <>
        <path d="M4 7h16M4 17h16" />
        <rect x="8" y="4" width="4" height="6" rx="1" />
        <rect x="14" y="14" width="4" height="6" rx="1" />
      </>
    ),
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

function Sprout({ small = false }: { small?: boolean }) {
  return (
    <svg
      className={small ? "sprout small" : "sprout"}
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <path d="M13 24V12h3v12z" fill="#c1a0ae" />
      <path d="M13 17H7v-3H4V8h6v3h3z" fill="#a78794" />
      <path d="M16 13V7h3V4h7v6h-3v3z" fill="#c8a4b3" />
      <path d="M9 24h12v3H9z" fill="#d5b69c" />
    </svg>
  )
}

const tools = [
  ["Py", "Python", "rose"],
  ["Jv", "Java", "peach"],
  ["JS", "JavaScript", "gold"],
  ["TS", "TypeScript", "blue"],
  ["<>", "HTML", "peach"],
  ["#", "CSS", "lavender"],
  ["λ", "Haskell", "lavender"],
  ["C", "C", "blue"],
  ["DB", "SQL", "gold"],
  ["⌘", "Git", "peach"],
  ["Gd", "Godot", "rose"],
  ["Lx", "Linux", "gold"],
]
const languages = [
  { name: "Python", value: "57.4%", color: "#ec9fbb", width: 57.4 },
  { name: "TypeScript", value: "29.5%", color: "#8fbce8", width: 29.5 },
  { name: "JavaScript", value: "6.1%", color: "#efca7d", width: 6.1 },
  { name: "CSS", value: "5.0%", color: "#bd9de2", width: 5 },
  { name: "TeX", value: "1.0%", color: "#e6a282", width: 1 },
  { name: "C", value: "0.3%", color: "#d78db8", width: 0.3 },
  { name: "GDScript", value: "0.2%", color: "#83b4d4", width: 0.2 },
  { name: "HTML", value: "0.2%", color: "#ef938b", width: 0.2 },
  { name: "Java", value: "0.2%", color: "#eac2a3", width: 0.2 },
  { name: "C++", value: "<0.1%", color: "#a5a4e3", width: 0 },
  { name: "Haskell", value: "<0.1%", color: "#cc9ecb", width: 0 },
]

type Profile = {
  name: string
  username: string
  linkedin: string
  email: string
  repo: string
}
const initialProfile: Profile = {
  name: "Aishwarya",
  username: "",
  linkedin: "",
  email: "",
  repo: "",
}
function createMarkdown(profile: Profile) {
  const contacts = [
    profile.linkedin && `[LinkedIn](${profile.linkedin})`,
    profile.email && `[Email](mailto:${profile.email})`,
  ]
    .filter(Boolean)
    .join(" · ")
  return `<!-- Upload the included assets folder alongside this README. -->
![A cozy pixel room with a sunset window, books, a warm desk lamp and my original pixel cat](assets/cozy-banner.svg)

# Hi, I'm ${profile.name}.

I study at KU Leuven and like making cute things with code.
${contacts ? `\n${contacts}\n` : ""}
## Toolbox

${tools.map(([, name]) => `\`${name}\``).join(" ")}

## Languages

| Language | Share |
| :--- | ---: |
${languages.map((language) => `| ${language.name} | ${language.value} |`).join("\n")}

## Practice

**24 problems solved** across LeetCode and NeetCode.

| LeetCode — 12 solved | NeetCode — 12 solved |
| :--- | :--- |
| Easy: 7 · Medium: 5 · Hard: 0 | Python for Beginners: 7 |
| | Data Structures & Algorithms: 5 |

> Stats are updated manually.

## Projects

![Computational geometry visualisation](assets/geometry.svg)

### ${
    profile.repo
      ? `[Computational Geometry Visualisers](${profile.repo})`
      : "Computational Geometry Visualisers"
  }

Interactive visualisers for computational geometry algorithms like convex hulls.

\`JavaScript\` \`Algorithms\`

---

<img src="assets/pixel-cat.svg" width="39" height="45" alt="My little pixel cat" />

`
}

function downloadFile(
  content: string | Blob,
  filename: string,
  type = "text/markdown",
) {
  const url = URL.createObjectURL(
    content instanceof Blob ? content : new Blob([content], { type }),
  )
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string
  children: ReactNode
  onClose: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    dialog.current?.showModal()
  }, [])
  return (
    <dialog
      ref={dialog}
      className="modal"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="modal-heading">
        <h2>{title}</h2>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <Icon name="close" />
        </button>
      </div>
      {children}
    </dialog>
  )
}

export default function App() {
  const [tab, setTab] = useState<"preview" | "code">("preview")
  const [profile, setProfile] = useState(initialProfile)
  const [draft, setDraft] = useState(initialProfile)
  const [modal, setModal] = useState<"export" | "customize" | null>(null)
  const [notice, setNotice] = useState("")
  const markdown = createMarkdown(profile)
  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(""), 3500)
    return () => clearTimeout(timer)
  }, [notice])
  async function copyCode() {
    try {
      await navigator.clipboard.writeText(markdown)
      setNotice("README code copied to clipboard")
    } catch {
      setTab("code")
      setNotice("Clipboard unavailable. Select and copy the code below.")
    }
  }
  async function downloadAsset(name: string) {
    try {
      const response = await fetch(`/readme-assets/${name}`)
      if (!response.ok) throw new Error("Download failed")
      downloadFile(await response.blob(), name, "image/svg+xml")
      setNotice(`${name} downloaded`)
    } catch {
      setNotice("Could not download the asset. Please try again.")
    }
  }
  function configuredLink(url: string, label: ReactNode) {
    return url ? (
      <a href={url} target="_blank" rel="noreferrer" className="contact-link">
        {label}
      </a>
    ) : (
      <button
        className="contact-link"
        onClick={() => {
          setDraft(profile)
          setModal("customize")
        }}
      >
        {label}
      </button>
    )
  }
  return (
    <div className="app">
      <header className="site-header">
        <a className="brand" href="#" aria-label="Little corner home">
          <Sprout />
          <span>
            little corner<span className="brand-dot">.</span>
          </span>
        </a>
        <a
          className="compatibility"
          href="https://docs.github.com/en/account-and-profile/how-tos/profile-customization/managing-your-profile-readme"
          target="_blank"
          rel="noreferrer"
        >
          <Icon name="check" size={14} /> GitHub friendly{" "}
          <Icon name="arrow" size={12} />
        </a>
      </header>

      <main className="workspace">
        <div className="workspace-heading">
          <div>
            <h1>Profile README</h1>
          </div>
          <button className="button primary" onClick={() => setModal("export")}>
            <Icon name="download" /> Export README
          </button>
        </div>

        <section
          className="readme-window"
          aria-label="Profile README workspace"
        >
          <div className="window-toolbar">
            <div className="tabs" role="tablist" aria-label="README view">
              <button
                id="preview-tab"
                role="tab"
                aria-selected={tab === "preview"}
                aria-controls="readme-panel"
                className={tab === "preview" ? "tab active" : "tab"}
                onClick={() => setTab("preview")}
              >
                <Icon name="book" size={15} /> Preview
              </button>
              <button
                id="code-tab"
                role="tab"
                aria-selected={tab === "code"}
                aria-controls="readme-panel"
                className={tab === "code" ? "tab active" : "tab"}
                onClick={() => setTab("code")}
              >
                <Icon name="code" size={15} /> README.md
              </button>
            </div>
            <div className="toolbar-actions">
              <button
                className="icon-button customize-button"
                title="Customize profile"
                aria-label="Customize profile"
                onClick={() => {
                  setDraft(profile)
                  setModal("customize")
                }}
              >
                <Icon name="settings" />
              </button>
              <span className="toolbar-separator" />
              <button className="copy-button" onClick={copyCode}>
                <Icon name="copy" size={14} />
                <span>Copy code</span>
              </button>
            </div>
          </div>

          <div
            id="readme-panel"
            role="tabpanel"
            aria-labelledby={tab === "preview" ? "preview-tab" : "code-tab"}
          >
            {tab === "preview" ? (
              <article className="profile">
                <div className="landscape">
                  <img
                    src="/readme-assets/cozy-banner.svg"
                    alt="A cozy pixel room with a peach sunset outside the window, books, a glowing desk lamp and the original pixel cat"
                  />
                </div>
                <div className="profile-content">
                  <section className="introduction">
                    <div className="name-row">
                      <h2>
                        Hi, I'm <span>{profile.name}.</span>
                      </h2>
                      <span className="student-badge">
                        <span /> Student at KU Leuven
                      </span>
                    </div>
                    <p>
                      I study at KU Leuven and like making cute things with code.
                    </p>
                    <div className="contact-links">
                      {configuredLink(
                        profile.linkedin,
                        <>
                          <span className="linkedin-icon">in</span> LinkedIn{" "}
                          <Icon name="arrow" size={12} />
                        </>,
                      )}
                      {configuredLink(
                        profile.email ? `mailto:${profile.email}` : "",
                        <>
                          <Icon name="mail" size={15} /> Email{" "}
                          <Icon name="arrow" size={12} />
                        </>,
                      )}
                    </div>
                  </section>

                  <section className="toolbox">
                    <h3>
                      <span className="section-symbol">
                        <Icon name="code" size={16} />
                      </span>{" "}
                      Toolbox
                    </h3>
                    <div className="tool-list">
                      {tools.map(([symbol, name, color]) => (
                        <span className="tool" key={name}>
                          <span className={`tool-symbol ${color}`}>
                            {symbol}
                          </span>
                          {name}
                        </span>
                      ))}
                    </div>
                  </section>

                  <section className="language-section">
                    <h3>
                      <span className="section-symbol">
                        <Icon name="branch" size={15} />
                      </span>{" "}
                      Languages
                    </h3>
                    <div
                      className="language-bar"
                      aria-label="Language distribution"
                    >
                      {languages.map((language) => (
                        <span
                          key={language.name}
                          style={{
                            background: language.color,
                            flex: language.width,
                          }}
                          title={`${language.name}: ${language.value}`}
                        />
                      ))}
                    </div>
                    <div className="language-legend">
                      {languages.map((language) => (
                        <span key={language.name}>
                          <i style={{ background: language.color }} />
                          {language.name} <b>{language.value}</b>
                        </span>
                      ))}
                    </div>
                  </section>

                  <section className="learning-section">
                    <h3>
                      <span className="section-symbol">
                        <Icon name="book" size={15} />
                      </span>{" "}
                      Practice{" "}
                      <span className="total-solved">
                        24 <span>solved</span>
                      </span>
                    </h3>
                    <div className="practice-grid">
                      <div className="practice-card">
                        <div className="practice-title">
                          <span>
                            <span className="practice-mark gold">/</span>{" "}
                            LeetCode
                          </span>
                          <span>
                            12 <small>solved</small>
                          </span>
                        </div>
                        <div
                          className="practice-progress"
                          aria-label="7 easy, 5 medium, 0 hard problems"
                        >
                          {Array.from({ length: 36 }, (_, index) => (
                            <i
                              key={index}
                              className={index < 21 ? "easy" : "medium"}
                            />
                          ))}
                        </div>
                        <div className="practice-legend">
                          <span>
                            <i className="easy" />
                            Easy <b>7</b>
                          </span>
                          <span>
                            <i className="medium" />
                            Medium <b>5</b>
                          </span>
                          <span>
                            <i className="hard" />
                            Hard <b>0</b>
                          </span>
                        </div>
                      </div>
                      <div className="practice-card">
                        <div className="practice-title">
                          <span>
                            <span className="practice-mark blue">≋</span>{" "}
                            NeetCode
                          </span>
                          <span>
                            12 <small>solved</small>
                          </span>
                        </div>
                        <div className="course-row">
                          <span>Python for Beginners</span>
                          <b>7</b>
                        </div>
                        <div className="course-row">
                          <span>Data Structures & Algorithms</span>
                          <b>5</b>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="project-section">
                    <h3>
                      <span className="section-symbol">
                        <Icon name="file" size={15} />
                      </span>{" "}
                      Projects
                    </h3>
                    <div className="project-card">
                      <img
                        src="/readme-assets/geometry.svg"
                        alt="Points connected into a convex hull on a coordinate grid"
                      />
                      <div className="project-info">
                        <h4>Computational Geometry Visualisers</h4>
                        <p>
                          Interactive visualisers for computational geometry
                          <br className="desktop-break" /> algorithms like
                          convex hulls.
                        </p>
                        <div className="project-bottom">
                          <span>
                            <i />
                            JavaScript{" "}
                            <span className="project-topic">Algorithms</span>
                          </span>
                          {configuredLink(
                            profile.repo,
                            <>
                              View repo <Icon name="arrow" size={12} />
                            </>,
                          )}
                        </div>
                      </div>
                    </div>
                  </section>

                  <footer className="profile-footer">
                    <img className="footer-cat" src="/readme-assets/pixel-cat.svg" width="39" height="45" alt="My little pixel cat" />
                    <span className="footer-pixels">
                      <i />
                      <i />
                      <i />
                    </span>
                  </footer>
                </div>
              </article>
            ) : (
              <div className="code-view">
                <div className="code-notice">
                  <Icon name="info" /> GitHub-ready Markdown. Native text stays
                  accessible; the pixel artwork is an SVG.
                </div>
                <pre>
                  {markdown.split("\n").map((line, index) => (
                    <div
                      className={`code-line ${
                        line.startsWith("#")
                          ? "code-heading"
                          : line.startsWith("<!--")
                            ? "code-comment"
                            : ""
                      }`}
                      key={index}
                    >
                      <span className="line-number" aria-hidden="true">
                        {index + 1}
                      </span>
                      <code>{line || " "}</code>
                    </div>
                  ))}
                </pre>
              </div>
            )}
          </div>
        </section>

        <div className="below-preview">
          <span>
            <Icon name="info" size={14} /> GitHub uses native fonts and layout. Artwork is included in the export.
          </span>
          <button onClick={() => setModal("export")}>
            How to use it <span>→</span>
          </button>
        </div>
      </main>
      {notice && (
        <div className="toast" role="status">
          <Icon name="check" />
          {notice}
        </div>
      )}
      {modal === "export" && (
        <Modal
          title="Export README"
          onClose={() => setModal(null)}
        >
          <p className="modal-description">
            Download the Markdown and SVG assets, then add them to your profile repository.
          </p>
          <ol className="export-steps">
            <li>
              Create a public repository named{" "}
              <code>
                {profile.username || "your-username"}/
                {profile.username || "your-username"}
              </code>
              .
            </li>
            <li>
              Add <code>README.md</code> at the root. Put all three SVG files in an{" "}
              <code>assets</code> folder.
            </li>
            <li>
              Commit the files. GitHub will show the README on your profile.
            </li>
          </ol>
          <div className="export-files">
            <button
              onClick={() => {
                downloadFile(markdown, "README.md")
                setNotice("README.md downloaded")
              }}
            >
              <Icon name="file" />
              <span>
                README.md<small>Your editable profile content</small>
              </span>
              <Icon name="download" />
            </button>
            <button onClick={() => downloadAsset("cozy-banner.svg")}>
              <Icon name="file" />
              <span>
                assets/cozy-banner.svg<small>Header artwork</small>
              </span>
              <Icon name="download" />
            </button>
            <button onClick={() => downloadAsset("geometry.svg")}>
              <Icon name="file" />
              <span>
                assets/geometry.svg<small>The project illustration</small>
              </span>
              <Icon name="download" />
            </button>
            <button onClick={() => downloadAsset("pixel-cat.svg")}>
              <Icon name="file" />
              <span>
                assets/pixel-cat.svg<small>Your original pixel cat</small>
              </span>
              <Icon name="download" />
            </button>
          </div>
          <p className="export-footnote">
            Download all four files. Text uses GitHub’s native typography;
            colors and layout may differ from this styled preview. Stats are a
            static snapshot.
          </p>
          <button className="button modal-copy" onClick={copyCode}>
            <Icon name="copy" /> Copy Markdown instead
          </button>
        </Modal>
      )}
      {modal === "customize" && (
        <Modal title="Profile details" onClose={() => setModal(null)}>
          <p className="modal-description">
            Add your details to the preview and exported Markdown. Changes stay
            in this session only.
          </p>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              setProfile(draft)
              setModal(null)
              setNotice("Profile details updated")
            }}
          >
            <div className="form-fields">
              {([
                ["name", "Your name", "Aishwarya", "text"],
                ["username", "GitHub username", "your-username", "text"],
                [
                  "linkedin",
                  "LinkedIn URL",
                  "https://www.linkedin.com/in/your-name",
                  "url",
                ],
                ["email", "Email address", "you@example.com", "email"],
                [
                  "repo",
                  "Project repository URL",
                  "https://github.com/you/your-project",
                  "url",
                ],
              ] as const).map(([key, label, placeholder, type]) => (
                <label key={key}>
                  {label}
                  <input
                    required={key === "name"}
                    type={type}
                    placeholder={placeholder}
                    value={draft[key]}
                    onChange={(event) =>
                      setDraft({ ...draft, [key]: event.target.value })
                    }
                  />
                </label>
              ))}
            </div>
            <div className="form-footer">
              <button
                type="button"
                className="button"
                onClick={() => setModal(null)}
              >
                Cancel
              </button>
              <button className="button primary" type="submit">
                Save details <Icon name="check" />
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
