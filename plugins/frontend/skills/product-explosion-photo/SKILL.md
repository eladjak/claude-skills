---
name: product-explosion-photo
description: Create viral "product explosion" photos on solid black background - the trending food/product photography style
triggers:
  - product explosion
  - פיצוץ מוצר
  - תמונת פיצוץ
  - explosion photo
  - food explosion
  - תמונת אוכל
  - viral food photo
  - black background product
---

# Product Explosion Photo Generator

## What Is This?

A viral photography trend where products/food appear as an "explosion" of their ingredients/components on a solid black background (#000000). Professional photoshoot style. Simple prompt, stunning results.

## Backend: nano-banana-pro

This skill delegates all image generation to the **nano-banana-pro** skill, which wraps Google's Gemini image generation API.

- **Script:** `~/.claude/skills/nano-banana-pro/scripts/generate_poster.ts`
- **API Key:** `~/.claude/skills/nano-banana-pro/scripts/.env` (requires `GEMINI_API_KEY`)
- **Output:** `poster_0.jpg` in the scripts directory (copy/rename as needed)
- **Model:** Gemini (via `@google/genai` SDK)

> If the API key is missing or expired, check `~/.claude/skills/nano-banana-pro/scripts/.env`.
> See `~/.claude/skills/nano-banana-pro/SKILL.md` for full API reference and options.

## The Core Prompt Template

```
צור תמונה של [PRODUCT_DESCRIPTION] על רקע שחור סולידי (#000000), בסגנון צילום מקצועי, professional photoshoot, בלי אביזרים ברקע. תוסיף פירוט של כל מרכיב בצורה שתיראה כמו "פיצוץ" של המרכיבים.
```

## How to Generate

### Using nano-banana-pro (the ONLY backend):
```bash
cd ~/.claude/skills/nano-banana-pro/scripts

# Food example - Falafel
node --loader ts-node/esm generate_poster.ts "צור תמונה של מנת פלאפל ישראלי מגרה ועמוסה בסלטים, עם טחינה ועמבה על רקע שחור סולידי (#000000), בסגנון צילום מקצועי, professional photoshoot, בלי אביזרים ברקע. תוסיף פירוט של כל מרכיב בצורה שתיראה כמו פיצוץ של המרכיבים"

# Tech product example
node --loader ts-node/esm generate_poster.ts "צור תמונה של מחשב נייד מודרני על רקע שחור סולידי (#000000), בסגנון צילום מקצועי, professional photoshoot, בלי אביזרים ברקע. תוסיף פירוט של כל רכיב פנימי (מעבד, RAM, SSD, מאוורר, מקלדת) בצורה שתיראה כמו פיצוץ של הרכיבים"

# Copy output to your project
cp poster_0.jpg ~/projects/my-project/public/product-explosion.jpg

# Aspect ratios (passed to nano-banana-pro):
# --aspect 1:1  → Instagram square
# --aspect 9:16 → Instagram story/reel
# --aspect 16:9 → YouTube thumbnail
# --aspect 3:2  → Default horizontal
```

### With reference image (style matching):
```bash
cd ~/.claude/skills/nano-banana-pro/scripts
node --loader ts-node/esm generate_poster.ts --assets "/path/to/reference.jpg" "Create product explosion in the same style as the reference, solid black background #000000, professional photoshoot"
```

## Popular Product Categories

### Food (Israeli)
| Product | Hebrew Prompt Addition |
|---------|----------------------|
| פלאפל | מנת פלאפל ישראלי מגרה ועמוסה בסלטים, עם טחינה ועמבה |
| שווארמה | מנת שווארמה עם כל התוספות - חומוס, טחינה, חמוצים, צ'יפס |
| חומוס | צלחת חומוס עם גרגרי חומוס, שמן זית, פפריקה, פטרוזיליה |
| שקשוקה | שקשוקה עם ביצים, עגבניות, פלפלים, בצל, תבלינים |
| בורקס | בורקס עם גבינות, תפוח אדמה, פטריות וביצה קשה |

### Tech Products
| Product | English Prompt Addition |
|---------|----------------------|
| Laptop | modern laptop with all internal components exploding outward |
| Smartphone | smartphone with screen, battery, camera module, chips |
| Keyboard | mechanical keyboard with keycaps, switches, PCB floating |
| Headphones | headphones with drivers, cushions, frame disassembled |

### Other Categories
- Cosmetics: makeup products with powders and pigments exploding
- Drinks: cocktail with ice, fruits, liquids splashing
- Fashion: shoe with sole, fabric, laces deconstructed

## Tips for Best Results
1. **Always specify #000000** - pure black background is key
2. **"Professional photoshoot"** - triggers high-quality lighting
3. **"בלי אביזרים ברקע"** - keeps it clean
4. **Detail every component** - the more specific, the better the explosion
5. **Add a reference image** with `--assets` flag for style matching
6. **Use 1:1 for Instagram** - `--aspect 1:1` looks best for social posts

## Content Strategy Integration
- Use for social media posts (Instagram, Facebook, LinkedIn)
- Perfect for food blogs, restaurant marketing
- Product launch announcements
- E-commerce product photography
- Course/tutorial thumbnails (ironic - people sell courses for this one prompt!)

## Error Handling Policies
- **If background isn't pure black:** add "pure solid black background, no gradients, no textures" to the prompt
- **If explosion isn't dramatic enough:** add "dramatic deconstructed view, floating ingredients, cinematic lighting"
- **If too cluttered:** reduce number of components described
- **If API key error:** check `~/.claude/skills/nano-banana-pro/scripts/.env` has valid `GEMINI_API_KEY`
- **If script not found:** run `cd ~/.claude/skills/nano-banana-pro/scripts && npm install` to reinstall deps
- **If output is 0 bytes:** retry once; Gemini occasionally returns empty responses

## Success Criteria
- Background is pure black (#000000)
- All components are visible and "floating"
- Professional lighting with dramatic shadows
- No extra props or background elements
- Output file > 0 bytes and looks appetizing/impressive

## Related Skills
- `ai-film-production` - Full film pipeline (also uses nano-banana-pro for frame generation)
