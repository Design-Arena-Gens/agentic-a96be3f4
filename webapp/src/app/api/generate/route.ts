import { NextResponse } from "next/server";
import { z } from "zod";
import { fetchArticleContent } from "@/lib/article";
import {
  generateSocialPosts,
  normalizeWhitespace,
  type CallToAction,
  type Tone,
} from "@/lib/generator";

const requestSchema = z.object({
  url: z
    .string()
    .url({ message: "Please provide a valid URL." })
    .optional()
    .or(z.literal("")),
  fallbackTitle: z.string().max(160).optional(),
  customSummary: z.string().max(8000).optional(),
  tone: z.enum([
    "professional",
    "casual",
    "enthusiastic",
    "authoritative",
    "playful",
  ]),
  callToAction: z.enum([
    "readNow",
    "learnMore",
    "joinConversation",
    "subscribe",
    "contact",
  ]),
  audience: z.string().max(160).optional(),
  customHashtags: z.array(z.string().max(60)).optional(),
});

type RequestPayload = z.infer<typeof requestSchema>;

export async function POST(request: Request) {
  let payload: RequestPayload;

  try {
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Invalid request payload.",
          issues: parsed.error.format(),
        },
        { status: 400 }
      );
    }
    payload = parsed.data;
  } catch (error) {
    return NextResponse.json(
      { message: "Unable to parse request payload." },
      { status: 400 }
    );
  }

  const {
    url,
    fallbackTitle,
    customSummary,
    tone,
    callToAction,
    audience,
    customHashtags,
  } = payload;

  if (!url && !customSummary) {
    return NextResponse.json(
      {
        message: "Provide a blog URL or paste the blog content.",
      },
      { status: 400 }
    );
  }

  const sanitizedHashtags = sanitizeHashtags(customHashtags);
  let collectedWarnings: string[] = [];
  let articleTitle = fallbackTitle?.trim() ?? "";
  let articleContent = normalizeWhitespace(customSummary ?? "");
  const resolvedUrl = url?.trim() || "";

  if (resolvedUrl) {
    try {
      const article = await fetchArticleContent(resolvedUrl);
      articleTitle = article.title || articleTitle;
      articleContent = article.content || articleContent;
    } catch (error) {
      const synopsis = articleContent
        ? "Falling back to the provided summary."
        : "No fallback text provided.";
      collectedWarnings.push(
        `Failed to fetch the blog post. ${
          error instanceof Error ? error.message : "Unknown error."
        } ${synopsis}`
      );
    }
  }

  if (!articleContent) {
    return NextResponse.json(
      {
        message:
          "Unable to extract content from the blog. Please paste a summary manually.",
        warnings: collectedWarnings,
      },
      { status: 422 }
    );
  }

  const title =
    articleTitle ||
    deriveTitleFromBody(articleContent) ||
    "Untitled blog post";

  const result = generateSocialPosts(
    {
      title,
      body: articleContent,
      tone: tone as Tone,
      callToAction: callToAction as CallToAction,
      url: resolvedUrl || undefined,
      audience,
      customHashtags: sanitizedHashtags,
    },
    undefined
  );

  return NextResponse.json({
    title,
    url: resolvedUrl || undefined,
    summary: result.summary,
    keywords: result.keywords,
    estimatedReadingTime: result.estimatedReadingTime,
    posts: result.posts,
    warnings: collectedWarnings,
  });
}

function sanitizeHashtags(input?: string[]): string[] | undefined {
  if (!input || input.length === 0) {
    return undefined;
  }
  const tags = input
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) =>
      item.startsWith("#") ? item.replace(/\s+/g, "") : `#${item.replace(/\s+/g, "")}`
    )
    .map((item) => item.replace(/[^#\w]/g, ""))
    .filter((item) => item.length > 1);

  return tags.length ? Array.from(new Set(tags)) : undefined;
}

function deriveTitleFromBody(body: string): string | undefined {
  const sentences = body
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);
  return sentences[0]?.slice(0, 120);
}
