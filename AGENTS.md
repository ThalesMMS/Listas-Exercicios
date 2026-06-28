# Agent Instructions

When creating code:

Static page. HTML, CSS, JavaScript, and SVGs/images allowed.
-   Data files (JSON, Markdown) and local web fonts allowed.
-   Strict rule: No external dependencies or external API calls.

If you are on branch main, do not create new branches.

When answering questions in the chat:

- Write the response as plain Markdown that the IDE chat can render.
- Use Markdown formatting: `**bold**`, `*italic*`, `` `inline code` ``, and fenced code blocks for actual code.
- Do **not** paste raw JavaScript string concatenations (e.g., `"<b>..." + "..."`) as part of the explanation text.
- When quoting text that is stored as HTML inside JS strings, extract the rendered text and present it in Markdown instead.
- Use file citations (`@/path/to/file.ext:line`) for references, but keep the code block content readable and runnable. Do not include the surrounding quotes or `+` operators unless the snippet is meant to show the actual source string literal.
- Avoid relying on HTML tags in the chat; they may not render as expected.
