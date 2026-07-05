const docs = [
  {
    id: "trend-services-research",
    title: "트렌드 서비스 조사",
    description: "해외/국내 사례, 차별점, MVP 우선순위를 정리한 리서치 문서",
    path: "docs/trend-services-research.md",
  },
  {
    id: "google-api-research",
    title: "Google API 조사",
    description: "TrendDrop에 맞는 Google 계열 API 후보, 쿼터, 트래픽, 리스크를 정리한 문서",
    path: "docs/google-api-research.md",
  },
];

const docList = document.getElementById("docList");
const docCount = document.getElementById("docCount");
const docTitle = document.getElementById("docTitle");
const docContent = document.getElementById("docContent");
const rawDocLink = document.getElementById("rawDocLink");

function getSelectedDoc() {
  const params = new URLSearchParams(window.location.search);
  const requestedId = params.get("doc");
  return docs.find((doc) => doc.id === requestedId) || docs[0];
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderDocList(selectedId) {
  docCount.textContent = `${docs.length} file${docs.length > 1 ? "s" : ""}`;
  docList.innerHTML = docs
    .map((doc) => `
      <a class="doc-link ${doc.id === selectedId ? "active" : ""}" href="docs.html?doc=${doc.id}">
        <strong>${doc.title}</strong>
        <span>${doc.description}</span>
      </a>
    `)
    .join("");
}

function markdownToHtml(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let inUl = false;
  let inOl = false;
  let inCode = false;
  let paragraph = [];

  function flushParagraph() {
    if (!paragraph.length) {
      return;
    }
    html.push(`<p>${formatInline(paragraph.join(" "))}</p>`);
    paragraph = [];
  }

  function closeLists() {
    if (inUl) {
      html.push("</ul>");
      inUl = false;
    }
    if (inOl) {
      html.push("</ol>");
      inOl = false;
    }
  }

  function formatInline(text) {
    let formatted = escapeHtml(text);
    formatted = formatted.replace(/`([^`]+)`/g, "<code>$1</code>");
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    return formatted;
  }

  for (const line of lines) {
    if (line.startsWith("```")) {
      flushParagraph();
      closeLists();
      if (!inCode) {
        html.push("<pre><code>");
        inCode = true;
      } else {
        html.push("</code></pre>");
        inCode = false;
      }
      continue;
    }

    if (inCode) {
      html.push(`${escapeHtml(line)}\n`);
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      closeLists();
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      closeLists();
      const level = headingMatch[1].length;
      html.push(`<h${level}>${formatInline(headingMatch[2])}</h${level}>`);
      continue;
    }

    const unorderedMatch = line.match(/^-\s+(.*)$/);
    if (unorderedMatch) {
      flushParagraph();
      if (inOl) {
        html.push("</ol>");
        inOl = false;
      }
      if (!inUl) {
        html.push("<ul>");
        inUl = true;
      }
      html.push(`<li>${formatInline(unorderedMatch[1])}</li>`);
      continue;
    }

    const orderedMatch = line.match(/^\d+\.\s+(.*)$/);
    if (orderedMatch) {
      flushParagraph();
      if (inUl) {
        html.push("</ul>");
        inUl = false;
      }
      if (!inOl) {
        html.push("<ol>");
        inOl = true;
      }
      html.push(`<li>${formatInline(orderedMatch[1])}</li>`);
      continue;
    }

    paragraph.push(line.trim());
  }

  flushParagraph();
  closeLists();

  return html.join("");
}

async function renderSelectedDoc() {
  const selectedDoc = getSelectedDoc();
  renderDocList(selectedDoc.id);
  docTitle.textContent = selectedDoc.title;
  rawDocLink.href = selectedDoc.path;

  try {
    const response = await fetch(selectedDoc.path);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const markdown = await response.text();
    docContent.innerHTML = markdownToHtml(markdown);
  } catch (error) {
    docContent.innerHTML = `
      <div class="doc-error">
        <h3>문서를 불러오지 못했습니다</h3>
        <p>정적 호스팅 환경에서는 정상 동작하지만, 로컬 파일로 직접 열면 브라우저 보안 정책 때문에 막힐 수 있습니다.</p>
        <p>GitHub Pages 주소에서 다시 열어보거나 원본 문서를 직접 확인해 주세요.</p>
      </div>
    `;
  }
}

renderSelectedDoc();
