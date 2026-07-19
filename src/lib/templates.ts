export type TemplateCard = {
  type: string;
  content: any;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type BoardTemplate = {
  id: string;
  name: string;
  description: string;
  icon: string;
  cards: TemplateCard[];
};

export const TEMPLATES: BoardTemplate[] = [
  {
    id: "creative-brief",
    name: "Creative Brief",
    description: "Project overview, goals, audience, and key messaging",
    icon: "document",
    cards: [
      {
        type: "heading",
        content: { text: "Creative Brief" },
        x: 40, y: 40, width: 400, height: 70,
      },
      {
        type: "note",
        content: { text: "## Project\nWhat are we creating?\n\nDescribe the shoot, campaign, or video in one or two sentences." },
        x: 40, y: 140, width: 320, height: 200,
      },
      {
        type: "note",
        content: { text: "## Goals & Objectives\nWhat does success look like?\n\n• Brand awareness\n• Product launch\n• Social content\n• Editorial" },
        x: 400, y: 140, width: 320, height: 200,
      },
      {
        type: "note",
        content: { text: "## Target Audience\nWho are we speaking to?\n\n• Demographics\n• Interests\n• Pain points\n• Platform" },
        x: 40, y: 380, width: 320, height: 200,
      },
      {
        type: "note",
        content: { text: "## Key Message\nWhat is the one thing people should remember?\n\nWrite the core message in one sentence." },
        x: 400, y: 380, width: 320, height: 200,
      },
      {
        type: "note",
        content: { text: "## Deliverables\n• Final images (x)\n• Behind-the-scenes\n• Raw files\n• Usage rights" },
        x: 40, y: 620, width: 320, height: 180,
      },
      {
        type: "note",
        content: { text: "## Timeline\n• Pre-production:\n• Shoot date:\n• Edits due:\n• Delivery:" },
        x: 400, y: 620, width: 320, height: 180,
      },
    ],
  },
  {
    id: "mood-board",
    name: "Mood Board",
    description: "Visual inspiration with images, colors, and reference notes",
    icon: "image",
    cards: [
      {
        type: "heading",
        content: { text: "Mood Board" },
        x: 40, y: 40, width: 300, height: 70,
      },
      {
        type: "note",
        content: { text: "Drag images here to build your visual direction. Include reference photos, lighting examples, and styling inspiration." },
        x: 40, y: 120, width: 260, height: 120,
      },
      {
        type: "color",
        content: { color: "#5c7e53" },
        x: 340, y: 120, width: 160, height: 160,
      },
      {
        type: "color",
        content: { color: "#af8d6a" },
        x: 520, y: 120, width: 160, height: 160,
      },
      {
        type: "color",
        content: { color: "#e8dfd3" },
        x: 700, y: 120, width: 160, height: 160,
      },
      {
        type: "color",
        content: { color: "#3c3b3f" },
        x: 880, y: 120, width: 160, height: 160,
      },
      {
        type: "note",
        content: { text: "## Palette Notes\n• Primary: Sage green\n• Accent: Clay\n• Neutral: Bone\n• Dark: Charcoal\n\nThese colours establish our earthy, editorial feel." },
        x: 340, y: 300, width: 340, height: 200,
      },
      {
        type: "note",
        content: { text: "## Vibe & Tone\nDescribe the mood, lighting style, and overall feeling of the shoot." },
        x: 700, y: 300, width: 340, height: 150,
      },
      {
        type: "todo",
        content: { items: ["Source reference images", "Define colour palette", "Gather lighting references", "Share with client for approval"] },
        x: 40, y: 280, width: 260, height: 200,
      },
    ],
  },
  {
    id: "shot-list",
    name: "Shot List",
    description: "Detailed shot planning with camera settings and status tracking",
    icon: "camera",
    cards: [
      {
        type: "heading",
        content: { text: "Shot List" },
        x: 40, y: 40, width: 300, height: 70,
      },
      {
        type: "heading",
        content: { text: "Shot 01 — Hero" },
        x: 40, y: 140, width: 600, height: 60,
      },
      {
        type: "note",
        content: { text: "Type: Wide\nCamera: 24-70mm f/2.8\nLens: 35mm\nAperture: f/8\nNotes: Golden hour, backlit" },
        x: 40, y: 210, width: 280, height: 160,
      },
      {
        type: "todo",
        content: { items: ["Planned", "Shot", "Selected"] },
        x: 340, y: 210, width: 200, height: 160,
      },
      {
        type: "heading",
        content: { text: "Shot 02 — Detail" },
        x: 40, y: 400, width: 600, height: 60,
      },
      {
        type: "note",
        content: { text: "Type: Close-up\nCamera: 24-70mm f/2.8\nLens: 70mm\nAperture: f/2.8\nNotes: Macro detail, textured background" },
        x: 40, y: 470, width: 280, height: 160,
      },
      {
        type: "todo",
        content: { items: ["Planned", "Shot", "Selected"] },
        x: 340, y: 470, width: 200, height: 160,
      },
      {
        type: "heading",
        content: { text: "Shot 03 — Environmental" },
        x: 40, y: 660, width: 600, height: 60,
      },
      {
        type: "note",
        content: { text: "Type: Medium\nCamera: 24-70mm f/2.8\nLens: 50mm\nAperture: f/5.6\nNotes: Include environment context" },
        x: 40, y: 730, width: 280, height: 160,
      },
      {
        type: "todo",
        content: { items: ["Planned", "Shot", "Selected"] },
        x: 340, y: 730, width: 200, height: 160,
      },
    ],
  },
  {
    id: "call-sheet",
    name: "Call Sheet",
    description: "Shoot day schedule, locations, and crew contacts",
    icon: "calendar",
    cards: [
      {
        type: "heading",
        content: { text: "Call Sheet" },
        x: 40, y: 40, width: 400, height: 70,
      },
      {
        type: "note",
        content: { text: "## Date & Time\nDate:\nCall Time:\nWrap Time:\nLunch:" },
        x: 40, y: 140, width: 280, height: 180,
      },
      {
        type: "note",
        content: { text: "## Location\nStudio / Venue:\nAddress:\nParking:\nWeather:" },
        x: 340, y: 140, width: 280, height: 180,
      },
      {
        type: "note",
        content: { text: "## Contact List\n• Photographer:\n• Producer:\n• Client:\n• MUA:\n• Stylist:\n• Assistant:" },
        x: 640, y: 140, width: 280, height: 200,
      },
      {
        type: "todo",
        content: { items: ["Camera gear packed", "Memory cards formatted", "Batteries charged", "Lenses cleaned", "Checklist reviewed"] },
        x: 40, y: 360, width: 300, height: 200,
      },
      {
        type: "note",
        content: { text: "## Schedule\n08:00 — Crew arrives\n08:30 — Setup\n09:00 — Hair & Makeup\n10:00 — First look\n12:00 — Lunch\n13:00 — Second look\n15:00 — Wrap" },
        x: 360, y: 360, width: 300, height: 240,
      },
    ],
  },
  {
    id: "storyboard",
    name: "Storyboard",
    description: "Visual sequence planning for video production",
    icon: "film",
    cards: [
      {
        type: "heading",
        content: { text: "Storyboard" },
        x: 40, y: 40, width: 300, height: 70,
      },
      {
        type: "note",
        content: { text: "## Scene 1 — Opening\nDuration: 5s\nDescription: Wide establishing shot of location. Slow push in." },
        x: 40, y: 140, width: 240, height: 200,
      },
      {
        type: "note",
        content: { text: "## Scene 2 — Intro\nDuration: 8s\nDescription: Medium shot of subject. Natural lighting, warm tone." },
        x: 320, y: 140, width: 240, height: 200,
      },
      {
        type: "note",
        content: { text: "## Scene 3 — Detail\nDuration: 4s\nDescription: Close-up on product. Shallow depth of field, slow motion." },
        x: 600, y: 140, width: 240, height: 200,
      },
      {
        type: "note",
        content: { text: "## Scene 4 — Action\nDuration: 6s\nDescription: Wide shot of action. Dynamic camera movement." },
        x: 880, y: 140, width: 240, height: 200,
      },
      {
        type: "note",
        content: { text: "## Scene 5 — Closing\nDuration: 5s\nDescription: Pull out to wide. Fade to black." },
        x: 40, y: 380, width: 240, height: 200,
      },
      {
        type: "note",
        content: { text: "Notes & Direction\nAdd overall creative direction, music references, and transition notes here." },
        x: 600, y: 380, width: 400, height: 160,
      },
      {
        type: "color",
        content: { color: "#5c7e53" },
        x: 320, y: 380, width: 240, height: 100,
      },
    ],
  },
  {
    id: "location-scout",
    name: "Location Scout",
    description: "Location research with photos, logistics, and notes",
    icon: "pin",
    cards: [
      {
        type: "heading",
        content: { text: "Location Scout" },
        x: 40, y: 40, width: 400, height: 70,
      },
      {
        type: "note",
        content: { text: "## Location Name\nAddress:\nContact:\nPhone:\nEmail:" },
        x: 40, y: 140, width: 280, height: 200,
      },
      {
        type: "note",
        content: { text: "## Logistics\n• Parking:\n• Power access:\n• Restrooms:\n• Loading area:\n• Weather backup:" },
        x: 340, y: 140, width: 280, height: 200,
      },
      {
        type: "note",
        content: { text: "## Permits\n• Permit required:\n• Permit cost:\n• Application link:\n• Lead time:" },
        x: 640, y: 140, width: 280, height: 200,
      },
      {
        type: "note",
        content: { text: "## Notes\nBest shooting times, lighting conditions, noise considerations, and any special access requirements." },
        x: 40, y: 380, width: 440, height: 160,
      },
      {
        type: "todo",
        content: { items: ["Visit location in person", "Take reference photos", "Check light at shoot time", "Meet location contact", "Confirm permit status"] },
        x: 520, y: 380, width: 280, height: 220,
      },
    ],
  },
  {
    id: "wardrobe-styling",
    name: "Wardrobe & Styling",
    description: "Outfit planning, accessories, and styling references",
    icon: "style",
    cards: [
      {
        type: "heading",
        content: { text: "Wardrobe & Styling" },
        x: 40, y: 40, width: 400, height: 70,
      },
      {
        type: "note",
        content: { text: "## Look 1\nGarments:\n• Top:\n• Bottom:\n• Shoes:\n• Accessories:\nVibe:" },
        x: 40, y: 140, width: 280, height: 220,
      },
      {
        type: "note",
        content: { text: "## Look 2\nGarments:\n• Top:\n• Bottom:\n• Shoes:\n• Accessories:\nVibe:" },
        x: 340, y: 140, width: 280, height: 220,
      },
      {
        type: "note",
        content: { text: "## Look 3\nGarments:\n• Top:\n• Bottom:\n• Shoes:\n• Accessories:\nVibe:" },
        x: 640, y: 140, width: 280, height: 220,
      },
      {
        type: "color",
        content: { color: "#5c7e53" },
        x: 40, y: 390, width: 120, height: 120,
      },
      {
        type: "color",
        content: { color: "#af8d6a" },
        x: 180, y: 390, width: 120, height: 120,
      },
      {
        type: "color",
        content: { color: "#e8dfd3" },
        x: 320, y: 390, width: 120, height: 120,
      },
      {
        type: "color",
        content: { color: "#3c3b3f" },
        x: 460, y: 390, width: 120, height: 120,
      },
      {
        type: "note",
        content: { text: "Hair & Makeup Notes\n• Makeup style:\n• Hair style:\n• Touch-up kit:\n• Timeline:" },
        x: 620, y: 390, width: 300, height: 180,
      },
    ],
  },
  {
    id: "content-calendar",
    name: "Content Calendar",
    description: "Monthly social and editorial content planning with brands, types, and status tracking",
    icon: "calendar",
    cards: [
      {
        type: "heading",
        content: { text: "Content Calendar" },
        x: 40, y: 40, width: 480, height: 70,
      },
      {
        type: "note",
        content: { text: "## Month at a Glance\nMonth:\nTheme:\nCampaign:\nBrand:\nPlatforms:\n\nContent types:\n• Reel\n• Post\n• Story\n• Blog\n• Newsletter\n• YouTube" },
        x: 40, y: 140, width: 220, height: 270,
      },
      {
        type: "color",
        content: { color: "#d9a44e" },
        x: 280, y: 140, width: 90, height: 90,
      },
      {
        type: "color",
        content: { color: "#4fa8c9" },
        x: 390, y: 140, width: 90, height: 90,
      },
      {
        type: "color",
        content: { color: "#8fbf7f" },
        x: 500, y: 140, width: 90, height: 90,
      },
      {
        type: "note",
        content: { text: "🟡 Raw & Rooted Media\n🔵 Raw Footage Creative Co\n🟢 Fotosynthesis LLC\n\nStatus: Idea → Drafting → Scheduled → Published" },
        x: 280, y: 250, width: 310, height: 160,
      },
      {
        type: "note",
        content: { text: "                               March 2026\n  ┌─────────────────────────────────────────────────────────┐\n  │ Sun │ Mon │ Tue │ Wed │ Thu │ Fri │ Sat │\n  ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤\n  │     │     │     │     │     │     │  1  │\n  │     │     │     │     │     │     │     │\n  ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤\n  │  2  │  3  │  4  │  5  │  6  │  7  │  8  │\n  │     │     │     │     │     │     │     │\n  ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤\n  │  9  │ 10  │ 11  │ 12  │ 13  │ 14  │ 15  │\n  │     │     │     │     │     │     │     │\n  ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤\n  │ 16  │ 17  │ 18  │ 19  │ 20  │ 21  │ 22  │\n  │     │     │     │     │     │     │     │\n  ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤\n  │ 23  │ 24  │ 25  │ 26  │ 27  │ 28  │ 29  │\n  │     │     │     │     │     │     │     │\n  ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤\n  │ 30  │ 31  │     │     │     │     │     │\n  │     │     │     │     │     │     │     │\n  └─────┴─────┴─────┴─────┴─────┴─────┴─────┘" },
        x: 40, y: 440, width: 700, height: 480,
      },
      {
        type: "note",
        content: { text: "## Key Dates\n• Post shoot:\n• Edit review:\n• Client approval:\n• First post:\n• Campaign end:" },
        x: 770, y: 440, width: 220, height: 210,
      },
      {
        type: "todo",
        content: { items: ["Write captions for Week 1", "Schedule photo shoots", "Prepare story templates", "Confirm client approvals", "Review analytics"] },
        x: 770, y: 680, width: 220, height: 240,
      },
      {
        type: "note",
        content: { text: "## Hashtags\nPrimary:\nSecondary:\nBranded:\nKeywords:" },
        x: 40, y: 950, width: 260, height: 170,
      },
    ],
  },
  {
    id: "schedule-budget",
    name: "Schedule & Budget",
    description: "Shoot day schedule with call times, equipment, and line-item budget",
    icon: "clock",
    cards: [
      {
        type: "heading",
        content: { text: "Schedule & Budget" },
        x: 40, y: 40, width: 480, height: 70,
      },
      {
        type: "heading",
        content: { text: "Shoot Schedule" },
        x: 40, y: 140, width: 300, height: 50,
      },
      {
        type: "note",
        content: { text: "## Day 1\nDate:\nCall time:\nWrap time:\nLocation:\n\nEquipment needed:\n\nNotes / Parking / Permits:" },
        x: 40, y: 210, width: 300, height: 260,
      },
      {
        type: "note",
        content: { text: "## Day 2\nDate:\nCall time:\nWrap time:\nLocation:\n\nEquipment needed:\n\nNotes / Parking / Permits:" },
        x: 360, y: 210, width: 300, height: 260,
      },
      {
        type: "note",
        content: { text: "## Day 3\nDate:\nCall time:\nWrap time:\nLocation:\n\nEquipment needed:\n\nNotes / Parking / Permits:" },
        x: 680, y: 210, width: 300, height: 260,
      },
      {
        type: "heading",
        content: { text: "Budget" },
        x: 40, y: 510, width: 200, height: 50,
      },
      {
        type: "note",
        content: { text: "## Crew\n• Photographer:\n• Assistant:\n• MUA:\n• Stylist:\n\n## Equipment\n• Camera body:\n• Lenses:\n• Lighting:\n• Grip:" },
        x: 40, y: 580, width: 280, height: 260,
      },
      {
        type: "note",
        content: { text: "## Location & Travel\n• Studio rental:\n• Permits:\n• Travel:\n• Catering:\n\n## Post Production\n• Editing:\n• Color grading:\n• Retouching:" },
        x: 340, y: 580, width: 280, height: 260,
      },
      {
        type: "note",
        content: { text: "## Budget Totals\nEstimated:\nActual:\n\nKey:\n🟡 Under budget\n🔴 Over budget" },
        x: 640, y: 580, width: 280, height: 200,
      },
      {
        type: "todo",
        content: { items: ["Book crew", "Rent equipment", "Confirm locations", "Arrange catering", "Process invoices"] },
        x: 640, y: 810, width: 280, height: 200,
      },
    ],
  },
  {
    id: "proof-sheet",
    name: "Client Proof Sheet",
    description: "Client-facing presentation layout with shot review and status indicators",
    icon: "eye",
    cards: [
      {
        type: "heading",
        content: { text: "Client Proof Sheet" },
        x: 40, y: 40, width: 480, height: 70,
      },
      {
        type: "note",
        content: { text: "## Project\nClient:\nShoot date:\nDelivery:\nStatus:" },
        x: 40, y: 140, width: 260, height: 170,
      },
      {
        type: "color",
        content: { color: "#2f6a80" },
        x: 320, y: 140, width: 80, height: 80,
      },
      {
        type: "note",
        content: { text: "✅ Got it ✅" },
        x: 320, y: 230, width: 80, height: 80,
      },
      {
        type: "color",
        content: { color: "#4a2429" },
        x: 420, y: 140, width: 80, height: 80,
      },
      {
        type: "note",
        content: { text: "❌ Flagged ❌" },
        x: 420, y: 230, width: 80, height: 80,
      },
      {
        type: "note",
        content: { text: "## Shot 01 \nType: Wide\nLens:\nStatus: ⬜ Pending" },
        x: 40, y: 340, width: 200, height: 150,
      },
      {
        type: "note",
        content: { text: "## Shot 02 \nType: Medium\nLens:\nStatus: ✅ Got it" },
        x: 270, y: 340, width: 200, height: 150,
      },
      {
        type: "note",
        content: { text: "## Shot 03 \nType: Close-up\nLens:\nStatus: ❌ Flag" },
        x: 500, y: 340, width: 200, height: 150,
      },
      {
        type: "note",
        content: { text: "## Shot 04 \nType: Wide\nLens:\nStatus: ⬜ Pending" },
        x: 730, y: 340, width: 200, height: 150,
      },
      {
        type: "note",
        content: { text: "## Shot 05 \nType: Macro\nLens:\nStatus: ✅ Got it" },
        x: 40, y: 520, width: 200, height: 150,
      },
      {
        type: "note",
        content: { text: "## Shot 06 \nType: POV\nLens:\nStatus: ⬜ Pending" },
        x: 270, y: 520, width: 200, height: 150,
      },
      {
        type: "note",
        content: { text: "## Notes & Revisions\n\nClient feedback:\n\nSelected shots:\n\nRe-shoot needed:" },
        x: 500, y: 520, width: 340, height: 200,
      },
      {
        type: "todo",
        content: { items: ["Send proof sheet to client", "Review selections", "Process selects", "Deliver final files"] },
        x: 730, y: 520, width: 280, height: 200,
      },
    ],
  },
];
