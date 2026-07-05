# BackgroundWrapper - قائمة التصميم السينمائي

## 📋 الميزات

### 1. **Mesh Gradient احترافي**
- تدرجات بنفسجية + نيلية + أسود
- Accent color #06f4e1 (Cyan) موزع بذكاء
- حركة سلسة مع `animate-blob` animation

### 2. **Z-Index الصحيح**
```
- Background: z-10 (fixed, تحت كل شيء)
- Layout Content: z-0 (relative)
- Sidebar (Desktop): relative (يفوق الخلفية)
- Sidebar (Mobile): z-50 (fixed overlay)
- Navbar: z-40+ (عند الحاجة)
```

### 3. **Glass Morphism للـ Cards**
استخدم في جميع الـ Cards:
```
backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl
```

## 🎨 الألوان المستخدمة

| الاسم | القيمة | الاستخدام |
|------|-------|---------|
| Accent | #06f4e1 | عناصر تفاعلية، أيقونات، highlights |
| Background | #000000 | خلفية أساسية |
| Gradient Orbs | purple-900/30 | حركة بصرية، عمق |
| Gradient Orbs | cyan-900/20 | لهجات جميلة |
| Gradient Orbs | indigo-900/25 | تنوع لوني |

## 🚀 الاستخدام

### في Layout الرئيسي:
```jsx
import BackgroundWrapper from './components/layout/BackgroundWrapper';

function Layout() {
  return (
    <div className='min-h-screen bg-black text-white relative'>
      <BackgroundWrapper />
      {/* باقي المحتوى */}
    </div>
  );
}
```

### في الـ Cards:
```jsx
// استخدم واحد من هذه:
<div className='backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6'>
  {/* محتوى */}
</div>

// أو استخدم الـ shortcut من App.css:
<div className='card-glass p-6'>
  {/* محتوى */}
</div>

// للـ Cards الكبيرة:
<div className='card-glass-lg p-6'>
  {/* محتوى */}
</div>
```

### استخدام Accent Color:
```jsx
// نص
<p className='text-accent'>Text in Cyan</p>

// Border
<div className='border-accent border-2'>Border</div>

// Background
<div className='bg-accent'>Background</div>

// أو استخدم مباشرة
<div className='text-[#06f4e1]'>Direct color</div>
```

## ✨ الـ Animations

### Blob Animation
```jsx
// في BackgroundWrapper بالفعل
<div className='animate-blob animation-delay-2000' />
```

### Delays المتاحة
```css
.animation-delay-2000  /* تأخير 2 ثانية */
.animation-delay-3000  /* تأخير 3 ثوان */
.animation-delay-4000  /* تأخير 4 ثوان */
.animation-delay-5000  /* تأخير 5 ثوان */
```

## 📐 الـ Responsive

الخلفية تتغطي الشاشة كاملة ولا تتأثر بـ breakpoints. المحتوى يحتفظ بالـ responsive behavior الطبيعي.

## 🔧 التعديلات المستقبلية

إذا أردت تغيير الألوان:
1. عدّل `/frontend/tailwind.config.js` - section `colors`
2. عدّل `/frontend/src/components/layout/BackgroundWrapper.jsx` - class names
3. عدّل `/frontend/src/App.css` - accent utilities

## 💡 نصائح الاستخدام

✅ **استخدم Glass Morphism** لكل الـ cards  
✅ **استخدم #06f4e1** للـ interactive elements والـ hover states  
✅ **الخلفية تحتاج position: relative** في الـ Layout  
✅ **تجنب fixed backgrounds داخل scrollable elements**  
✅ **استخدم z-index بحكمة** لتجنب overlap مشاكل  

---

تم إنشاؤه بـ ❤️ لـ TaskFlow الإصدار الفخم!
