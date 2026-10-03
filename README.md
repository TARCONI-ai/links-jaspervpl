# Jasper's Links OS

A phone-style "link in bio": draggable apps, a dock with socials and internal screens for OpoGenius and my book. Built with React + TypeScript + Vite + Tailwind. Based on [joanacastello/links-os-project](https://github.com/joanacastello/links-os-project).

```bash
npm install
npm run dev      # local dev
npm run build    # production build
```

## Edit your links

- `src/config/socialLinks.ts`: every URL (dock + home). **Set your Instagram URL there.**
- `src/components/projects/`: OpoGenius and book screens.
- `public/`: photo, icons, covers and screenshots.

Long-press an app icon (1s) to drag it around.
