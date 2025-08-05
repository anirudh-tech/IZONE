# IZONE - Technology Redefined

A modern e-commerce website for IZONE, featuring premium audio speakers, earphones, watches, and other technology gadgets.

## 🚀 Features

- **Modern Design**: Dark theme with premium aesthetics
- **Responsive Layout**: Works seamlessly on all devices
- **Interactive Components**: Cookie consent, FAQ accordion, product grid
- **Navigation**: Easy navigation between Home, Shop, and FAQ pages
- **Product Showcase**: Beautiful product displays with pricing

## 📁 Project Structure

```
Techsouq/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with metadata
│   │   ├── page.tsx            # Home page (GADZOO landing)
│   │   ├── shop/
│   │   │   └── page.tsx        # Shop page with product grid
│   │   ├── faq/
│   │   │   └── page.tsx        # FAQ page with accordion
│   │   ├── globals.css         # Global styles
│   │   └── favicon.ico         # Site favicon
│   └── components/
│       ├── Header.tsx          # Navigation header
│       ├── Hero.tsx            # Main hero section
│       ├── CookieBanner.tsx    # Cookie consent banner
│       ├── SocialIcons.tsx     # Social media icons
│       ├── ProductGrid.tsx     # Product display grid
│       └── FAQSection.tsx      # FAQ accordion component
├── public/                     # Static assets
├── package.json               # Dependencies and scripts
└── README.md                  # Project documentation
```

## 🛠️ Technologies Used

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **React 19** - Latest React features

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** and navigate to `http://localhost:3000`

## 📱 Pages

### Home Page (`/`)
- Hero section with main headline
- Product showcase with wooden speaker
- Cookie consent banner
- Social media icons

### Shop Page (`/shop`)
- Product grid with audio and wearable products
- Interactive product cards
- Add to cart functionality

### FAQ Page (`/faq`)
- Expandable FAQ accordion
- Common customer questions
- Contact information

## 🎨 Design Features

- **Dark Theme**: Premium dark color scheme
- **Gradient Backgrounds**: Subtle gradients for depth
- **Hover Effects**: Interactive elements with smooth transitions
- **Responsive Design**: Mobile-first approach
- **Modern Typography**: Clean, readable fonts

## 🔧 Customization

The website is built with modular components, making it easy to:
- Add new products to the shop
- Modify the color scheme
- Update content and copy
- Add new pages and features

## 📄 License

This project is created for demonstration purposes.
