# 🛠️ Public HTML Service

A collection of handy developer utility tools hosted on GitHub Pages.

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-success?logo=github)](https://megabosssa.github.io/public-html-service/)

## 🚀 Quick Start

Visit the [**Tool Directory**](https://megabosssa.github.io/public-html-service/) to browse all available tools with category filtering and search.

**💡 Pro Tip:** This site is a Progressive Web App (PWA) - install it for offline access!

---

## 📁 Tools by Category

### 📊 Data Tools

| Tool | Description |
|------|-------------|
| [Data Formatter](https://megabosssa.github.io/public-html-service/data-formatter-v2.html) | Format JSON or XML for readability |
| [Data Formatter v3](https://megabosssa.github.io/public-html-service/v3/objectParser.html) | Advanced formatting with length info |
| [JSON Beautifier](https://megabosssa.github.io/public-html-service/json-beautify.html) | Pretty-print and explore JSON data with collapsible objects |
| [YAML ↔ JSON Converter](https://megabosssa.github.io/public-html-service/yaml-json-converter.html) | Convert between YAML and JSON formats |
| [JSON to CSV Converter](https://megabosssa.github.io/public-html-service/generateReportCSV.html) | Download CSV from JSON lists |
| [Set Comparator](https://megabosssa.github.io/public-html-service/set-comparator.html) | Compare and find differences between sets |
| [Thymeleaf Renderer](https://megabosssa.github.io/public-html-service/thymeleaf-renderer.html) | Render Thymeleaf templates with JSON data |
| [Base64 Encoder/Decoder](https://megabosssa.github.io/public-html-service/base64-tool.html) | Encode and decode Base64 strings with file support |
| [Regex Tester](https://megabosssa.github.io/public-html-service/regex-tester.html) | Live regex matching with group highlighting |
| [Diff Viewer](https://megabosssa.github.io/public-html-service/diff-viewer.html) | Compare two text blocks side-by-side |
| [Markdown Previewer](https://megabosssa.github.io/public-html-service/markdown-previewer.html) | Live markdown editor with preview |
| [CSV Viewer/Editor](https://megabosssa.github.io/public-html-service/csv-viewer.html) | View, edit, and export CSV files |
| [Timestamp Converter](https://megabosssa.github.io/public-html-service/timestamp-converter.html) | Convert Unix timestamps to human-readable dates |

### 🔐 Security Tools

| Tool | Description |
|------|-------------|
| [AES-256-GCM Demo](https://megabosssa.github.io/public-html-service/aes-256-gcm.html) | Encrypt and decrypt data samples |
| [JWT Debugger](https://megabosssa.github.io/public-html-service/jwt-debugger.html) | Decode and inspect JSON Web Tokens locally |
| [Hash Generator](https://megabosssa.github.io/public-html-service/hash-generator.html) | Generate MD5, SHA-1, SHA-256, SHA-512 hashes |

### 💰 Finance Tools

| Tool | Description |
|------|-------------|
| [Currency Converter](https://megabosssa.github.io/public-html-service/rate-conversion.html) | Convert currencies using current rates |
| [DR Price Calculator](https://megabosssa.github.io/public-html-service/stock-dr-convertion.html) | Compute DR prices from stock values |
| [BAHTNET Template Viewer](https://megabosssa.github.io/public-html-service/bahtnet-template.html) | View payment templates and fees |
| [Billpayment Template Calculator](https://megabosssa.github.io/public-html-service/billpayment-template.html) | Dynamic payment summation by template config |
| [Smart Media Clearing](https://megabosssa.github.io/public-html-service/smart-media-clearing.html) | Scenario viewer and calculator |

### ⚙️ DevOps Tools

| Tool | Description |
|------|-------------|
| [Istio VS Generator](https://megabosssa.github.io/public-html-service/istio-vs-generator.html) | Generate Istio VirtualService direct response YAML |
| [Timeout Simulator](https://megabosssa.github.io/public-html-service/timeout-simulator.html) | Experiment with delayed HTTP replies (uses `httpstat.us`) |
| [Deeplink Wrapper](https://megabosssa.github.io/public-html-service/deeplink-wrapper.html) | Test and wrap deep links |

### 📋 Log Viewers

| Tool | Description |
|------|-------------|
| [Log Formatter](https://megabosssa.github.io/public-html-service/log-formatter.html) | View JSON logs as HTML tables |
| [Log Formatter v2](https://megabosssa.github.io/public-html-service/log-formatter-v2.html) | Enhanced log viewer with extras |
| [Dynatrace Log Viewer](https://megabosssa.github.io/public-html-service/dynatrace-log-viewer.html) | Analyze Dynatrace logs with summary view |
| [PMCS Data Loader](https://megabosssa.github.io/public-html-service/pmcs-data-loader.html) | Generate fixed-length lines from PMCS JSON results |

### 🔧 Utility Tools

| Tool | Description |
|------|-------------|
| [QR Code Generator](https://megabosssa.github.io/public-html-service/qr-code-generator.html) | Generate QR codes from text or URLs |
| [Barcode Generator](https://megabosssa.github.io/public-html-service/barcode-generator.html) | Generate Code128, EAN-13, UPC-A barcodes |

### 📱 Other Tools

| Tool | Description |
|------|-------------|
| [Line LIFF POC](https://megabosssa.github.io/public-html-service/line-liff-poc.html) | Test basic LINE LIFF features |
| [LIFF App Demo](https://megabosssa.github.io/public-html-service/line-lift-poc-2.html) | Simple mobile LIFF application |

### 🎮 Games

| Tool | Description |
|------|-------------|
| [Retro Snake](https://megabosssa.github.io/public-html-service/games/snake.html) | Classic Nokia-style Snake game |
| [GTA Mini](https://megabosssa.github.io/public-html-service/games/gta.html) | GTA-style action game |
| [Tamagotchi](https://megabosssa.github.io/public-html-service/games/tamagot-v1.html) | Virtual pet simulation game |

---

## ✨ Features

All tools include:
- 🌙 **Dark Mode** - Toggle between light and dark themes
- ⌨️ **Keyboard Shortcuts** - Press `Ctrl+Enter` to execute
- 📋 **History** - Recent inputs stored in localStorage
- 🔗 **URL Sharing** - Share tool state via URL
- 📱 **PWA Support** - Install as a standalone app

---

## 💻 Local Development

```bash
# Clone the repository
git clone https://github.com/megabosssa/public-html-service.git
cd public-html-service

# Install dependencies (optional, for TypeScript tools)
npm install

# Start local server
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs or suggest features via [Issues](https://github.com/megabosssa/public-html-service/issues)
- Submit pull requests for new tools or improvements

---

## 📄 License

ISC License - see [package.json](package.json) for details.
