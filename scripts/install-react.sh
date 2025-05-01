# Initialize React Frontend

# Create React app with Vite
npm create vite@latest resources/js/admin -- --template react

# Install required dependencies
cd resources/js/admin
npm install

# Install routing and utilities
npm install react-router-dom@6 axios dayjs react-icons
npm install react-quill @headlessui/react
npm install react-beautiful-dnd chart.js react-chartjs-2

# Install Tailwind CSS and dependencies
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Create Tailwind CSS config file
cat > tailwind.config.js << EOL
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOL

# Create PostCSS config
cat > postcss.config.js << EOL
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOL

# Create Tailwind CSS directives file
cat > src/index.css << EOL
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .btn {
    @apply px-4 py-2 rounded font-medium focus:outline-none focus:ring-2 focus:ring-offset-2;
  }

  .btn-primary {
    @apply bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500;
  }

  .btn-secondary {
    @apply bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500;
  }

  .btn-success {
    @apply bg-green-600 text-white hover:bg-green-700 focus:ring-green-500;
  }

  .btn-danger {
    @apply bg-red-600 text-white hover:bg-red-700 focus:ring-red-500;
  }

  .form-input {
    @apply mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500;
  }

  .form-label {
    @apply block text-sm font-medium text-gray-700;
  }

  .card {
    @apply bg-white rounded-lg shadow p-6;
  }
}
EOL

# Create folders structure
mkdir -p src/components/layout
mkdir -p src/components/common
mkdir -p src/components/forms
mkdir -p src/components/pageBuilder
mkdir -p src/components/media
mkdir -p src/components/tables
mkdir -p src/pages/dashboard
mkdir -p src/pages/auth
mkdir -p src/pages/pages
mkdir -p src/pages/components
mkdir -p src/pages/forms
mkdir -p src/pages/media
mkdir -p src/pages/settings
mkdir -p src/pages/themes
mkdir -p src/pages/menus
mkdir -p src/pages/plugins
mkdir -p src/store
mkdir -p src/hooks
mkdir -p src/api
mkdir -p src/utils
mkdir -p src/assets

# Return to project root
cd ../../../
