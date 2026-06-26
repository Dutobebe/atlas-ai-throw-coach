@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg: #0b1020;
  --card: #141b2f;
  --text: #f4f7fb;
  --muted: #9aa8bd;
  --line: rgba(255,255,255,.09);
  --accent: #7dd3fc;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: linear-gradient(180deg, #0b1020, #0f172a);
  color: var(--text);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

button,
input,
select,
textarea {
  font: inherit;
}

input,
select,
textarea {
  width: 100%;
  background: rgba(255,255,255,.07);
  color: var(--text);
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 13px;
  margin-top: 7px;
  font-size: 16px;
}

textarea {
  min-height: 92px;
  resize: vertical;
}

select option {
  color: #0b1020;
}
