# ContextBridge reel: captions

Facts below come from the ContextBridge Benchmark Report (v0.3.3, 2026-10-12), the `contextbridge-site` repo and the project README. Format choices follow the research notes at the end.

## Instagram / Reels / Shorts (short, hook first, 4 hashtags)

```
Your AI coding session ends. Your engineering context shouldn't.

ContextBridge saves the real state of your repo, records the tests you actually ran, and tells the next session if it's safe to edit: READY, REVIEW_REQUIRED or BLOCKED.

Measured, not claimed: 85/86 scenarios, 143 ms on 10,000 files, 17.4× smaller than a git dump.

Free and open source. pip install contextbridge-cli

#ClaudeCode #AICoding #OpenSource #DevTools

Orvantia Builds
```

## LinkedIn (a little longer, 3 hashtags at the end)

```
A new AI coding session starts with no memory. The handoff says it's done. The repo says otherwise.

We built ContextBridge so the next session, account or agent checks reality before it edits anything. It checkpoints your branch, HEAD and file hashes, records the tests you actually ran, and returns one verdict: READY, REVIEW_REQUIRED or BLOCKED.

What the benchmark shows (v0.3.3, one Apple M3, author-written scenarios):
• 85 of 86 labeled drift scenarios return the expected verdict
• 799 of 800 random git histories agree with an independent oracle
• 143 ms to check 10,000 files with 500 uncommitted changes
• a resume check costs a median of 65 tokens; on the Orvantia OS repo the full handoff is 17.4× smaller than a git dump
• 0 dependencies, 0 network calls

It's honest about its limits, too: it can't see a remote you haven't fetched, and it doesn't measure whether agents finish tasks better. The full report is public.

Open source, MIT. pip install contextbridge-cli
github.com/Abhinay2206/ContextBridge

#ClaudeCode #OpenSource #AICoding

Built by Orvantia Builds
```

## X / short text (one line + link)

```
Your AI coding session can end. Your engineering context shouldn't. ContextBridge: a resume safety gate for AI coding sessions. Open source, local-first, zero dependencies. github.com/Abhinay2206/ContextBridge
```

## Cover text

`Context outlives the session.` (the site's tagline) with the Orvantia Builds credit. The 9:16 cover keeps all text inside the central 4:5 area, so the Instagram grid crop won't cut it.

## Notes on the choices

- **Length and hook.** Sources disagree on exact numbers (under about 125 characters, under 30 words, or "match the purpose"), so the Instagram caption leads with a one-line hook and keeps the rest to three short lines. LinkedIn truncates mobile previews, so its first line carries the hook. One vendor suggests 200-400 characters for LinkedIn; ours is longer because it carries the benchmark figures, so trim the bullets if you want it shorter.
- **Hashtags.** The consistent advice is 3-5 relevant tags (2-3 on LinkedIn). I could not verify hashtag volume for #ClaudeCode, #AICoding or #DevTools on any platform, so check each tag's post count in the app before posting and swap any that look dead.
- **Claims.** The benchmark was run on one machine by the author, and the report says so. The LinkedIn caption repeats that rather than implying independent testing.
- **Sources:** [Instagram Reels caption guidance](https://www.trymypost.com/blog/instagram-reels-caption-optimization-strategy-2026), [Reels best practices](https://blog.brandghost.ai/posts/instagram-reels-best-practices-for-creators/), [Instagram caption SEO](https://www.truefuturemedia.com/articles/instagram-reach-2026-algorithm-reels-carousels-caption-seo), [LinkedIn video captions](https://www.opus.pro/blog/linkedin-video-caption-subtitle-best-practices). These are marketing blogs, not platform documentation, so treat them as rules of thumb.
