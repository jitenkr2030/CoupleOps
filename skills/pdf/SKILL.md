---
name: pdf
description: Comprehensive PDF manipulation toolkit for extracting text and tables, creating new PDFs, merging/splitting documents, and handling forms. When Claude needs to fill in a PDF form or programmatically process, generate, or analyze PDF documents at scale.
license: Proprietary. LICENSE.txt has complete terms
---

# PDF Processing Guide

## Overview

This guide covers essential PDF processing operations using Python libraries and command-line tools. For advanced features, JavaScript libraries, and detailed examples, see reference.md. If you need to fill out a PDF form, read forms.md and follow its instructions.

Role: You are a Professional Document Architect and Technical Editor specializing in high-density, industry-standard PDF content creation. If the content is not rich enough, use the web-search skill first.

Objective: Generate content that is information-rich, structured for maximum professional utility, and optimized for a compact, low-padding layout without sacrificing readability.

---


## Core Constraints (Must Follow)

### 1. Output Language
**Generated PDF must use the same language as user's query.**
- Chinese query → Generate Chinese PDF content
- English query → Generate English PDF content
- Explicit language specification → Follow user's choice

### 2. Page Count Control
- Follow user's page specifications strictly

| User Input | Execution Rule |
|------------|----------------|
| Explicit count (e.g., "3 pages") | Match exactly; allow partial final page |
| Unspecified | Determine based on document type; prioritize completeness over brevity |

**Avoid these mistakes**:
- Cutting content short (brevity is not a valid excuse)
- Filling pages with low-density bullet lists (keep information dense)
- Creating documents over 2x the requested length

**Resume/CV exception**:
- Target **1 page** by default unless otherwise instructed
- Apply tight margins: `margin: 1.5cm`

### 3. Structure Compliance (Mandatory)
**User supplies outline**:
- **Strictly follow** the outline structure provided by user
- Match section names from outline (slight rewording OK; preserve hierarchy and sequence)
- Never add/remove sections on your own
- If structure seems flawed, **confirm with user** before changing

**No outline provided**:
- Deploy standard frameworks by document category:
  - **Academic papers**: IMRaD format (Introduction-Methods-Results-Discussion) or Introduction-Literature Review-Methods-Results-Discussion-Conclusion
  - **Business reports**: Top-down approach (Executive Summary → In-depth Analysis → Recommendations)
  - **Technical guides**: Overview → Core Concepts → Implementation → Examples → FAQ
  - **Academic assignments**: Match assignment rubric structure
- Ensure logical flow between sections without gaps

### 4. Information Sourcing Requirements

#### CRITICAL: Verify Before Writing
**Never invent facts. If unsure, SEARCH immediately.**

Mandatory search triggers - You **MUST search FIRST** if content includes ANY of the following::
- Quantitative data, metrics, percentages, rankings
- Legal/regulatory frameworks, policies, industry standards
- Scholarly findings, theoretical models, research methods
- Recent news, emerging trends
- **Any information you cannot verify with certainty**

## Font Setup (Guaranteed Success Method)

### Allowed Fonts Only
**You MUST ONLY use the following registered fonts. Using ANY other font is STRICTLY FORBIDDEN and will cause rendering failures.**

| Font Name | Usage | Path |
|-----------|-------|------|
| `Microsoft YaHei` | Chinese headings | `/usr/share/fonts/truetype/chinese/msyh.ttf` |
| `SimHei` | Chinese body text | `/usr/share/fonts/truetype/chinese/SimHei.ttf` |
| `SarasaMonoSC` | Chinese code blocks | `/usr/share/fonts/truetype/chinese/SarasaMonoSC-Regular.ttf` |
| `Times New Roman` | English text, numbers, tables | `/usr/share/fonts/truetype/english/Times-New-Roman.ttf` |
| `Calibri` | English alternative | `/usr/share/fonts/truetype/english/calibri-regular.ttf` |
| `DejaVuSans` | Formulas, symbols, code | `/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf` |

**FORBIDDEN fonts**: Arial, Arial-Bold, Arial-Italic, Helvetica, Helvetica-Bold, Helvetica-Oblique, Courier, Courier-Bold, and any font not listed above.

### Font Registration Template
```python
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# Chinese fonts
pdfmetrics.registerFont(TTFont('Microsoft YaHei', '/usr/share/fonts/truetype/chinese/msyh.ttf'))
pdfmetrics.registerFont(TTFont('SimHei', '/usr/share/fonts/truetype/chinese/SimHei.ttf'))
pdfmetrics.registerFont(TTFont("SarasaMonoSC", '/usr/share/fonts/truetype/chinese/SarasaMonoSC-Regular.ttf'))

# English fonts
pdfmetrics.registerFont(TTFont('Times New Roman', '/usr/share/fonts/truetype/english/Times-New-Roman.ttf'))
pdfmetrics.registerFont(TTFont('Calibri', '/usr/share/fonts/truetype/english/calibri-regular.ttf'))

# Symbol/Formula font
pdfmetrics.registerFont(TTFont("DejaVuSans", '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'))

# CRITICAL: Register font families to enable <b>, <super>, <sub> tags
registerFontFamily('Microsoft YaHei', normal='Microsoft YaHei', bold='Microsoft YaHei')
registerFontFamily('SimHei', normal='SimHei', bold='SimHei')
registerFontFamily('Times New Roman', normal='Times New Roman', bold='Times New Roman')
registerFontFamily('Calibri', normal='Calibri', bold='Calibri')
registerFontFamily('DejaVuSans', normal='DejaVuSans', bold='DejaVuSans')
```

### Font Configuration by Document Type

**For Chinese PDFs:**
- Body text: `SimHei` or `Microsoft YaHei`
- Headings: `Microsoft YaHei`
- Code blocks: `SarasaMonoSC`
- Formulas/symbols: `DejaVuSans`

**For English PDFs:**
- Body text: `Times New Roman`
- Headings: `Times New Roman`
- Code blocks: `DejaVuSans`

**For Mixed Chinese-English Documents:**
- Chinese text: Use `SimHei` or `Microsoft YaHei`
- English text and numbers: Use `Times New Roman`
- **In tables**: ALL English content and numbers MUST use `Times New Roman`
- **Mixed Strings**: Use inline `<font name='...'>` tags for different parts:

```python
body_style = ParagraphStyle(
    name="BodyStyle",
    fontName="Times New Roman",
    fontSize=10.5,
    leading=18,
    alignment=TA_JUSTIFY,
)
story.append(Paragraph("My name is Lei Shen (<font name='SimHei'>沈磊</font>)", body_style))
```

### Chinese Plot PNG Method
```python
import matplotlib.pyplot as plt
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False
```

### Available Font Paths
Run `fc-list` to get more fonts. Font files are typically located under:
- `/usr/share/fonts/truetype/chinese/`
- `/usr/share/fonts/truetype/english/`
- `/usr/share/fonts/`

## Guidelines for Output

1. **Information Density**: Prioritize depth and conciseness. Avoid fluff or excessive introductory filler. Use professional, precise terminology.

2. **Structural Hierarchy**: Use nested headings (H1, H2, H3) and logical numbering (e.g., 1.1, 1.1.1) to organize complex data.

3. **Data Formatting**: Convert long paragraphs into structured tables, multi-column lists, or compact bullet points wherever possible to reduce vertical whitespace.

4. **Visual Rhythm**: Use horizontal rules (---) to separate major sections. Ensure a high text-to-whitespace ratio while maintaining a clear scannable path for the eye.

5. **Technical Precision**: Use LaTeX for all mathematical or scientific notations. Ensure all tables are formatted with clear headers.

6. **Tone**: Academic, corporate, and authoritative. Adapt to the specific professional field (e.g., Legal, Engineering, Financial) as requested.

7. **Data Presentation**:
   - When comparing data or showing trends, use charts instead of plain text lists
   - Tables use the standard color scheme defined below

8. **Links & References**:
   - URLs must be clickable hyperlinks
   - Multiple figures/tables add numbering and cross-references ("see Figure 1", "as shown in Table 2")
   - Academic/legal/data analysis citation scenarios implement correct in-text click-to-jump references with corresponding footnotes/endnotes

## Layout & Spacing Control

### Page Break Rules
- NEVER insert page breaks between sections (e.g. H1，H2, H3) or within chapters
- Let content flow naturally; avoid forcing new pages
- **Specific allowed locations**:
  * Between the cover page and table of contents (if TOC exists)
  * Between the cover page and main content (if NO TOC exists)
  * Between the table of contents and main content (if TOC exists)
  * Between the main content and back cover page (if back cover page exists)

### Vertical Spacing Standards
* **Before tables**: `Spacer(1, 18)` after preceding text content (symmetric with table+caption block bottom spacing)
* After tables: `Spacer(1, 6)` before table caption
* After table captions: `Spacer(1, 18)` before next content (larger gap for table+caption blocks)
* Between paragraphs: `Spacer(1, 12)` (approximately 1 line)
* Between H3 subsections: `Spacer(1, 12)`
* Between H2 sections: `Spacer(1, 18)` (approximately 1.5 lines)
* Between H1 sections: `Spacer(1, 24)` (approximately 2 lines)
* NEVER use `Spacer(1, X)` where X > 24, except for intentional H1 major section breaks or cover page elements

### Cover Page Specifications
When creating PDFs with cover pages, use the following enlarged specifications:
**IMPORTANT:**
- A PDF file can contain ONLY ONE cover page and ONE back cover page.
- The cover page and back cover page MUST use `TA_CENTER` alignment. 

**Title Formatting:**
- Main title font size: `36-48pt` (vs normal heading 18-20pt)
- Subtitle font size: `18-24pt`
- Author/date font size: `14-16pt`

**Cover Page Spacing:**
- Top margin to title: `Spacer(1, 120)` or more (push title to upper-middle area)
- After main title: `Spacer(1, 36)` before subtitle
- After subtitle: `Spacer(1, 48)` before author/institution info
- Between author lines: `Spacer(1, 18)`
- After author block: `Spacer(1, 60)` before date
- Use `PageBreak()` after cover page content and before back cover page

**Cover Page Style Example:**
```python
# Cover page styles
cover_title_style = ParagraphStyle(
    name='CoverTitle',
    fontName='Microsoft YaHei',  # or 'Times New Roman' for English
    fontSize=42,
    leading=50,
    alignment=TA_CENTER,
    spaceAfter=36
)

cover_subtitle_style = ParagraphStyle(
    name='CoverSubtitle',
    fontName='SimHei',  # or 'Times New Roman' for English
    fontSize=20,
    leading=28,
    alignment=TA_CENTER,
    spaceAfter=48
)

cover_author_style = ParagraphStyle(
    name='CoverAuthor',
    fontName='SimHei',  # or 'Times New Roman' for English
    fontSize=14,
    leading=22,
    alignment=TA_CENTER,
    spaceAfter=18
)

# Cover page construction
story.append(Spacer(1, 120))  # Push down from top
story.append(Paragraph("报告主标题", cover_title_style))
story.append(Spacer(1, 36))
story.append(Paragraph("副标题或说明文字", cover_subtitle_style))
story.append(Spacer(1, 48))
story.append(Paragraph("作者姓名", cover_author_style))
story.append(Paragraph("所属机构", cover_author_style))
story.append(Spacer(1, 60))
story.append(Paragraph("2025年2月", cover_author_style))
story.append(PageBreak())  # Always page break after cover
```

### Alignment and Typography
- **CJK body**: Use `TA_LEFT` + 2-char indent. Headings: no indent.
- **Font sizes**: Body 11pt, subheadings 14pt, headings 18-20pt
- **Line height**: 1.5-1.6 (keep line leading at 1.2x font size minimum for readability)
- **CRITICAL: Alignment Selection Rule**:
  - Use `TA_JUSTIFY` only when **ALL** of the following conditions are met:
    * Language: The text is predominantly English (≥ 90%)
    * Column width: Sufficiently wide (A4 single-column body text)
    * Font: Western fonts (e.g. Times New Roman / Calibri)
    * Chinese content: None or negligible
  - Otherwise, always default to `TA_LEFT`
  - **Note**: CJK text with `TA_JUSTIFY` can cause orphaned punctuation (commas, periods) at line start
  - For Chinese text, always add `wordWrap='CJK'` to ParagraphStyle to ensure proper typography rules

### Style Configuration
* Normal paragraph: `spaceBefore=0`, `spaceAfter=6-12`
* Headings: `spaceBefore=12-18`, `spaceAfter=6-12`
* **Headings must be bold**: Use `<b></b>` tags in Paragraph (requires `registerFontFamily()` call first)
* Table captions: `spaceBefore=3`, `spaceAfter=6`, `alignment=TA_CENTER`

### Table Formatting

#### Standard Table Color Scheme
```python
TABLE_HEADER_COLOR = colors.HexColor('#1F4E79')  # Dark blue for header
TABLE_HEADER_TEXT = colors.white                  # White text for header
TABLE_ROW_EVEN = colors.white                     # White for even rows
TABLE_ROW_ODD = colors.HexColor('#F5F5F5')        # Light gray for odd rows
```

**Table Rules:**
- A caption must be added immediately after the table (centered)
- The entire table must be centered on the page
- **Max Table Widths**: The max colWidths parameter is 7.5inch or 20cm or 540pt.
- **Table Header**: Must use bold white text (colors.white) with dark blue background (#1F4E79).
- **Cell Formatting**: Left/Right padding 120-200 twips; consistent alignment within same table
- **Color Rules**: In dark blue background (#1F4E79), MUST use white text (colors.white). In white/light gray background, MUST use black text.
- **Color consistency**: If a single PDF contains multiple tables, only one color scheme is allowed across all tables.

#### Table Cell Paragraph Wrapping (MANDATORY)

**ALL text content in table cells MUST be wrapped in `Paragraph()`.** Plain strings will NOT render formatting tags.

```python
# Define styles
header_style = ParagraphStyle(
    name='TableHeader',
    fontName='Times New Roman',
    fontSize=11,
    textColor=colors.white,
    alignment=TA_CENTER
)

cell_style = ParagraphStyle(
    name='TableCell',
    fontName='Times New Roman',
    fontSize=10,
    textColor=colors.black,
    alignment=TA_CENTER
)

# For Chinese tables, add wordWrap="CJK"
tbl_center = ParagraphStyle(
    "tbl_center",
    fontName="SimHei",
    fontSize=9,
    leading=12,
    alignment=TA_CENTER,
    wordWrap="CJK",
)

# ✅ CORRECT: All table text content wrapped in Paragraph()
data = [
    [Paragraph('<b>Parameter</b>', header_style), Paragraph('<b>Unit</b>', header_style), Paragraph('<b>Value</b>', header_style)],
    [Paragraph('Temperature', cell_style), Paragraph('°C', cell_style), Paragraph('25.5', cell_style)],
    [Paragraph('Pressure', cell_style), Paragraph('Pa', cell_style), Paragraph('1.01 x 10<super>5</super>', cell_style)],
    [Paragraph('Density', cell_style), Paragraph('kg/m<super>3</super>', cell_style), Paragraph('1.225', cell_style)],
    [Paragraph('H<sub>2</sub>O Content', cell_style), Paragraph('%', cell_style), Paragraph('45.2', cell_style)],
]

# ❌ PROHIBITED: Plain strings
# data = [['<b>Header</b>', 'Value'], ['Pressure', '1.01 x 10<super>5</super>']]

table = Table(data, colWidths=[120, 80, 100])
table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#F5F5F5')),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))
```

**Exception**: `Image()` objects can be placed directly in table cells without Paragraph wrapping.

### PDF Metadata (REQUIRED)

**ALL PDFs MUST have proper metadata set during creation.**

- **Title**: MUST match the filename (without .pdf extension)
- **Author**: MUST be set to "Z.ai"
- **Creator**: MUST be set to "Z.ai"
- **Subject**: SHOULD describe the document purpose/content

#### For reportlab (Creating New PDFs)
```python
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate
import os

pdf_filename = "financial_report_2024.pdf"
title_for_metadata = os.path.splitext(pdf_filename)[0]

doc = SimpleDocTemplate(
    pdf_filename,
    pagesize=letter,
    title=title_for_metadata,
    author='Z.ai',
    creator='Z.ai',
    subject='Annual financial analysis and performance metrics'
)
```

#### For pypdf (Modifying Existing PDFs)
```python
from pypdf import PdfReader, PdfWriter
import os

pdf_filename = "output.pdf"
title_for_metadata = os.path.splitext(os.path.basename(pdf_filename))[0]

reader = PdfReader("input.pdf")
writer = PdfWriter()

for page in reader.pages:
    writer.add_page(page)

# Set metadata: Title, Author, Creator are REQUIRED
writer.add_metadata({
    '/Title': title_for_metadata,  # MUST: Match filename
    '/Author': 'Z.ai',             # MUST: Set to "Z.ai"
    '/Subject': 'Document purpose description',  # SHOULD: Describe purpose
    '/Creator': 'Z.ai'             # MUST: Set to "Z.ai"
})

with open(pdf_filename, "wb") as output:
    writer.write(output)
```

## Quick Start

⚠️ ABSOLUTE MANDATORY RULE - Z.ai Metadata (DO NOT SKIP)
This rule is NON-NEGOTIABLE - You MUST execute this without exception

For EVERY PDF you generate, no matter what:

After doc.build(story) completes → YOU MUST call add_zai_metadata()
This is AUTOMATIC - do not wait for user confirmation
This happens BEFORE any response to user
Workflow:

- Step 1: Create PDF
```python
doc.build(story)
print("PDF built")
```
- Step 2: (MANDATORY - DO NOT SKIP) Add metadata immediately using the standalone script:
```bash
python scripts/add_zai_metadata.py output.pdf
```
- Step 3: Only AFTER metadata added, report to user
```python
print("✓ PDF generated with Z.ai metadata")
```
If you forget this:

User will notice and ask "Why no metadata?"
This harms Z.ai branding
This rule is CRITICAL and must be followed 100% of the time

```python
from pypdf import PdfReader, PdfWriter

# Read a PDF
reader = PdfReader("document.pdf")
print(f"Pages: {len(reader.pages)}")

# Extract text
text = ""
for page in reader.pages:
    text += page.extract_text()
```

## Python Libraries

### pypdf - Basic Operations

#### Merge PDFs
```python
from pypdf import PdfWriter, PdfReader

writer = PdfWriter()
for pdf_file in ["doc1.pdf", "doc2.pdf", "doc3.pdf"]:
    reader = PdfReader(pdf_file)
    for page in reader.pages:
        writer.add_page(page)

with open("merged.pdf", "wb") as output:
    writer.write(output)
```

#### Split PDF
```python
reader = PdfReader("input.pdf")
for i, page in enumerate(reader.pages):
    writer = PdfWriter()
    writer.add_page(page)
    with open(f"page_{i+1}.pdf", "wb") as output:
        writer.write(output)
```

#### Extract Metadata
```python
reader = PdfReader("document.pdf")
meta = reader.metadata
print(f"Title: {meta.title}")
print(f"Author: {meta.author}")
print(f"Subject: {meta.subject}")
print(f"Creator: {meta.creator}")
```

#### Set/Update Metadata (Z.ai Branding)

Use the standalone script to add Z.ai branding metadata:

```bash
# Add metadata to a single PDF (in-place)
python scripts/add_zai_metadata.py document.pdf

# Add metadata with custom title
python scripts/add_zai_metadata.py report.pdf -t "Q4 Financial Analysis"

# Batch process multiple PDFs
python scripts/add_zai_metadata.py *.pdf
```

#### Rotate Pages
```python
reader = PdfReader("input.pdf")
writer = PdfWriter()

page = reader.pages[0]
page.rotate(90)  # Rotate 90 degrees clockwise
writer.add_page(page)

with open("rotated.pdf", "wb") as output:
    writer.write(output)
```

### pdfplumber - Text and Table Extraction

#### Extract Text with Layout
```python
import pdfplumber

with pdfplumber.open("document.pdf") as pdf:
    for page in pdf.pages:
        text = page.extract_text()
        print(text)
```

#### Extract Tables
```python
with pdfplumber.open("document.pdf") as pdf:
    for i, page in enumerate(pdf.pages):
        tables = page.extract_tables()
        for j, table in enumerate(tables):
            print(f"Table {j+1} on page {i+1}:")
            for row in table:
                print(row)
```

### reportlab - Create PDFs

#### Choosing the Right DocTemplate and Build Method

| Requirement | DocTemplate | Build Method |
|-------------|-------------|--------------|
| Multi-page with TOC | `TocDocTemplate` | `multiBuild()` |
| Single-page or no TOC | `SimpleDocTemplate` | `build()` |
| With Cross-References (no TOC) | `SimpleDocTemplate` | `build()` |
| Both TOC + Cross-References | `TocDocTemplate` | `multiBuild()` |

**CRITICAL**:
- `multiBuild()` is ONLY needed when using `TableOfContents`
- Using `build()` with `TocDocTemplate` = TOC won't work
- Using `multiBuild()` without `TocDocTemplate` = unnecessary overhead

#### Handling Scientific Notation and Special Characters

**NEVER use Unicode superscript/subscript characters or multiplication signs directly.** Use `<super></super>` and `<sub></sub>` tags inside Paragraph objects:

```python
from reportlab.platypus import Paragraph
from reportlab.lib.styles import getSampleStyleSheet

styles = getSampleStyleSheet()

# RIGHT: Use HTML-style tags in Paragraph objects with letter 'x' for multiplication
sci_notation = Paragraph("-1.246 x 10<super>8</super>", styles['Normal'])
chemical = Paragraph("H<sub>2</sub>O", styles['Normal'])
unit = Paragraph("W/m<super>2</super>", styles['Normal'])
```

**Numeric Values Rules:**
- Large numbers (|value| ≥ 10000): Use `Paragraph('coefficient x 10<super>exponent</super>', style)`
- Small decimals (|value| ≤ 0.001): Use scientific notation
- Units with exponents: `Paragraph('kg/m<super>3</super>', style)` (not `kg/m3`)

#### Preventing Unwanted Line Breaks

**Problem 1: English names broken at awkward positions**
```python
# PROHIBITED: "K.G. Palepu" may break after "K.G."
text = Paragraph("Professors (K.G. Palepu) proposed...",style)

# RIGHT: Use non-breaking space (U+00A0) to prevent breaking
text = Paragraph("Professors (K.G.\u00A0Palepu) proposed...",style)
```

**Problem 2: Punctuation at line start**
```python
# RIGHT: Add wordWrap='CJK' for proper typography
styles.add(ParagraphStyle(
    name='BodyStyle',
    fontName='SimHei',
    fontSize=10.5,
    leading=18,
    alignment=TA_LEFT,
    wordWrap='CJK'  # Prevents orphaned punctuation
))
```

**Problem 3: Creating intentional line breaks**
```python
# PROHIBITED: Normal newline character does NOT create line breaks
text = Paragraph("Line 1\nLine 2\nLine 3", style)  # Will render as single line!

# RIGHT: Use <br/> tag for line breaks
text = Paragraph("Line 1<br/>Line 2<br/>Line 3", style)

# Alternative: Split into multiple Paragraph objects
story.append(Paragraph("Line 1", style))
story.append(Paragraph("Line 2", style))
story.append(Paragraph("Line 3", style))
```

#### Basic PDF Creation
```python
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

c = canvas.Canvas("hello.pdf", pagesize=letter)
width, height = letter

# Add text
c.drawString(100, height - 100, "Hello World!")
c.drawString(100, height - 120, "This is a PDF created with reportlab")

# Add a line
c.line(100, height - 140, 400, height - 140)

# Save
c.save()
```

#### Auto-Generated Table of Contents

## ⚠️ CRITICAL WARNINGS

### ❌ FORBIDDEN: Manual Table of Contents

**NEVER manually create TOC like this:**
```python
# ❌ PROHIBIT - DO NOT USE
toc_entries = [("1. Title", "5"), ("2. Section", "10")]
for entry, page in toc_entries:
    story.append(Paragraph(f"{entry} {'.'*50} {page}", style))
```

**Why it's PROHIBIT:**
- Hardcoded page numbers become incorrect when content changes
- No clickable hyperlinks
- Manual leader dots are fragile
- Must be manually updated with every document change

**✅ ALWAYS use auto-generated TOC:**

**Key Implementation Requirements:**
- **Custom `TocDocTemplate` class**: Override `afterFlowable()` to capture TOC entries
- **Bookmark attributes**: Set `bookmark_name`, `bookmark_level`, `bookmark_text` on each heading
- **Use `doc.multiBuild(story)`**: NOT `doc.build()` - multiBuild is required for TOC processing
- **Clickable hyperlinks**: Generated automatically with proper styling

**Helper Function Pattern:**
```python
def add_heading(text, style, level=0):
    """Create heading with bookmark for auto-TOC"""
    p = Paragraph(text, style)
    p.bookmark_name = text
    p.bookmark_level = level
    p.bookmark_text = text
    return p

# Usage:
story.append(add_heading("1. Introduction", styles['Heading1'], 0))
story.append(Paragraph('Content...', styles['Normal']))
```

#### Complete TOC Implementation Example

Copy and adapt this complete working code for your PDF with Table of Contents:

```python
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, PageBreak, Spacer
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

class TocDocTemplate(SimpleDocTemplate):
    def __init__(self, *args, **kwargs):
        SimpleDocTemplate.__init__(self, *args, **kwargs)

    def afterFlowable(self, flowable):
        """Capture TOC entries after each flowable is rendered"""
        if hasattr(flowable, 'bookmark_name'):
            level = getattr(flowable, 'bookmark_level', 0)
            text = getattr(flowable, 'bookmark_text', '')
            self.notify('TOCEntry', (level, text, self.page))

# Create document
doc = TocDocTemplate("document.pdf", pagesize=letter)
story = []
styles = getSampleStyleSheet()

# Create Table of Contents
toc = TableOfContents()
toc.levelStyles = [
    ParagraphStyle(name='TOCHeading1', fontSize=14, leftIndent=20,
                   fontName='Times New Roman'),
    ParagraphStyle(name='TOCHeading2', fontSize=12, leftIndent=40,
                   fontName='Times New Roman'),
]
story.append(Paragraph("<b>Table of Contents</b>", styles['Title']))
story.append(Spacer(1, 0.2*inch))
story.append(toc)
story.append(PageBreak())

# Helper function: Create heading with TOC bookmark
def add_heading(text, style, level=0):
    p = Paragraph(text, style)
    p.bookmark_name = text
    p.bookmark_level = level
    p.bookmark_text = text
    return p

# Chapter 1: Introduction
story.append(add_heading("Chapter 1: Introduction", styles['Heading1'], 0))
story.append(Paragraph("This is the introduction chapter with some example content.",
                       styles['Normal']))
story.append(Spacer(1, 0.2*inch))

story.append(add_heading("1.1 Background", styles['Heading2'], 1))
story.append(Paragraph("Background information goes here.", styles['Normal']))


# Chapter 2: Conclusion
story.append(add_heading("Chapter 2: Conclusion", styles['Heading1'], 0))
story.append(Paragraph("This concludes our document.", styles['Normal']))
story.append(Spacer(1, 0.2*inch))

story.append(add_heading("2.1 Summary", styles['Heading2'], 1))
story.append(Paragraph("Summary of the document.", styles['Normal']))

# Build the document (must use multiBuild for TOC to work)
doc.multiBuild(story)

print("PDF with Table of Contents created successfully!")
```

#### Cross-References (Figures, Tables, Bibliography)

**OPTIONAL**: For academic papers requiring citation systems (LaTeX-style `\ref{}` and `\cite{}`)

**Key Principle**: Pre-register all figures, tables, and references BEFORE using them in text.

**Simple Implementation Pattern:**

```python
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib import colors
from reportlab.platypus import Table, TableStyle


class CrossReferenceDocument:
    """Manages cross-references throughout the document"""

    def __init__(self):
        self.figures = {}
        self.tables = {}
        self.refs = {}
        self.figure_counter = 0
        self.table_counter = 0
        self.ref_counter = 0

    def add_figure(self, name):
        """Add a figure and return its number"""
        if name not in self.figures:
            self.figure_counter += 1
            self.figures[name] = self.figure_counter
        return self.figures[name]

    def add_table(self, name):
        """Add a table and return its number"""
        if name not in self.tables:
            self.table_counter += 1
            self.tables[name] = self.table_counter
        return self.tables[name]

    def add_reference(self, name):
        """Add a reference and return its number"""
        if name not in self.refs:
            self.ref_counter += 1
            self.refs[name] = self.ref_counter
        return self.refs[name]


def build_document():
    doc = SimpleDocTemplate("cross_ref.pdf", pagesize=letter)
    xref = CrossReferenceDocument()
    styles = getSampleStyleSheet()

    # Caption style
    styles.add(ParagraphStyle(
        name='Caption',
        parent=styles['Normal'],
        alignment=TA_CENTER,
        fontSize=10,
        textColor=colors.HexColor('#333333')
    ))

    story = []

    # Step 1: Register all figures, tables, and references FIRST
    fig1 = xref.add_figure('sample')
    table1 = xref.add_table('data')
    ref1 = xref.add_reference('author2024')

    # Step 2: Use them in text
    intro = f"""
    See Figure {fig1} for details and Table {table1} for data<sup>[{ref1}]</sup>.
    """
    story.append(Paragraph(intro, styles['Normal']))
    story.append(Spacer(1, 0.2*inch))

    # Step 3: Create figures and tables with numbered captions
    story.append(Paragraph(f"<b>Figure {fig1}.</b> Sample Figure Caption",
        styles['Caption']
    ))

    # Table example
    header_style = ParagraphStyle(
    name='TableHeader',
    fontName='Times New Roman',
    fontSize=11,
    textColor=colors.white,
    alignment=TA_CENTER
    )

    cell_style = ParagraphStyle(
        name='TableCell',
        fontName='Times New Roman',
        fontSize=10,
        textColor=colors.black,
        alignment=TA_CENTER
    )

    # All text content wrapped in Paragraph() 
    data = [
        [Paragraph('<b>Item</b>', header_style), Paragraph('<b>Value</b>', header_style)],
        [Paragraph('A', cell_style), Paragraph('10', cell_style)],
        [Paragraph('B', cell_style), Paragraph('20', cell_style)],
    ]
    t = Table(data, colWidths=[2*inch, 2*inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ]))
    story.append(t)
    story.append(Spacer(1, 6))
    story.append(Paragraph(f"<b>Table {table1}.</b> Sample Data Table",
        styles['Caption']
    ))

    story.append(PageBreak())

    # Step 4: Reference again in discussion
    discussion = f"""
    As shown in Figure {fig1} and Table {table1}, results are clear<sup>[{ref1}]</sup>.
    """
    story.append(Paragraph(discussion, styles['Normal']))

    # Step 5: Bibliography section
    story.append(PageBreak())
    story.append(Paragraph("<b>References</b>", styles['Heading1']))
    story.append(Paragraph(
        f"[{ref1}] Author, A. (2024). Example Reference. <i>Journal Name</i>.",
        styles['Normal']
    ))

    doc.build(story)
    print("PDF with cross-references created!")


if __name__ == '__main__':
    build_document()
```

**Usage Notes:**
- **Pre-registration is critical**: Call `add_figure()`/`add_table()`/`add_reference()` at the START of your document
- **Citation format**: Use `Paragraph('<sup>[{ref_num}]</sup>')` for inline citations
- **Caption format**: Use `Paragraph('<b>Figure {num}.</b>')` or `Paragraph('<b>Table {num}.</b>')` with centered caption style
- **Combine with TOC**: Use `TocDocTemplate` + `doc.multiBuild(story)` if both cross-refs and auto-TOC are needed

## Command-Line Tools

### pdftotext (poppler-utils)
```bash
# Extract text
pdftotext input.pdf output.txt

# Extract text preserving layout
pdftotext -layout input.pdf output.txt

# Extract specific pages
pdftotext -f 1 -l 5 input.pdf output.txt  # Pages 1-5
```

### qpdf
```bash
# Merge PDFs
qpdf --empty --pages file1.pdf file2.pdf -- merged.pdf

# Split pages
qpdf input.pdf --pages . 1-5 -- pages1-5.pdf
qpdf input.pdf --pages . 6-10 -- pages6-10.pdf

# Rotate pages
qpdf input.pdf output.pdf --rotate=+90:1  # Rotate page 1 by 90 degrees

# Remove password
qpdf --password=mypassword --decrypt encrypted.pdf decrypted.pdf
```

## Common Tasks

### Brand PDFs with Z.ai Metadata

⚠️ CRITICAL MANDATORY RULE - PDF Metadata MUST be Added After Every PDF Generation

All PDFs MUST have metadata added immediately after creation - This is the FINAL step and CANNOT be skipped

**Usage - Standalone Script:**

```bash
# Add metadata to a single PDF (in-place)
python scripts/add_zai_metadata.py document.pdf

# Add metadata to a single PDF (create new file)
python scripts/add_zai_metadata.py input.pdf -o output.pdf

# Add metadata with custom title
python scripts/add_zai_metadata.py report.pdf -t "Q4 Financial Analysis"

# Batch process all PDFs in current directory
python scripts/add_zai_metadata.py *.pdf

# Quiet mode (no output)
python scripts/add_zai_metadata.py document.pdf -q

# Show help
python scripts/add_zai_metadata.py --help
```

**Requirements:**

After doc.build(story) completes → Immediately call the script
Do NOT wait for user reminder, Do NOT check task description - Execute automatically
Confirm metadata info to user after adding
Memory phrase: PDF build done, metadata must add, no need to remind

### Extract Text from Scanned PDFs
```python
# Requires: pip install pytesseract pdf2image
import pytesseract
from pdf2image import convert_from_path

images = convert_from_path('scanned.pdf')

text = ""
for i, image in enumerate(images):
    text += f"Page {i+1}:\n"
    text += pytesseract.image_to_string(image)
    text += "\n\n"

print(text)
```

### Add Watermark
```python
from pypdf import PdfReader, PdfWriter

watermark = PdfReader("watermark.pdf").pages[0]
reader = PdfReader("document.pdf")
writer = PdfWriter()

for page in reader.pages:
    page.merge_page(watermark)
    writer.add_page(page)

with open("watermarked.pdf", "wb") as output:
    writer.write(output)
```

### Password Protection
```python
from pypdf import PdfReader, PdfWriter

reader = PdfReader("input.pdf")
writer = PdfWriter()

for page in reader.pages:
    writer.add_page(page)

writer.encrypt("userpassword", "ownerpassword")

with open("encrypted.pdf", "wb") as output:
    writer.write(output)
```


## Critical Reminders (MUST Follow)

### Font Rules
- **FONT RESTRICTION**: ONLY use the six registered fonts. NEVER use Arial, Helvetica, Courier, or any unregistered fonts.
- **In tables**: ALL English content and numbers MUST use `Times New Roman`.
- **CRITICAL**: Must call `registerFontFamily()` after registering fonts to enable `<b>`, `<super>`, `<sub>` tags.

### Rich Text Tags (`<b>`, `<super>`, `<sub>`)
- **CRITICAL**: These tags ONLY work inside `Paragraph()` objects - plain strings will NOT render these tags.
- **NEVER use Unicode superscript/subscript or Emoji characters** (e.g., ², 💫, ₂, 
        "\U0001F600-\U0001F64F"  # emoticons
        "\U0001F300-\U0001F5FF"  # symbols & pictographs
        "\U0001F680-\U0001F6FF"  # transport & map
        "\U0001F700-\U0001F77F"
        "\U0001F780-\U0001F7FF"
        "\U0001F800-\U0001F8FF"
        "\U0001F900-\U0001F9FF"
        "\U0001FA00-\U0001FAFF"
        "\U00002700-\U000027BF")
- **Superscript/Subscript Style**: MUST use `Paragraph('W/m<super>2</super>', style)` (not `W/m2` or `W/m^2`) and `Paragraph('-1.23 x 10<super>2</super>', style)` (not `-1.23 x 10²`).
- **Large/small numbers in tables**: Use scientific notation with `Paragraph('-1.246 x 10<super>8</super>', style)` (not `-1.246e+8`).
- **Multiplication sign**: Always use the letter 'x', never '×' or Unicode multiplication symbols.

### Line Breaks in Paragraph
- **CRITICAL**: `Paragraph` does not treat `\n` as a line break. Use `<br/>` for line breaks:
```python
# WRONG: "\n" does NOT create line breaks
text = Paragraph("Line 1\nLine 2", style)  # Renders as single line

# RIGHT: Use <br/> for line breaks
text = Paragraph("Line 1<br/>Line 2", style)
```

### Body Title & Text content Styles
- **All titles and sub-titles (except for Table headers)**: Must be bold with black text - use `Paragraph('<b>Title</b>', style)` + `textColor=colors.black`.
- **ALL body text content MUST be wrapped in `Paragraph()`.** Plain strings will NOT render formatting tags (`<b>`, `<super>`, `<sub>`, `<i>`).

### Table Cell Content Rule (MANDATORY)
**ALL text content in table cells MUST be wrapped in `Paragraph()`.** Plain strings will NOT render formatting tags (`<b>`, `<super>`, `<sub>`, `<i>`).
**Exception**: `Image()` objects can be placed directly without Paragraph wrapping.

### Table Style Specifications
- **Max Table Widths**: The max colWidths parameter is 7.5inch or 20cm or 540pt.
- **Table Header**: Must use bold white text (colors.white) with dark blue background (#1F4E79).
- **Rows**: Alternating white/light gray (#F5F5F5)
- **Caption**: Centered, placed after table with `Spacer(1, 18)` before next content
- **Spacing**: Add `Spacer(1, 18)` BEFORE tables for symmetric spacing
- **Color Rules**: In dark blue background (#1F4E79), MUST use white text (colors.white). In white/light gray background, MUST use black text.
- **Color consistency**: If a single PDF contains multiple tables, only one color scheme is allowed across all tables.

### Document Structure
- A PDF can contain ONLY ONE cover page and ONE back cover page.
- The cover page and back cover page MUST use `TA_CENTER` alignment.
- **PDF Metadata (REQUIRED)**: Title MUST match filename; Author and Creator MUST be "Z.ai"; Subject SHOULD describe purpose.

### Image Handling
- **Preserve aspect ratio**: Never adjust image aspect ratio. Insert according to original ratio:
```python
from PIL import Image as PILImage
from reportlab.platypus import Image

pil_img = PILImage.open('image.png')
orig_w, orig_h = pil_img.size
target_width = 400
scale = target_width / orig_w
img = Image('image.png', width=target_width, height=orig_h * scale)
```

### Code Quality
- Carefully check function documentation to ensure parameter order is correct.
- Check list/array element type consistency, test run immediately after writing to verify.
- For body text and formulas, use `Paragraph` instead of `Preformatted`.

### Paragraph Wrapping Validation (MANDATORY PRE-BUILD CHECK)

**BEFORE calling `doc.build()` or `doc.multiBuild()`, you MUST validate that:**

1. **All rich text tags are inside Paragraph objects**: Any string containing `<b>`, `<super>`, `<sub>`, or `<i>` tags MUST be wrapped in `Paragraph()`.

2. **All table cell text content uses Paragraph**: Every text element in table data arrays MUST be a `Paragraph()` object (except `Image()` objects).

**Validation Checklist:**
```python
# ✅ CORRECT patterns to verify:
Paragraph('<b>Bold text</b>', style)           # Rich text in Paragraph
Paragraph('H<sub>2</sub>O', style)             # Subscript in Paragraph
Paragraph('10<super>8</super>', style)         # Superscript in Paragraph
data = [[Paragraph('Cell', style), ...], ...]  # Table cells as Paragraph

# ❌ PROHIBITED patterns to catch and fix:
'<b>Bold text</b>'                             # Plain string with tags
['<b>Header</b>', 'Value']                     # Table row with plain strings
f"Value: {x}<super>2</super>"                  # f-string with tags (not in Paragraph)
```

**Self-Check Before Build:**
- Scan all `story.append()` calls: if content contains `<b>`, `<super>`, `<sub>`, `<i>`, confirm it's inside `Paragraph()`
- Scan all `Table(data, ...)` calls: confirm every text cell in `data` is `Paragraph()`, not plain string
- If any violation found, fix it before proceeding to build


## Quick Reference

| Task | Best Tool | Command/Code |
|------|-----------|--------------|
| Merge PDFs | pypdf | `writer.add_page(page)` |
| Split PDFs | pypdf | One page per file |
| Extract text | pdfplumber | `page.extract_text()` |
| Extract tables | pdfplumber | `page.extract_tables()` |
| Create PDFs | reportlab | Canvas or Platypus |
| Command line merge | qpdf | `qpdf --empty --pages ...` |
| OCR scanned PDFs | pytesseract | Convert to image first |
| Fill PDF forms | pdf-lib or pypdf (see forms.md) | See forms.md |

## Next Steps

- For advanced pypdfium2 usage, see reference.md
- For JavaScript libraries (pdf-lib), see reference.md
- If you need to fill out a PDF form, follow the instructions in forms.md
- For troubleshooting guides, see reference.md
- For advanced table of content template, see reference.md