# Interactive 10x10 Canopy Tent Configurator

A high-performance, reusable product customization platform built to satisfy the technical assessment requirements. This application provides a synchronized 2D control panel and interactive 3D preview engine, built with dynamic pricing architecture and ready for seamless Shopify integration.

## 🚀 Live Demo & Repository
*   **Live Production URL:** [Insert your Vercel deployment link here]
*   **Repository URL:** [Insert your GitHub/GitLab link here]

---

## 🛠️ Architecture & Core Tech Stack Breakdown

This application is built using a modern, scalable front-end architecture designed for real-time web experiences. Below is an overview of the key libraries chosen and the technical reasoning behind them:

| Technology | Role in System | Why It Was Chosen (Engineering Rationale) |
| :--- | :--- | :--- |
| **React + TypeScript** | Core UI & Type Safety | Provides absolute predictive type-safety over the product configuration states (`TentConfiguration`). Ensures layout components fail at compile-time rather than runtime when schema mutations occur. |
| **@react-three/fiber** | 3D Render Engine | A React wrapper for Three.js. It brings a declarative paradigm to 3D scenes. This allows the 3D tent models to naturally bind to React states, treating meshes, materials, and textures like standard reactive DOM elements. |
| **@react-three/drei** | 3D Utilities | Provides pre-optimized hooks and abstractions (like `<OrbitControls />` and texture loaders). This minimizes manual boilerplate for lighting setups, camera controls, and texture canvas mapping. |
| **@react-pdf/renderer** | Document Generation | Generates client-side Vector PDFs directly from the React component state. Bypasses the need for heavy, expensive backend PDF generation microservices while maintaining formatting integrity. |
| **React Context API** | Central State Synchronization | Coordinates asynchronous price calculation calls and bridges real-time updates between the 2D layout settings and 3D canvas textures smoothly without deep prop-drilling. |

---

## ⚙️ Key Technical Decisions & System Designs

### 1. Unified Configuration Schema (2D/3D Synchronization)
Instead of running separate state tracking for the 2D configuration form and the 3D rendering pipeline, the system relies on a single **Source of Truth** state tree (`TentConfiguration`). 
* When a user changes a color or drops a custom element into a 2D panel, it alters this single data contract.
* The 3D Canvas element automatically re-renders dynamically because it reads from the exact same reactive boundary.

### 2. Extensible Product Decoupling (Reusability)
To ensure the configurator can easily scale to other items (e.g., custom tablecloths or custom flags), the sections are designed as dynamic data objects:
```typescript
export type ProductSection = 'roof' | 'frontValance' | 'leftWall' | 'rightWall';
export type Record<ProductSection, SectionConfig>;
```
Swapping the underlying 3D structure or adding options to other models requires only changing the structural configuration schema, without altering the underlying core business state machine or Shopify connectors.

### 3. Server-First Dynamic Pricing Architecture
To prevent front-end security exploits where users could manipulate checkout values via the console browser, the **Pricing Engine** is abstracted out into a standalone asynchronous service layer. It acts exactly like a backend REST endpoint:
* It reads the entire configuration object layout.
* It calculates printing surcharges based on asset counts and variant parameters.
* It computes values securely on request, satisfying the real-world Shopify checkout design constraint.

### 4. Shopify Bridge Ready
When "Add to Cart" is invoked, the platform passes the final dynamic pricing details along with a serialized state object into custom Shopify cart line-item properties (`_configData`). This allows downstream applications or backend webhooks to fetch and verify configuration specifications effortlessly.

---

## 💻 Local Installation & Setup

1. **Clone the project repository:**
   ```bash
   git clone <your-repository-url>
   cd tent-configurator
   ```

2. **Install all framework dependencies:**
   ```bash
   npm install
   ```

3. **Spin up the local developer environment:**
   ```bash
   npm run dev
   ```

4. **Compile the production application build:**
   ```bash
   npm run build
   ```
# tent-configurator # tent-configurator # tent-configurator
# tent-configurator
