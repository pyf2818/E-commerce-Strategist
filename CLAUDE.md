# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**vibe-coding-shopping** is a Vue 3 TypeScript e-commerce assistant application (电商军师) that provides AI-powered content generation, image/video creation, and knowledge management tools. The application supports multiple AI providers including OpenAI, DeepSeek, Zhipu (智谱), Qwen (通义千问), SiliconFlow, and custom endpoints.

## Tech Stack

- **Frontend Framework**: Vue 3 (Composition API) with TypeScript
- **Build Tool**: Vite 5.x with Vue plugin
- **State Management**: Pinia 2.x with `pinia-plugin-persistedstate` (localStorage persistence)
- **Routing**: Vue Router 4 (lazy-loaded route components)
- **Styling**: Tailwind CSS 3.4 + PostCSS + Autoprefixer
- **AI Integration**: Multi-provider AI service with streaming support
- **Linting**: ESLint 8.x with TypeScript and Vue plugins
- **Type System**: TypeScript 5.3 in strict mode

## Core Architecture

### Application Structure

```
src/
├── components/
│   ├── common/              - ParticleBackground, ModelSelector
│   └── layout/              - AppLayout, AppSidebar, AppHeader
├── views/                   - Page components (lazy-loaded by router)
│   ├── HomeView.vue         - Dashboard/home page
│   ├── ContentCreatorView.vue - AI content generation
│   ├── AIAssistantView.vue  - Chat interface
│   ├── ImageGenView.vue     - Image generation
│   ├── VideoGenView.vue     - Video generation
│   ├── KnowledgeView.vue    - Knowledge base
│   ├── ToolsView.vue        - Utility tools
│   ├── TemplatesView.vue    - Template library
│   ├── HistoryView.vue      - Content history
│   ├── SettingsView.vue     - AI provider configuration
│   └── NotFoundView.vue     - 404 page
├── stores/                  - Pinia state stores
│   ├── ai.ts                - AI config & service factory (central)
│   ├── content.ts           - Content history & favorites
│   └── theme.ts             - Light/dark theme management
├── services/                - Business logic
│   ├── ai.ts                - Multi-provider AI service
│   └── prompts.ts           - System prompt templates
├── router/                  - Vue Router configuration
├── types/                   - TypeScript definitions
│   ├── ai.ts                - AI provider types & configs
│   └── content.ts           - Content type definitions
├── assets/                  - Static assets (main.css)
├── main.ts                  - App bootstrap
└── App.vue                  - Root component with layout & transitions
```

### Key Design Patterns

#### 1. Multi-Provider AI Service (`src/services/ai.ts`)

The `AIService` class abstracts AI provider differences:
- **Text chat**: OpenAI-compatible, Zhipu, Qwen, Custom formats
- **Image generation**: DALL-E, CogView, Wanx, SiliconFlow
- **Video generation**: CogVideoX, Wanx, SiliconFlow
- **Streaming**: Supported for OpenAI-compatible and Zhipu APIs
- **Factory pattern**: `createAIService()` creates configured instances
- **Provider-specific methods**: Each provider has dedicated API handling

#### 2. Centralized AI Configuration (`src/stores/ai.ts`)

The AI store is the single source of truth for AI configuration:
- Manages three separate model configs: `text`, `image`, `video`
- Each config tracks provider, API key, base URL, model, and enabled state
- **Provider-specific API key storage**: Keys stored per-provider, not per-model
- **Service caching**: Caches `AIService` instances per model type
- **Persistence**: Config saved to localStorage via Pinia plugin
- Methods: `setProvider()`, `setApiKey()`, `setBaseUrl()`, `setModel()`, `getService()`

#### 3. Content Store (`src/stores/content.ts`)

- Stores generated content history with computed filters
- Tracks favorites as a `Set<string>` for O(1) lookup
- Computed properties: `recentContents`, `favoriteContents`, `contentsByType`
- Full persistence to localStorage with custom serializer

#### 4. Layout System

- `AppLayout.vue`: Root layout wrapper with `<slot>` for content
- `AppSidebar.vue`: Navigation sidebar (collapsible on mobile)
- `AppHeader.vue`: Top header with theme toggle and user menu
- Page transitions defined in `App.vue` (`.page-enter-active`, etc.)

## Common Development Tasks

### Development Commands

```bash
# Start Vite dev server (port 3000, auto-opens browser)
npm run dev

# Type-check only (no build) - fast for pre-commit
npm run type-check

# Build for production (runs vue-tsc type-check first)
npm run build
# Output: dist/ directory

# Preview production build locally
npm run preview

# Lint and auto-fix
npm run lint
```

### Running Individual Tests

**Note**: No testing framework is currently configured. Recommended setup would use Vitest with Vue Test Utils. If adding tests:

```bash
# Example future setup (not yet implemented)
npm run test          # Run all tests
npm run test:unit     # Run unit tests
npm run test:e2e      # Run E2E tests
npm run test:coverage  # Generate coverage report
```

### Working with AI Providers

All AI provider configuration is in the Settings page (`/settings`):
- Each model type (text/image/video) has independent provider selection
- API keys are stored per-provider; switching providers preserves saved keys
- Base URLs can be customized for self-hosted endpoints

**Adding a new provider**:
1. Add provider enum value in `src/types/ai.ts`
2. Add default config in `TEXT_PROVIDER_DEFAULTS` / `IMAGE_PROVIDER_DEFAULTS` / `VIDEO_PROVIDER_DEFAULTS`
3. Implement API method in `AIService` class
4. Add case in `chat()` / `generateImage()` / `generateVideo()` switch statements
5. Update Settings UI to show new provider option

### Working with Views

To add a new view:
1. Create `src/views/NewView.vue` (extends standard `<script setup lang="ts">`)
2. Add route in `src/router/index.ts`:
   ```ts
   {
     path: '/new-view',
     name: 'NewView',
     component: () => import('@/views/NewView.vue'),
     meta: { title: '新页面' }
   }
   ```
3. Add navigation item in `src/components/layout/AppSidebar.vue` if needed

### Working with State (Pinia)

Define stores using the Composition API pattern (as seen in `src/stores/*.ts`):
```ts
export const useMyStore = defineStore('store-name', () => {
  const state = ref<Type>(initialValue)
  const computed = computed(() => { ... })

  const action = (param: Type) => { ... }

  return { state, computed, action }
}, {
  persist: { key: 'my-store', storage: localStorage, paths: ['state'] }
})
```

## Important Configuration Files

- `vite.config.ts`: Vite config with `@` path alias, port 3000, auto-open, production sourcemap disabled
- `tsconfig.json`: Strict TypeScript with path mapping `@/*` → `src/*`
- `tailwind.config.js`: Custom primary/success/warning/danger colors + animations
- `.eslintrc.cjs`: ESLint for Vue 3 + TypeScript with relaxed multi-word component names
- `postcss.config.js`: PostCSS with Autoprefixer

## CORS and API Access

The app makes direct browser-to-API calls. **CORS can block requests** in development:
- **DeepSeek** API works without CORS issues in browser
- For other providers, either:
  - Install browser extension "Allow CORS" or "CORS Unblock"
  - Configure `CORS_PROXY` in `src/services/ai.ts:8`
  - Use a backend proxy in production

## TypeScript Guidelines

- **Strict mode**: All checks enabled (`strict: true`, `noUnusedLocals`, `noUnusedParameters`)
- **Path alias**: Use `@/` for imports from `src/` (e.g., `import { useStore } from '@/stores'`)
- **Component props**: Prefer `defineProps<Type>()` with TypeScript interfaces
- **Store types**: Import from `@/types` for shared interfaces

## Styling Conventions

- **Tailwind-first**: Use Tailwind utility classes for layout and styling
- **Custom colors**: Use `primary-*`, `success-*`, `warning-*`, `danger-*` from config
- **Dark mode**: `dark:` variants enabled (`darkMode: 'class'` in tailwind config)
- **Animations**: Use `fade-in`, `slide-up` from Tailwind config
- **Component styles**: Use `<style>` block with scoped or global CSS only when Tailwind insufficient

## Code Quality Standards

From the user's global rules (see `~/.claude/rules/`):
- **Immutability**: Always create new objects, never mutate
- **Error handling**: Comprehensive try-catch; user-friendly messages in UI, detailed logs on server
- **Input validation**: Schema-based with Zod for forms; never trust external data
- **Security**: No hardcoded secrets; validate all user input; use parameterized queries (if backend existed)
- **File size**: Keep files 200-400 lines typically, max 800 lines

## Known Technical Debt & Limitations

1. **No testing framework** - Vitest/Playwright should be added
2. **CORS issues** - Production needs proper proxy or backend
3. **No error boundaries** - View-level errors crash the app
4. **No loading states** - Some async operations lack visual feedback
5. **No request cancellation** - Long-running AI calls cannot be aborted
6. **No retry logic** - Failed API calls don't retry automatically
7. **No rate limiting** - API rate limits not handled
8. **No i18n** - Hardcoded Chinese strings; needs internationalization
9. **No offline support** - No service worker or PWA features

## Key Files to Understand First

1. `src/main.ts` - App creation & plugin setup
2. `src/App.vue` - Layout wrapper with page transitions
3. `src/stores/ai.ts` - Central AI service factory and configuration
4. `src/services/ai.ts` - Multi-provider API client implementation
5. `src/types/ai.ts` - TypeScript types and default configurations
6. `src/router/index.ts` - Route definitions and navigation guards
7. `vite.config.ts` - Build configuration and path aliases

## Environment Configuration

- **Development**: `npm run dev` → http://localhost:3000
- **Production build**: `npm run build` → `dist/` directory
- **Node version**: Check `package.json` `engines` field if present; else use Node 18+
- **No .env file** - API keys stored in browser localStorage, not environment variables

## Git Workflow

Follow conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`
Pre-commit hooks not configured; consider adding `lint-staged`.

---

**Claude Code Notes**:
- This is a frontend-only Vue SPA; no backend exists
- All AI calls are made from browser directly (CORS considerations critical)
- State is persisted via localStorage; sensitive API keys stored client-side
- Always validate TypeScript types; the project uses strict mode
- When modifying AI service, ensure all provider branches remain functional
