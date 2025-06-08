# Tailwind CSS v3 to v4 Converter

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live%20Demo-brightgreen)](https://d0076.github.io/tailwindv3tov4converter/)
[![Built with React](https://img.shields.io/badge/Built%20with-React-61DAFB)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Styled%20with-Tailwind%20CSS-38B2AC)](https://tailwindcss.com/)

🎨 **Free online tool to convert Tailwind CSS v3 HSL color variables to v4 OKLCH format**

Perfect for migrating [shadcn/ui](https://ui.shadcn.com) projects to Tailwind CSS v4. Convert your CSS custom properties instantly with real-time validation, error checking, and download functionality.

## ✨ Features

- 🔄 **Bidirectional Conversion**: Convert between v3 (HSL) and v4 (OKLCH) formats
- ⚡ **Real-time Conversion**: Automatic conversion as you type with 500ms debounce
- ✅ **CSS Validation**: Comprehensive syntax checking with detailed error reporting
- 📊 **Conversion Stats**: Live statistics showing variables converted and lines processed
- 📋 **Copy & Download**: One-click copy to clipboard and CSS file download
- 🎯 **shadcn/ui Focused**: Specifically designed for shadcn/ui component migration
- 🌙 **Dark Mode Support**: Full dark mode implementation
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- 🚀 **Lightning Fast**: Built with React 19, Vite, and modern web technologies

## 🎯 Perfect For

- **shadcn/ui Migration**: Upgrading shadcn/ui projects to Tailwind CSS v4
- **Color Format Conversion**: Converting between HSL and OKLCH color spaces
- **CSS Variable Updates**: Batch updating CSS custom properties
- **Tailwind v4 Adoption**: Migrating existing projects to the latest Tailwind CSS

## 🚀 Live Demo

**[Try it now →](https://d0076.github.io/tailwindv3tov4converter/)**

## 📖 How to Use

### 1. **Choose Conversion Direction**

- **v3 → v4**: Convert HSL format to OKLCH format
- **v4 → v3**: Convert OKLCH format back to HSL format

### 2. **Input Your CSS**

- Paste your CSS variables into the input area
- Or click "Load Sample" to see an example
- Real-time validation will check for syntax errors

### 3. **Get Results**

- Converted CSS appears automatically in the output area
- View conversion statistics (variables converted, lines processed)
- See validation results and any warnings

### 4. **Use Your Converted CSS**

- Click "Copy" to copy the result to clipboard
- Click "Download" to save as a CSS file
- Replace your old CSS variables with the converted ones

## 💻 Technical Details

### Input Format (v3 - HSL)

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    /* ... more variables */
  }
}
```

### Output Format (v4 - OKLCH)

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.141 0.005 285.823);
  --primary: oklch(0.623 0.214 259.815);
  /* ... more variables */
}
```

## 🛠️ Built With

- **[React 19](https://reactjs.org/)** - UI Framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type Safety
- **[Vite](https://vitejs.dev/)** - Build Tool
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Styling
- **[shadcn/ui](https://ui.shadcn.com/)** - UI Components
- **[Lucide React](https://lucide.dev/)** - Icons

## 🏗️ Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Local Setup

```bash
# Clone the repository
git clone https://github.com/d0076/tailwindv3tov4converter.git

# Navigate to project directory
cd tailwindv3tov4converter

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Project Structure

```
src/
├── components/
│   └── ui/           # shadcn/ui components
├── lib/
│   └── converter.ts  # Core conversion logic
├── App.tsx          # Main application component
├── index.css        # Global styles and Tailwind config
└── main.tsx         # Application entry point
```

## 🔧 Core Features

### Color Space Conversion

- **HSL to OKLCH**: Converts hue, saturation, lightness to OKLCH perceptual color space
- **OKLCH to HSL**: Reverse conversion with mathematical precision
- **CSS Parsing**: Robust regex-based parsing of CSS variables
- **Format Preservation**: Maintains original CSS structure and formatting

### Validation System

- **Syntax Checking**: Validates CSS variable syntax
- **Brace Matching**: Ensures proper CSS structure
- **Error Reporting**: Detailed error messages with line numbers
- **Warning System**: Non-breaking warnings for potential issues

### User Experience

- **Auto-conversion**: Real-time conversion with debouncing
- **Smart Swapping**: Intelligent content swapping when changing modes
- **Visual Feedback**: Loading states, success messages, and error indicators
- **Accessibility**: Full keyboard navigation and screen reader support

## 🎨 Design Philosophy

- **Developer-First**: Built by developers, for developers
- **Functional UI**: Clean, distraction-free interface
- **Performance**: Optimized for speed and efficiency
- **Accessibility**: WCAG compliant design patterns

## 📚 Resources

- **[Tailwind CSS v4 Migration Guide](https://tailwindcss.com/docs/upgrading)**
- **[shadcn/ui Documentation](https://ui.shadcn.com)**
- **[OKLCH Color Space](https://oklch.com/)**
- **[CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)**

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- [Tailwind CSS Team](https://tailwindcss.com/) for the amazing framework
- [shadcn](https://ui.shadcn.com/) for the beautiful component library
- [React Team](https://reactjs.org/) for the excellent framework
- The open-source community for inspiration and support
