#!/bin/bash

# Generate index.html for all projects in public directory
PUBLIC_DIR="public"
INDEX_FILE="$PUBLIC_DIR/index.html"

# Start HTML document
cat > "$INDEX_FILE" << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vibe Coding Lab • Projects</title>
  <link rel="icon" href="data:,">
  <style>
    body {
      color: #202020;
      font-size: 1.25em;
      line-height: 1.3;
      max-width: 100%;
      margin: 1.2em;
    }

    @media (min-width: 1024px) {
      body {
        max-width: 36em;
      }
    }

    a,
    a:hover,
    a:visited {
      color: #303030;
    }

    a:hover {
      text-decoration: none;
    }

    .description {
        margin-left: 2em;
        margin-bottom: 2em;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎨 Vibe Coding Lab</h1>
    <div class="projects-grid">
    <h2>list of works</h2>
EOF

# Find all directories in public (excluding . and ..)
for project_dir in "$PUBLIC_DIR"/*; do
  if [ -d "$project_dir" ]; then
    project_name=$(basename "$project_dir")
    index_file="$project_dir/index.html"
    
    if [ -f "$index_file" ]; then
      # Extract title from HTML file
      title=$(grep -i '<title>' "$index_file" | head -1 | sed 's/<[^>]*>//g' | xargs)
      
      # If no title found, use directory name
      if [ -z "$title" ]; then
        title="$project_name"
      fi
      
      # Check for README.md and extract copyright
      readme_file="$project_dir/README.md"
      copyright=""
      if [ -f "$readme_file" ]; then
        copyright=$(grep "^(c)" "$readme_file" | head -1)
      fi
      
      # Add project card to index
      cat >> "$INDEX_FILE" << EOF
      <div class="project-card">
        <a href="$project_name/" target="_blank">
            <h3>$title</h3>
        </a>
        <div class="description">
            <p>Project: $project_name</p>
            $(if [ -n "$copyright" ]; then echo "<p>$copyright</p>"; fi)
        </div>
      </div>
EOF
    fi
  fi
done

# Close HTML document
cat >> "$INDEX_FILE" << 'EOF'
    </div>
    <div class="footer">
      <p>Generated automatically • Vibe Coded Projects</p>
    </div>
  </div>
</body>
</html>
EOF

echo "Generated index.html with $(find "$PUBLIC_DIR" -maxdepth 1 -type d | wc -l | xargs) projects"