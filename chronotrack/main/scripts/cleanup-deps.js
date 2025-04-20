// This script helps clean up unused dependencies
// Run with: node scripts/cleanup-deps.js

const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

// List of dependencies to remove based on depcheck output
const unusedDeps = [
  "@hookform/resolvers",
  "@radix-ui/react-accordion",
  "@radix-ui/react-alert-dialog",
  "@radix-ui/react-aspect-ratio",
  "@radix-ui/react-avatar",
  "@radix-ui/react-checkbox",
  "@radix-ui/react-collapsible",
  "@radix-ui/react-context-menu",
  "@radix-ui/react-dialog",
  "@radix-ui/react-dropdown-menu",
  "@radix-ui/react-hover-card",
  "@radix-ui/react-label",
  "@radix-ui/react-menubar",
  "@radix-ui/react-navigation-menu",
  "@radix-ui/react-popover",
  "@radix-ui/react-progress",
  "@radix-ui/react-radio-group",
  "@radix-ui/react-scroll-area",
  "@radix-ui/react-select",
  "@radix-ui/react-separator",
  "@radix-ui/react-slider",
  "@radix-ui/react-slot",
  "@radix-ui/react-switch",
  "@radix-ui/react-tabs",
  "@radix-ui/react-toast",
  "@radix-ui/react-toggle",
  "@radix-ui/react-toggle-group",
  "@radix-ui/react-tooltip",
  "autoprefixer",
  "class-variance-authority",
  "clsx",
  "cmdk",
  "critters",
  "date-fns",
  "embla-carousel-react",
  "input-otp",
  "next-themes",
  "react-day-picker",
  "react-hook-form",
  "react-resizable-panels",
  "recharts",
  "sonner",
  "tailwind-merge",
  "use-sound",
  "vaul",
  "zod",
]

// Read package.json
const packageJsonPath = path.join(process.cwd(), "package.json")
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"))

// Remove unused dependencies
unusedDeps.forEach((dep) => {
  if (packageJson.dependencies && packageJson.dependencies[dep]) {
    delete packageJson.dependencies[dep]
    console.log(`Removed dependency: ${dep}`)
  }
  if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
    delete packageJson.devDependencies[dep]
    console.log(`Removed dev dependency: ${dep}`)
  }
})

// Write updated package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
console.log("Updated package.json")

console.log("\nTo complete the cleanup, run:")
console.log("npm install")
console.log("npm prune")
