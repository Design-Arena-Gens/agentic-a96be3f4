"use client";

import { FormEvent, useCallback, useMemo, useState } from "react";
import styles from "./page.module.css";

type ToneOption = {
  value: "professional" | "casual" | "enthusiastic" | "authoritative" | "playful";
  label: string;
  helper: string;
};

type CTAOption = {
  value: "readNow" | "learnMore" | "joinConversation" | "subscribe" | "contact";
  label: string;
};

type ApiResponse = {
  title: string;
  url?: string;
  summary: string;
  keywords: string[];
  estimatedReadingTime: string;
  posts: {
    platform: string;
    copy: string;
  }[];
  warnings?: string[];
};

const toneOptions: ToneOption[] = [
  {
    value: "professional",
    label: "Professional",
    helper: "Consultative and polished – perfect for B2B updates.",
  },
  {
    value: "casual",
    label: "Casual",
    helper: "Friendly tone for approachable brand voices.",
  },
  {
    value: "enthusiastic",
    label: "Enthusiastic",
    helper: "High-energy storytelling to spark excitement.",
  },
  {
    value: "authoritative",
    label: "Authoritative",
    helper: "Insight-driven with an expert point of view.",
  },
  {
    value: "playful",
    label: "Playful",
    helper: "Light-hearted copy with personality.",
  },
];

const ctaOptions: CTAOption[] = [
  { value: "readNow", label: "Read now" },
  { value: "learnMore", label: "Learn more" },
  { value: "joinConversation", label: "Join the conversation" },
  { value: "subscribe", label: "Subscribe" },
  { value: "contact", label: "Talk to us" },
];

export default function Home() {
  const [formState, setFormState] = useState({
    url: "",
    fallbackTitle: "",
    customSummary: "",
    tone: toneOptions[0].value,
    callToAction: ctaOptions[0].value,
    audience: "",
    customHashtags: "",
  });
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);

  const parsedHashtagCount = useMemo(() => {
    if (!formState.customHashtags.trim()) {
      return 0;
    }
    return formState.customHashtags
      .split(/[,\n]+/)
      .map((tag) => tag.replace(/#/g, "").trim())
      .filter(Boolean).length;
  }, [formState.customHashtags]);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);
      setIsLoading(true);
      setCopiedPlatform(null);

      const parsedHashtags = formState.customHashtags
        .split(/[,\n]+/)
        .map((tag) => tag.replace(/#/g, "").trim())
        .filter(Boolean);

      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formState,
            customHashtags: parsedHashtags,
          }),
        });

        if (!response.ok) {
          const message = await response.json().catch(() => null);
          throw new Error(
            message?.message ||
              "We couldn't generate the social copy. Please try again."
          );
        }

        const payload: ApiResponse = await response.json();
        setResult(payload);
      } catch (err) {
        setResult(null);
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setIsLoading(false);
      }
    },
    [formState]
  );

  const handleCopy = useCallback((platform: string, copy: string) => {
    navigator.clipboard
      .writeText(copy)
      .then(() => {
        setCopiedPlatform(platform);
        setTimeout(() => {
          setCopiedPlatform((current) =>
            current === platform ? null : current
          );
        }, 2500);
      })
      .catch(() => {
        setError("Clipboard is unavailable. Copy the text manually instead.");
      });
  }, []);

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <h1>Auto-share your blog to every social feed</h1>
        <p>
          Drop a blog link or paste your draft. Agentic Social Share builds
          platform-ready copy for X, LinkedIn, Facebook, and Instagram in one
          click.
        </p>
      </section>

      <section className={styles.panel}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.fieldGroup}>
            <label htmlFor="url">Blog URL</label>
            <input
              id="url"
              type="url"
              placeholder="https://yourdomain.com/blog/post"
              value={formState.url}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  url: event.target.value,
                }))
              }
              inputMode="url"
            />
            <span className={styles.helper}>
              We&apos;ll fetch the article automatically. If the site blocks
              fetches, paste the summary below instead.
            </span>
          </div>

          <div className={styles.fieldGrid}>
            <div>
              <label htmlFor="fallbackTitle">Title override (optional)</label>
              <input
                id="fallbackTitle"
                type="text"
                placeholder="Custom headline for social posts"
                value={formState.fallbackTitle}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    fallbackTitle: event.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label htmlFor="audience">Audience focus (optional)</label>
              <input
                id="audience"
                type="text"
                placeholder="Example: SaaS marketers, product leads"
                value={formState.audience}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    audience: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="summary">Summary or key points (optional)</label>
            <textarea
              id="summary"
              rows={6}
              placeholder="Paste a short summary if the blog is not publicly accessible."
              value={formState.customSummary}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  customSummary: event.target.value,
                }))
              }
            />
          </div>

          <div className={styles.fieldGrid}>
            <div>
              <label htmlFor="tone">Tone</label>
              <select
                id="tone"
                value={formState.tone}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    tone: event.target.value as ToneOption["value"],
                  }))
                }
              >
                {toneOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span className={styles.helper}>
                {
                  toneOptions.find(
                    (option) => option.value === formState.tone
                  )?.helper
                }
              </span>
            </div>

            <div>
              <label htmlFor="cta">Call to action</label>
              <select
                id="cta"
                value={formState.callToAction}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    callToAction: event.target.value as CTAOption["value"],
                  }))
                }
              >
                {ctaOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="hashtags">
              Custom hashtags{" "}
              <span className={styles.countBadge}>{parsedHashtagCount}/10</span>
            </label>
            <textarea
              id="hashtags"
              rows={3}
              placeholder="Separate with commas (e.g. productmarketing,saas,contentstrategy)"
              value={formState.customHashtags}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  customHashtags: event.target.value,
                }))
              }
            />
          </div>

          <button type="submit" className={styles.submit} disabled={isLoading}>
            {isLoading ? "Generating…" : "Generate social copy"}
          </button>
          {error && <p className={styles.error}>{error}</p>}
        </form>
      </section>

      {result && (
        <section className={styles.results}>
          <header className={styles.resultsHeader}>
            <div>
              <h2>{result.title}</h2>
              <p>
                {result.estimatedReadingTime} • Keywords:{" "}
                {result.keywords.slice(0, 5).join(", ")}
              </p>
            </div>
            {result.url && (
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.sourceLink}
              >
                View blog post
              </a>
            )}
          </header>

          <article className={styles.summaryCard}>
            <h3>Summary</h3>
            <p>{result.summary}</p>
          </article>

          {result.warnings && result.warnings.length > 0 && (
            <article className={styles.warningCard}>
              <h3>Heads up</h3>
              <ul>
                {result.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </article>
          )}

          <div className={styles.postsGrid}>
            {result.posts.map((post) => (
              <article key={post.platform} className={styles.postCard}>
                <header>
                  <h3>{post.platform}</h3>
                  <button
                    type="button"
                    onClick={() => handleCopy(post.platform, post.copy)}
                  >
                    {copiedPlatform === post.platform ? "Copied!" : "Copy"}
                  </button>
                </header>
                <pre>{post.copy}</pre>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
